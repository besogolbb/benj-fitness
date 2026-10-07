const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const crypto=require('node:crypto');
const {createApp}=require('./server.cjs');
const motion=require('./motion.js');
const exercises=require('./exercise-library.js');
const journal=()=>({version:1,profile:{name:'Benj',calories:2000,protein:100,steps:8000,water:2000},days:{}});
async function fixture(t,key=crypto.randomBytes(32).toString('hex')){
  const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'benj-fitness-test-'));
  const app=createApp({key,dataDir,publicOrigin:'https://fitness.benedictjan.com'});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  t.after(async()=>{await new Promise(resolve=>app.close(resolve));assert.ok(path.resolve(dataDir).startsWith(path.join(os.tmpdir(),'benj-fitness-test-')));await fs.rm(dataDir,{recursive:true,force:true});});
  const base=`http://127.0.0.1:${app.address().port}`;
  const request=(method='GET',body,revision=0)=>fetch(base+'/api/journal',{method,headers:{Authorization:`Bearer ${key}`,...(method==='PUT'?{'Content-Type':'application/json','If-Match':`"${revision}"`}:{})},body:body?JSON.stringify(body):undefined});
  return {base,key,request,dataDir};
}
test('private journal authentication, validation, revision safety and backups',async t=>{
  const f=await fixture(t);
  assert.equal((await fetch(f.base+'/api/journal')).status,401);
  assert.equal((await fetch(f.base+'/.private-data/journal.json')).status,404);
  assert.equal((await fetch(f.base+'/server.cjs')).status,404);
  assert.equal((await f.request('PUT',{})).status,400);
  assert.equal((await f.request()).headers.get('etag'),'"0"');
  const j=journal();j.profile.name='Benj ✓';
  assert.equal((await f.request('PUT',j)).status,200);
  assert.equal((await f.request('PUT',j)).status,409);
  assert.equal((await (await f.request()).json()).journal.profile.name,'Benj ✓');
  const responses=await Promise.all([f.request('PUT',j,1),f.request('PUT',j,1)]);
  assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
  assert.ok((await fs.readdir(f.dataDir)).includes('backup-1.json'));
  const onDisk=JSON.parse(await fs.readFile(path.join(f.dataDir,'journal.json'),'utf8'));
  assert.equal(onDisk.revision,2);
  assert.equal((await fetch(f.base+'/api/journal',{headers:{Authorization:`Bearer ${f.key}`,Origin:'https://another-site.test'}})).status,403);
  j.days['2026-10-07']={food:[],cardio:[],steps:10000,water:2000,weight:75,sleep:7,notes:'',workout:{type:'Library validation',ids:Object.keys(exercises),minutes:45,burn:150,sets:Object.fromEntries(Object.keys(exercises).map(id=>[id,[{weight:'5',reps:exercises[id].unit==='seconds'?'30':'10',done:true}]]))}};
  assert.equal((await f.request('PUT',j,2)).status,200,'All 23 exercise IDs must be accepted by server storage');
  assert.equal((await (await f.request()).json()).journal.days['2026-10-07'].workout.ids.length,23);
});
test('storage stays disabled without a configured strong key',async t=>{const f=await fixture(t,'');assert.equal((await f.request()).status,503);});
test('all 3D exercises preserve limb lengths and stable squat/hinge footing',()=>{
  const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
  for(const id of motion.ids)for(let step=0;step<32;step++){
    const pose=motion.pose(id,step/32*Math.PI*2);
    for(let side=0;side<2;side++){
      assert.ok(Math.abs(distance(pose.shoulders[side],pose.arms[side].middle)-motion.lengths.arm[0])<0.0001,`${id}: upper arm length`);
      assert.ok(Math.abs(distance(pose.arms[side].middle,pose.arms[side].end)-motion.lengths.arm[1])<0.0001,`${id}: forearm length`);
      assert.ok(Math.abs(distance(pose.hips[side],pose.legs[side].middle)-motion.lengths.leg[0])<0.0001,`${id}: thigh length`);
      assert.ok(Math.abs(distance(pose.legs[side].middle,pose.legs[side].end)-motion.lengths.leg[1])<0.0001,`${id}: shin length`);
      if(['squat','rdl'].includes(id))assert.ok(distance(pose.legs[side].end,motion.pose(id,0).legs[side].end)<0.0001,`${id}: planted feet`);
    }
  }
  assert.ok(motion.pose('rdl',Math.PI).tilt>motion.pose('squat',Math.PI).tilt,'Hinge and squat must have distinct trunk mechanics');
});
