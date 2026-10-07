'use strict';
window.ThreeCoach = (() => {
  const controllers=new Map();
  const viewAngles={angle:[2.8,1.65,3.4],front:[0,1.15,4.5],side:[4.5,1.15,0]};
  function attach(guide){
    if(!window.THREE||controllers.has(guide))return;
    const T=window.THREE;
    const stage=document.createElement('div');stage.className='coach-stage';stage.setAttribute('aria-label','3D exercise demonstration');
    const fallback=guide.querySelector('.movement-svg');fallback.before(stage);
    let renderer;
    try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});}catch(e){stage.remove();return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor('#d6e2dc');
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    renderer.outputColorSpace=T.SRGBColorSpace;stage.append(renderer.domElement);
    renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label',`3D ${guide.dataset.movement} exercise demonstration`);
    const scene=new T.Scene();
    const camera=new T.PerspectiveCamera(36,1,0.1,40);const target=new T.Vector3(0,0.91,0);
    scene.add(new T.HemisphereLight(0xffffff,0x89b8a0,2.3));
    const light=new T.DirectionalLight(0xffffff,3.2);light.position.set(-3,6,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-2;light.shadow.camera.right=2;light.shadow.camera.top=3;light.shadow.camera.bottom=-2;light.shadow.bias=-0.0003;scene.add(light);
    const material=color=>new T.MeshStandardMaterial({color,roughness:0.8});
    const skin=material('#d5a281'),shirt=material('#24846b'),pants=material('#4669a8'),shoe=material('#ffffff'),metal=material('#506671'),pad=material('#394f60'),weight=material('#d78b48');
    const meshes=[];
    function mesh(geometry,mat){const m=new T.Mesh(geometry,mat);m.castShadow=true;m.receiveShadow=true;scene.add(m);meshes.push(m);return m;}
    function sphere(radius,mat){return mesh(new T.SphereGeometry(radius,16,12),mat);}
    function segment(radius,mat){return mesh(new T.CylinderGeometry(radius,radius,1,12),mat);}
    function position(m,p){m.position.fromArray(p);}
    function connect(m,a,b){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);m.position.copy(av.add(bv).multiplyScalar(0.5));m.scale.y=delta.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());}
    const torso=mesh(new T.CylinderGeometry(0.21,0.145,1,18),shirt);
    const pelvis=sphere(0.155,pants),head=sphere(0.12,skin),neck=segment(0.06,skin);
    const eyes=[sphere(0.014,metal),sphere(0.014,metal)];
    const arms=[0,1].map(()=>({upper:segment(0.052,shirt),lower:segment(0.043,skin),joint:sphere(0.051,skin),hand:sphere(0.05,skin)}));
    const legs=[0,1].map(()=>({upper:segment(0.075,pants),lower:segment(0.055,pants),joint:sphere(0.063,pants),foot:mesh(new T.BoxGeometry(0.14,0.075,0.24),shoe)}));
    const floor=mesh(new T.PlaneGeometry(10,10),material('#d6e2dc'));floor.rotation.x=-Math.PI/2;floor.position.y=-0.012;floor.castShadow=false;
    const grid=new T.GridHelper(6,16,0x92aaa0,0xb6c9bf);grid.material.opacity=0.5;grid.material.transparent=true;scene.add(grid);
    const equipment=new T.Group();scene.add(equipment);
    function box(w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;equipment.add(m);return m;}
    const id=guide.dataset.movement;
    if(id==='bench'){box(0.42,0.08,1.12,0,0.59,0.05,pad);box(0.07,0.56,0.08,0,0.28,-0.35,metal);box(0.07,0.56,0.08,0,0.28,0.45,metal);}
    if(id==='row'){box(0.32,0.07,0.75,-0.30,0.63,0.18,pad);box(0.06,0.60,0.06,-0.30,0.30,-0.05,metal);box(0.06,0.60,0.06,-0.30,0.30,0.44,metal);}
    if(id==='press'||id==='pull'){box(0.44,0.08,0.34,0,0.48,0.02,pad);box(0.08,0.44,0.08,0,0.23,0,metal);}
    if(['pull','straightpull'].includes(id)){box(0.07,2.04,0.07,0.62,1.02,-0.30,metal);box(0.68,0.06,0.06,0.30,2.02,-0.30,metal);box(0.06,0.05,0.55,0,2.02,-0.04,metal);}
    if(['plank','deadbug','floorpress','pushup','bridge','sideplank','birddog'].includes(id))box(0.9,0.025,2.4,0,0.005,0,material('#b4c4e9'));
    function dumbbell(){const group=new T.Group();const handle=new T.Mesh(new T.CylinderGeometry(0.02,0.02,0.22,12),metal);handle.rotation.z=Math.PI/2;group.add(handle);for(const x of [-0.12,0.12]){const disk=new T.Mesh(new T.CylinderGeometry(0.073,0.073,0.06,12),weight);disk.rotation.z=Math.PI/2;disk.position.x=x;disk.castShadow=true;group.add(disk);}scene.add(group);return group;}
    const weights=['bench','rdl','lunge','press','floorpress','split','calf','lateral','rear','curl','hammer','carry'].includes(id)?[dumbbell(),dumbbell()]:['squat','row','triceps'].includes(id)?[dumbbell()]:[];
    const bar=['pull','straightpull'].includes(id)?segment(0.025,metal):null,cable=bar?segment(0.005,metal):null;
    let phase=0,speed=1,paused=false,last=0,view='angle';
    const phaseNode=guide.querySelector('.coach-phase'),scrubber=guide.querySelector('.movement-scrub');
    function update(){
      const p=ExerciseMotion.pose(id,phase);
      connect(torso,p.hip,p.shoulder);position(pelvis,p.hip);position(head,p.head);connect(neck,p.shoulder,p.head);
      const headTilt=id==='bridge'?-Math.PI/2:p.tilt;
      const face=p.roll?[Math.sin(headTilt),0,Math.cos(headTilt)]:[0,-Math.sin(headTilt),Math.cos(headTilt)];
      eyes.forEach((eye,i)=>position(eye,p.head.map((v,j)=>v+face[j]*0.108+(j===0?(i?0.037:-0.037):0))));
      for(let i=0;i<2;i++){
        const a=p.arms[i],l=p.legs[i];connect(arms[i].upper,p.shoulders[i],a.middle);connect(arms[i].lower,a.middle,a.end);position(arms[i].joint,a.middle);position(arms[i].hand,a.end);
        connect(legs[i].upper,p.hips[i],l.middle);connect(legs[i].lower,l.middle,l.end);position(legs[i].joint,l.middle);position(legs[i].foot,[l.end[0],l.end[1]-0.025,l.end[2]+0.045]);
        if(id==='calf'){legs[i].foot.rotation.x=0.65*p.u;legs[i].foot.position.y=0.055+0.05*p.u;}
      }
      if(weights.length===2)weights.forEach((w,i)=>{position(w,p.arms[i].end);if(id==='hammer')w.rotation.z=Math.PI/2;});
      else if(weights.length){const location=id==='row'?p.arms[1].end:p.arms[0].end.map((v,i)=>(v+p.arms[1].end[i])/2);position(weights[0],location);if(['squat','triceps'].includes(id))weights[0].rotation.z=Math.PI/2;}
      if(bar){connect(bar,p.arms[0].end,p.arms[1].end);const middle=p.arms[0].end.map((v,i)=>(v+p.arms[1].end[i])/2);connect(cable,[0,2.02,0.20],middle);}
      if(phaseNode)phaseNode.textContent=p.phaseLabel;
      if(scrubber&&document.activeElement!==scrubber)scrubber.value=String(Math.round((phase%(Math.PI*2))/(Math.PI*2)*100));
      stage.dataset.phase=String(phase);renderer.render(scene,camera);
    }
    function setView(value){view=value;camera.position.fromArray(viewAngles[view]||viewAngles.angle);camera.lookAt(target);guide.querySelectorAll('[data-camera]').forEach(button=>button.classList.toggle('selected',button.dataset.camera===view));update();}
    function resize(){const rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();update();}
    const observer=new ResizeObserver(resize);observer.observe(stage);
    const controller={setPaused(value){paused=value;update();},setSpeed(value){speed=value;},setView,setProgress(value){phase=Number(value)/100*Math.PI*2;update();},dispose(){renderer.setAnimationLoop(null);observer.disconnect();scene.traverse(object=>{object.geometry?.dispose();if(object.material){for(const m of Array.isArray(object.material)?object.material:[object.material])m.dispose();}});renderer.dispose();renderer.forceContextLoss();stage.remove();controllers.delete(guide);},get paused(){return paused;}};
    controllers.set(guide,controller);fallback.setAttribute('hidden','');guide.classList.add('has-3d');
    setView(['rdl','row','plank','deadbug','floorpress','pushup','bridge','rear','sideplank','birddog','split','straightpull'].includes(id)?'side':'angle');resize();
    renderer.setAnimationLoop(time=>{const delta=last?Math.min((time-last)/1000,0.06):0;last=time;if(!paused&&!document.hidden){phase+=delta*speed*Math.PI/2;update();}});
  }
  function cleanup(){for(const [guide,controller] of controllers)if(!guide.isConnected||guide.closest('dialog')&&!guide.closest('dialog').open)controller.dispose();}
  return {attach,cleanup,get:guide=>controllers.get(guide)};
})();
