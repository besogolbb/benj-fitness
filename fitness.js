'use strict';
const Fitness = (() => {
  // Each pose: head, shoulder, hip, two elbows, two hands, two knees, two feet.
  const poses = {
    squat: [
      [[220,64],[220,96],[220,176],[196,122],[244,122],[212,116],[228,116],[197,219],[243,219],[188,260],[252,260]],
      [[220,117],[220,148],[220,202],[191,171],[249,171],[212,163],[228,163],[171,230],[269,230],[188,260],[252,260]]
    ],
    bench: [
      [[145,173],[173,183],[273,193],[179,132],[202,142],[179,81],[211,91],[316,214],[293,228],[335,260],[312,260]],
      [[145,173],[173,183],[273,193],[192,210],[221,205],[190,165],[222,164],[316,214],[293,228],[335,260],[312,260]]
    ],
    pull: [
      [[220,122],[220,152],[220,215],[176,110],[264,110],[163,65],[277,65],[180,227],[260,227],[176,260],[264,260]],
      [[220,122],[220,152],[220,215],[172,184],[268,184],[172,145],[268,145],[180,227],[260,227],[176,260],[264,260]]
    ],
    rdl: [
      [[223,67],[223,98],[220,177],[215,139],[237,139],[215,179],[237,179],[210,218],[240,218],[204,260],[249,260]],
      [[300,148],[276,160],[204,184],[282,200],[269,202],[287,240],[269,240],[220,223],[238,223],[213,260],[251,260]]
    ],
    row: [
      [[186,124],[210,153],[286,169],[190,187],[231,197],[178,225],[234,243],[280,216],[303,215],[269,260],[320,260]],
      [[186,124],[210,153],[286,169],[190,187],[249,153],[178,225],[248,181],[280,216],[303,215],[269,260],[320,260]]
    ],
    lunge: [
      [[220,67],[220,99],[220,175],[193,137],[246,137],[188,181],[251,181],[205,216],[237,216],[194,260],[249,260]],
      [[211,108],[211,140],[210,210],[189,176],[238,176],[188,219],[246,219],[160,210],[265,247],[151,260],[302,260]]
    ],
    press: [
      [[220,112],[220,142],[220,216],[174,166],[266,166],[174,116],[266,116],[178,225],[262,225],[172,260],[268,260]],
      [[220,112],[220,142],[220,216],[191,88],[249,88],[190,43],[250,43],[178,225],[262,225],[172,260],[268,260]]
    ],
    deadbug: [
      [[143,233],[168,244],[257,244],[174,199],[187,204],[176,153],[190,160],[257,184],[278,193],[299,185],[321,194]],
      [[143,233],[168,244],[257,244],[174,199],[132,223],[176,153],[95,204],[257,184],[307,228],[299,185],[358,247]]
    ],
    plank: [
      [[129,194],[153,215],[250,225],[142,256],[154,256],[106,260],[117,260],[302,241],[307,245],[355,260],[366,260]],
      [[129,192],[153,213],[250,223],[142,256],[154,256],[106,260],[117,260],[302,241],[307,245],[355,260],[366,260]]
    ],
    march: [
      [[220,66],[220,97],[220,175],[189,132],[246,123],[177,173],[258,103],[211,215],[263,184],[199,260],[265,223]],
      [[220,66],[220,97],[220,175],[194,123],[251,132],[182,103],[263,173],[177,184],[229,215],[175,223],[241,260]]
    ],
    stretch: [
      [[211,80],[212,112],[217,180],[183,137],[243,134],[163,121],[257,110],[210,218],[259,211],[183,260],[294,260]],
      [[211,80],[212,112],[217,180],[177,90],[245,91],[164,57],[259,57],[210,218],[259,211],[183,260],[294,260]]
    ]
  };
  if(typeof ExerciseMotion!=='undefined'){
    for(const id of ExerciseMotion.ids){
      if(poses[id])continue;
      const side=['floorpress','pushup','straightpull','split','bridge','rear','sideplank','birddog'].includes(id);
      const project=p=>[220+(side?p[2]:p[0])*100,260-p[1]*100];
      const frame=phase=>{const p=ExerciseMotion.pose(id,phase);return [p.head,p.shoulder,p.hip,p.arms[0].middle,p.arms[1].middle,p.arms[0].end,p.arms[1].end,p.legs[0].middle,p.legs[1].middle,p.legs[0].end,p.legs[1].end].map(project);};
      poses[id]=['birddog','carry'].includes(id)?[frame(Math.PI/2),frame(Math.PI*1.5)]:[frame(0),frame(Math.PI)];
    }
  }
  const extra = {
    march:{name:'Easy marching',equipment:'Warm-up',target:'2–3 comfortable minutes',steps:['Stand tall with feet comfortably apart.','Lift one knee gently while swinging the opposite arm.','Alternate sides at an easy pace with soft foot landings.'],tip:'Stay relaxed and breathe normally; keep the knee lift comfortable.'},
    stretch:{name:'Gentle overhead reach',equipment:'Cool-down',target:'20–30 seconds at a comfortable reach',steps:['Stand with feet in a stable, comfortable position.','Slowly reach your arms upward through a pain-free range.','Hold a gentle reach while breathing, then lower your arms and relax.'],tip:'Avoid arching your back. Use a smaller reach if your shoulders feel tight.'}
  };
  let selected = 'squat';
  const point = p => p.join(',');
  const cycle = (a,b) => `${a};${b};${a}`;
  function animate(attribute,a,b,duration=4){return `<animate attributeName="${attribute}" values="${cycle(a,b)}" dur="${duration}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>`;}
  function line(a,b,style=''){return `<polyline points="${a}" ${style}>${animate('points',a,b)}</polyline>`;}
  function svg(id){
    const [a,b]=poses[id];
    const limb = indices => line(indices.map(i=>point(a[i])).join(' '),indices.map(i=>point(b[i])).join(' '));
    let equipment='';
    if(['bench','row','press','pull'].includes(id)){
      const bench=id==='bench'?{x:155,y:207,w:150}:id==='row'?{x:140,y:232,w:83}:{x:190,y:225,w:60};
      equipment+=`<rect x="${bench.x}" y="${bench.y}" width="${bench.w}" height="9" rx="3" fill="#9aafa2"/><path d="M${bench.x+10} ${bench.y+9}v${255-bench.y}m${bench.w-20} ${bench.y-255}v${255-bench.y}" stroke="#8a9a91" stroke-width="5" fill="none"/>`;
    }
    if(['deadbug','plank','floorpress','pushup','bridge','sideplank','birddog'].includes(id))equipment+='<rect x="70" y="264" width="320" height="7" rx="3" fill="#c4b8df"/>';
    if(id==='pull'){
      equipment+='<path d="M332 260V35H220" fill="none" stroke="#9aafa2" stroke-width="6" stroke-linejoin="round"/><circle cx="220" cy="35" r="7" fill="#667a6d"/>';
      equipment+=line(`220,35 220,${a[5][1]}`,`220,35 220,${b[5][1]}`,'stroke="#86968c" stroke-width="2" fill="none"');
      equipment+=line(`${a[5][0]-10},${a[5][1]} ${a[6][0]+10},${a[6][1]}`,`${b[5][0]-10},${b[5][1]} ${b[6][0]+10},${b[6][1]}`,'stroke="#40594b" stroke-width="6" stroke-linecap="round"');
    }
    let weights='';
    const hands=['squat','triceps'].includes(id)?[5]:['bench','rdl','lunge','press','floorpress','split','calf','lateral','rear','curl','hammer','carry'].includes(id)?[5,6]:id==='row'?[6]:[];
    for(const i of hands){
      const [x,y]=a[i], [xx,yy]=b[i];
      const dumbbell=(px,py)=>`${px-11},${py-6} ${px-11},${py+6} ${px-11},${py} ${px+11},${py} ${px+11},${py-6} ${px+11},${py+6}`;
      weights+=line(dumbbell(x,y),dumbbell(xx,yy),'stroke="#bc7338" stroke-width="5" fill="none" stroke-linejoin="round"');
    }
    return `<svg class="movement-svg" viewBox="0 0 440 290" role="img" aria-label="Animated ${id} movement demonstration" xmlns="http://www.w3.org/2000/svg"><path d="M55 272H390" stroke="#d8e2da" stroke-width="2"/>${equipment}<g fill="none" stroke="#4b6355" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">${limb([1,3,5])}${limb([1,4,6])}${limb([2,7,9])}${limb([2,8,10])}${line(point(a[1])+' '+point(a[2]),point(b[1])+' '+point(b[2]),'stroke="#176b50" stroke-width="17"')}<circle cx="${a[0][0]}" cy="${a[0][1]}" r="17" fill="#e0b898" stroke="none">${animate('cx',a[0][0],b[0][0])}${animate('cy',a[0][1],b[0][1])}</circle></g>${weights}</svg>`;
  }
  function guide(id,exercises){
    if(!Object.hasOwn(poses,id))id='squat';
    const e=exercises[id]||extra[id];
    const icon=window.AppIcons?window.AppIcons.markup('pause'):'&#10074;&#10074;';
    return `<section class="movement-guide" data-movement="${id}"><div class="exercise-head"><div><span class="eyebrow">${e.equipment}</span><h2>${e.name}</h2></div><span class="pill">${e.target}</span></div>${svg(id)}<div class="coach-meta"><span class="coach-phase">Starting position</span><div class="camera-views" role="group" aria-label="Camera view"><button type="button" data-camera="angle" class="selected">Angle</button><button type="button" data-camera="front">Front</button><button type="button" data-camera="side">Side</button></div></div><div class="movement-controls"><button type="button" class="button secondary movement-toggle" title="Pause animation" aria-label="Pause animation" aria-pressed="false">${icon}</button><label>Speed<input class="movement-speed" aria-label="Animation speed" type="range" min="0.5" max="1.5" step="0.25" value="1"></label><output class="movement-speed-value">1×</output><span class="movement-state">Playing</span></div><label class="scrub-label">Movement<input class="movement-scrub" type="range" min="0" max="100" value="0" aria-label="Scrub through movement"></label><ol class="movement-steps">${e.steps.map(s=>`<li>${s}</li>`).join('')}</ol><div class="note">${e.tip}</div></section>`;
  }
  function page(exercises){
    const groups=['Chest','Back','Legs','Shoulders','Arms','Core','Carry'];
    const options=items=>Object.entries(items).map(([id,e])=>`<option value="${id}" ${selected===id?'selected':''}>${e.name}</option>`).join('');
    const entries=group=>Object.fromEntries(Object.entries(exercises).filter(([,e])=>e.group===group));
    const button=(id,e)=>`<button type="button" class="movement-choice ${selected===id?'selected':''}" data-exercise-guide="${id}" aria-pressed="${selected===id}">${e.name}<small>${e.equipment}</small></button>`;
    return `<label class="mobile-exercise-picker">Exercise<select id="exercise-picker">${groups.map(group=>`<optgroup label="${group}">${options(entries(group))}</optgroup>`).join('')}<optgroup label="Warm-up & cool-down">${options(extra)}</optgroup></select></label><div class="fitness-layout"><aside class="fitness-library" aria-label="Exercise library">${groups.map(group=>`<h3>${group}</h3>${Object.entries(entries(group)).map(([id,e])=>button(id,e)).join('')}`).join('')}<h3>Warm-up & cool-down</h3>${Object.entries(extra).map(([id,e])=>button(id,e)).join('')}</aside><div id="fitness-guide">${guide(selected,exercises)}<a class="button" href="#resistance">Open training log ↗</a></div></div>`;
  }
  function toggle(guide,paused){
    const svg=guide.querySelector('svg');
    if(typeof svg.pauseAnimations!=='function')return;
    if(paused)svg.pauseAnimations();else svg.unpauseAnimations();
    const button=guide.querySelector('.movement-toggle');
    button.innerHTML=window.AppIcons?window.AppIcons.markup(paused?'play':'pause'):(paused?'&#9654;':'&#10074;&#10074;');
    button.title=paused?'Play animation':'Pause animation';
    button.setAttribute('aria-label',button.title);
    button.setAttribute('aria-pressed',String(paused));
    guide.querySelector('.movement-state').textContent=paused?'Paused':'Playing';
    window.ThreeCoach?.get(guide)?.setPaused(paused);
  }
  function mount(root){
    window.ThreeCoach?.cleanup();
    if(window.ThreeCoach)root.querySelectorAll('.movement-guide').forEach(guide=>window.ThreeCoach.attach(guide));
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      root.querySelectorAll('.movement-guide').forEach(guide=>toggle(guide,true));
    }
  }
  function selectGuide(id){
    if(!Object.hasOwn(poses,id))return;
    selected=id;
    document.querySelectorAll('.movement-choice').forEach(button=>{const active=button.dataset.exerciseGuide===id;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active));});
    const picker=document.querySelector('#exercise-picker');if(picker)picker.value=id;
    document.querySelector('#fitness-guide').innerHTML=guide(selected,exercises)+'<a class="button" href="#resistance">Open training log ↗</a>';
    mount(document.querySelector('#fitness-guide'));
  }
  document.addEventListener('click',event=>{
    const choice=event.target.closest('[data-exercise-guide]');
    if(choice)selectGuide(choice.dataset.exerciseGuide);
    const button=event.target.closest('.movement-toggle');
    if(button){const guide=button.closest('.movement-guide');toggle(guide,button.getAttribute('aria-pressed')!=='true');}
    const cameraButton=event.target.closest('[data-camera]');
    if(cameraButton){const guide=cameraButton.closest('.movement-guide');guide.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('selected',b===cameraButton));window.ThreeCoach?.get(guide)?.setView(cameraButton.dataset.camera);}
  });
  document.addEventListener('change',event=>{if(event.target.id==='exercise-picker')selectGuide(event.target.value);});
  document.addEventListener('input',event=>{
    if(event.target.matches('.movement-scrub')){const guide=event.target.closest('.movement-guide'),value=event.target.value;toggle(guide,true);window.ThreeCoach?.get(guide)?.setProgress(value);return;}
    if(!event.target.matches('.movement-speed'))return;
    const guide=event.target.closest('.movement-guide'),svg=guide.querySelector('svg');
    const speed=Number(event.target.value);
    svg.querySelectorAll('animate').forEach(node=>node.setAttribute('dur',`${4/speed}s`));
    guide.querySelector('.movement-speed-value').textContent=`${speed}×`;
    if(typeof svg.setCurrentTime==='function')svg.setCurrentTime(0);
    window.ThreeCoach?.get(guide)?.setSpeed(speed);
  });
  return {page,guide,mount,svg};
})();
