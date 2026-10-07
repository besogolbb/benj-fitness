const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const exercises=require('./exercise-library.js');
const PUBLIC_FILES=new Set(['index.html','style.css','app.js','exercise-library.js','fitness.js','motion.js','coach3d.js','cloud.js','assets/vendor.js','assets/gym.jpg']);
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg'};
function validateJournal(journal){
  if(!journal||journal.version!==1||!journal.profile||typeof journal.profile.name!=='string'||journal.profile.name.length>100||!journal.days||Array.isArray(journal.days)||typeof journal.days!=='object')throw new Error('Invalid journal');
  for(const key of ['calories','protein','steps','water'])if(!Number.isFinite(journal.profile[key])||journal.profile[key]<=0)throw new Error('Invalid goals');
  for(const [date,d] of Object.entries(journal.days)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!d||!Array.isArray(d.food)||!Array.isArray(d.cardio))throw new Error('Invalid daily records');
    for(const key of ['weight','sleep','steps','water'])if(d[key]!==''&&(!Number.isFinite(d[key])||d[key]<0))throw new Error('Invalid check-in');
    for(const f of d.food)if(typeof f.name!=='string'||!['calories','protein','carbs','fat'].every(k=>Number.isFinite(f[k])&&f[k]>=0)||!validId(f.id))throw new Error('Invalid meal');
    for(const c of d.cardio)if(typeof c.name!=='string'||!validId(c.id)||!['minutes','burn','distance'].every(k=>Number.isFinite(c[k])&&c[k]>=0))throw new Error('Invalid cardio');
    if(d.workout){const w=d.workout;if(!Array.isArray(w.ids)||w.ids.some(id=>!Object.hasOwn(exercises,id))||!w.sets||typeof w.type!=='string'||!Number.isFinite(w.burn)||w.burn<0||!Number.isFinite(w.minutes)||w.minutes<0)throw new Error('Invalid workout');for(const id of w.ids)if(!Array.isArray(w.sets[id])||w.sets[id].length>10||w.sets[id].some(s=>!s||!['weight','reps'].every(k=>['string','number'].includes(typeof s[k])&&(s[k]===''||Number.isFinite(Number(s[k]))&&Number(s[k])>=0))))throw new Error('Invalid sets');}
  }
  return journal;
}
function validId(id){return typeof id==='string'&&/^[a-f0-9-]{36}$/i.test(id);}
function createApp({key=process.env.FITNESS_ACCESS_KEY||'',dataDir=process.env.FITNESS_DATA_DIR||path.join(__dirname,'.private-data'),publicOrigin=process.env.PUBLIC_ORIGIN||''}={}){
  const configured=key.length>=32&&!key.startsWith('REPLACE_');
  const filename=path.join(dataDir,'journal.json');let queue=Promise.resolve();
  const failures=new Map();
  async function read(){try{return JSON.parse(await fs.readFile(filename,'utf8'));}catch(e){if(e.code==='ENOENT')return {revision:0,journal:null};throw e;}}
  function json(res,status,body,headers={}){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store',...headers});res.end(JSON.stringify(body));}
  return http.createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');
    try{
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/api/health'){json(res,200,{ok:true,storageConfigured:configured});return;}
      if(url.pathname==='/api/journal'){
        if(!configured){json(res,503,{error:'Private storage has not been configured on this server.'});return;}
        if(publicOrigin&&req.headers.origin&&req.headers.origin!==publicOrigin){json(res,403,{error:'Origin not allowed'});return;}
        const client=req.socket.remoteAddress;const failure=failures.get(client);
        if(failure&&failure.until>Date.now()&&failure.count>=20){json(res,429,{error:'Too many attempts. Try again in a minute.'});return;}
        const provided=(req.headers.authorization||'').replace(/^Bearer /,'');
        const hash=v=>crypto.createHash('sha256').update(v).digest();
        if(!crypto.timingSafeEqual(hash(provided),hash(key))){if(failures.size>1000)failures.clear();failures.set(client,{count:failure?.until>Date.now()?failure.count+1:1,until:Date.now()+60000});json(res,401,{error:'The private access key is incorrect.'});return;}
        failures.delete(client);
        if(req.method==='GET'){await queue;const record=await read();json(res,200,record,{ETag:`"${record.revision}"`});return;}
        if(req.method!=='PUT'){json(res,405,{error:'Method not allowed'},{Allow:'GET, PUT'});return;}
        if(!req.headers['content-type']?.startsWith('application/json')){json(res,415,{error:'Send JSON'});return;}
        const chunks=[];let size=0;
        for await(const chunk of req){size+=chunk.length;if(size>5*1024*1024){json(res,413,{error:'Journal is too large'});return;}chunks.push(chunk);}
        const body=Buffer.concat(chunks).toString('utf8');
        let journal;try{journal=validateJournal(JSON.parse(body));}catch(e){json(res,400,{error:e.message});return;}
        const write=async()=>{
          const current=await read();
          if(req.headers['if-match']!==`"${current.revision}"`){json(res,409,{error:'Another device updated the journal. Download the latest journal before saving.'});return;}
          await fs.mkdir(dataDir,{recursive:true,mode:0o700});
          if(current.revision){await fs.writeFile(path.join(dataDir,`backup-${current.revision}.json`),JSON.stringify(current),{mode:0o600});}
          const record={revision:current.revision+1,updatedAt:new Date().toISOString(),journal};
          const temporary=path.join(dataDir,`journal-${crypto.randomUUID()}.tmp`);
          try{await fs.writeFile(temporary,JSON.stringify(record),{mode:0o600,flag:'wx'});await fs.rename(temporary,filename);}catch(e){await fs.rm(temporary,{force:true});throw e;}
          const backups=(await fs.readdir(dataDir)).filter(n=>/^backup-\d+\.json$/.test(n)).sort((a,b)=>Number(b.match(/\d+/)[0])-Number(a.match(/\d+/)[0]));
          for(const backup of backups.slice(7))await fs.rm(path.join(dataDir,backup));
          json(res,200,{revision:record.revision,updatedAt:record.updatedAt},{ETag:`"${record.revision}"`});
        };
        queue=queue.then(write,write);await queue;return;
      }
      if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
      const file=url.pathname==='/'?'index.html':url.pathname.slice(1);
      if(!PUBLIC_FILES.has(file)){res.writeHead(404);res.end('Not found');return;}
      const content=await fs.readFile(path.join(__dirname,file));
      res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
      res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:content);
    }catch(error){if(!res.headersSent)json(res,500,{error:'Unable to save or load the journal. Your local data remains available.'});else res.end();}
  });
}
if(require.main===module){const app=createApp();app.listen(Number(process.env.PORT)||4173,process.env.HOST||'127.0.0.1',()=>console.log(`Benj Fitness: http://${process.env.HOST||'127.0.0.1'}:${Number(process.env.PORT)||4173}`));}
module.exports={createApp,validateJournal};
