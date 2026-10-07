'use strict';
const ExerciseMotion = (() => {
  const ids=['squat','bench','pull','rdl','row','lunge','press','deadbug','plank','floorpress','pushup','straightpull','split','bridge','calf','lateral','rear','curl','hammer','triceps','sideplank','birddog','carry','march','stretch'];
  const lengths={arm:[0.30,0.29],leg:[0.46,0.46]};
  const add=(a,b)=>a.map((n,i)=>n+b[i]);
  const sub=(a,b)=>a.map((n,i)=>n-b[i]);
  const scale=(a,n)=>a.map(v=>v*n);
  const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
  const norm=a=>Math.sqrt(dot(a,a));
  const unit=a=>scale(a,1/(norm(a)||1));
  // Two-bone inverse kinematics keeps upper and lower limb lengths constant.
  function joint(start,end,upper,lower,hint){
    const direction=unit(sub(end,start));
    const distance=Math.min(upper+lower-0.00001,Math.max(Math.abs(upper-lower)+0.00001,norm(sub(end,start))));
    let bend=sub(hint,scale(direction,dot(hint,direction)));
    if(norm(bend)<0.001)bend=sub([0,0,1],scale(direction,direction[2]));
    bend=unit(bend);
    const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
    const height=Math.sqrt(Math.max(0,upper*upper-along*along));
    return {middle:add(add(start,scale(direction,along)),scale(bend,height)),end:add(start,scale(direction,distance))};
  }
  function pose(id,phase){
    if(!ids.includes(id))id='squat';
    const u=(1-Math.cos(phase))/2;
    const left=Math.max(0,Math.sin(phase)),right=Math.max(0,-Math.sin(phase));
    let hip=[0,0.98,0],tilt=0,feet=[[-0.19,0.08,0.10],[0.19,0.08,0.10]],hands;
    let armHints=[[-1,-0.3,0],[1,-0.3,0]],legHints=[[0,0,1],[0,0,1]];
    if(id==='squat'){hip=[0,0.98-0.39*u,-0.17*u];tilt=0.20*u;}
    if(id==='rdl'){hip=[0,0.98-0.06*u,-0.25*u];tilt=0.95*u;}
    if(id==='lunge'){hip=[0,0.98-0.33*u,-0.10*u];feet=[[-0.15,0.08,0.20],[0.15,0.08+0.07*u,0.10-0.68*u]];}
    if(id==='row'){hip=[0,0.90,-0.15];tilt=0.92;feet=[[-0.20,0.08,0.18],[0.20,0.08,-0.18]];armHints=[[-0.2,0,0],[0.5,0,-1]];}
    if(id==='bench'){hip=[0,0.70,0.25];tilt=-Math.PI/2;feet=[[-0.25,0.08,0.76],[0.25,0.08,0.76]];}
    if(id==='pull'||id==='press'){hip=[0,0.59,0];feet=[[-0.20,0.08,0.50],[0.20,0.08,0.50]];}
    if(id==='deadbug'){hip=[0,0.17,0.25];tilt=-Math.PI/2;feet=[[-0.15,0.61-0.42*right,0.67+0.30*right],[0.15,0.61-0.42*left,0.67+0.30*left]];legHints=[[0,1,0],[0,1,0]];armHints=[[-1,0,0],[1,0,0]];}
    if(id==='plank'){hip=[0,0.29,-0.20];tilt=1.397;feet=[[-0.16,0.08,-1.095],[0.16,0.08,-1.095]];legHints=[[0,-1,0],[0,-1,0]];armHints=[[0,0,-1],[0,0,-1]];}
    if(id==='march'){feet=[[-0.17,0.08+0.32*left,0.10+0.23*left],[0.17,0.08+0.32*right,0.10+0.23*right]];}
    if(id==='floorpress'){hip=[0,0.18,0.25];tilt=-Math.PI/2;feet=[[-0.23,0.08,0.78],[0.23,0.08,0.78]];legHints=[[0,1,0],[0,1,0]];}
    if(id==='pushup'){const height=0.33-0.13*u;hip=[0,height,-1.10+Math.sqrt(0.92*0.92-(height-0.08)**2)];tilt=Math.PI/2-Math.atan2(height-0.08,hip[2]+1.10);feet=[[-0.16,0.08,-1.10],[0.16,0.08,-1.10]];legHints=[[0,-1,0],[0,-1,0]];}
    if(id==='straightpull'){hip=[0,0.95,-0.04];tilt=0.15;armHints=[[0,0,1],[0,0,1]];}
    if(id==='split'){hip=[0,0.91-0.33*u,0];feet=[[-0.15,0.08,0.30],[0.15,0.12,-0.40]];}
    if(id==='bridge'){const lift=0.28*u;hip=[0,0.17+lift,-0.27+Math.sqrt(0.52*0.52-lift*lift)];tilt=Math.atan2(-Math.sqrt(0.52*0.52-lift*lift),-lift);feet=[[-0.17,0.08,0.77],[0.17,0.08,0.77]];legHints=[[0,1,0],[0,1,0]];armHints=[[-1,0,0],[1,0,0]];}
    if(id==='calf'){hip=[0,0.98+0.10*u,0];feet=[[-0.19,0.08+0.10*u,0.10],[0.19,0.08+0.10*u,0.10]];}
    if(id==='rear'){hip=[0,0.90,-0.15];tilt=0.92;armHints=[[-0.1,-1,0],[0.1,-1,0]];}
    if(['curl','hammer'].includes(id))armHints=[[0,-1,0],[0,-1,0]];
    if(id==='triceps')armHints=[[-0.2,1,0],[0.2,1,0]];
    if(id==='sideplank'){hip=[0,0.40,-0.20];tilt=1.397;feet=[[0,0.08,-1.055],[0,0.12,-1.025]];legHints=[[0,-1,0],[0,-1,0]];armHints=[[0,-1,-1],[0,1,0]];}
    if(id==='birddog'){hip=[0,0.58,-0.25];tilt=Math.PI/2;feet=[[-0.15,0.08+0.50*right,-0.65-0.52*right],[0.15,0.08+0.50*left,-0.65-0.52*left]];legHints=[[0,-1,0],[0,-1,0]];armHints=[[-0.2,-1,0],[0.2,-1,0]];}
    if(id==='carry')feet=[[-0.17,0.08+0.12*left,0.10+0.10*left],[0.17,0.08+0.12*right,0.10+0.10*right]];
    const axis=[0,Math.cos(tilt),Math.sin(tilt)];
    const shoulder=add(hip,scale(axis,0.52));
    const head=id==='bridge'?[0,0.17,-0.50]:add(shoulder,scale(axis,0.23));
    const shoulders=id==='sideplank'?[add(shoulder,[0,-0.21,0]),add(shoulder,[0,0.21,0])]:[add(shoulder,[-0.21,0,0]),add(shoulder,[0.21,0,0])];
    const hips=id==='sideplank'?[add(hip,[0,-0.14,0]),add(hip,[0,0.14,0])]:[add(hip,[-0.14,0,0]),add(hip,[0.14,0,0])];
    hands=shoulders.map(s=>add(s,[0,-0.56,0.04]));
    if(id==='squat')hands=[add(shoulder,[-0.075,-0.19,0.22]),add(shoulder,[0.075,-0.19,0.22])];
    if(id==='bench'){hands=[[-0.42+0.20*u,0.83+0.44*u,shoulder[2]],[0.42-0.20*u,0.83+0.44*u,shoulder[2]]];armHints=[[-1,0,0.3],[1,0,0.3]];}
    if(id==='pull'){hands=[[-0.34,1.64-0.47*u,0.20],[0.34,1.64-0.47*u,0.20]];armHints=[[-1,-0.6,0],[1,-0.6,0]];}
    if(id==='press'){hands=[[-0.43+0.18*u,1.14+0.52*u,0.07],[0.43-0.18*u,1.14+0.52*u,0.07]];}
    if(id==='row'){hands=[[-0.25,0.70,0.38],add(shoulders[1],[0,-0.55+0.30*u,0.04-0.12*u])];}
    if(id==='deadbug'){hands=[add(shoulders[0],[0,0.56-0.46*left,-0.53*left]),add(shoulders[1],[0,0.56-0.46*right,-0.53*right])];}
    if(id==='plank'){hands=[add(shoulders[0],[0,-0.30,0.29]),add(shoulders[1],[0,-0.30,0.29])];}
    if(id==='march'){hands=[add(shoulders[0],[0,-0.50+0.12*right,0.05+0.24*right-0.12*left]),add(shoulders[1],[0,-0.50+0.12*left,0.05+0.24*left-0.12*right])];}
    if(id==='stretch'){hands=[add(shoulders[0],[-0.05,-0.43+0.98*u,0.05]),add(shoulders[1],[0.05,-0.43+0.98*u,0.05])];}
    if(id==='floorpress'){hands=[[-0.42+0.20*u,0.28+0.44*u,shoulder[2]],[0.42-0.20*u,0.28+0.44*u,shoulder[2]]];armHints=[[-1,0,0.3],[1,0,0.3]];}
    if(id==='pushup'){hands=[[-0.30,0.08,0.35],[0.30,0.08,0.35]];armHints=[[-1,0,-0.5],[1,0,-0.5]];}
    if(id==='straightpull'){const angle=1.9-1.65*u;hands=shoulders.map(s=>add(s,[0,-0.58*Math.cos(angle),0.58*Math.sin(angle)]));}
    if(id==='bridge')hands=[[-0.30,0.08,0.10],[0.30,0.08,0.10]];
    if(id==='lateral'){hands=[add(shoulders[0],[-0.04-0.51*u,-0.56*(1-u),0.03]),add(shoulders[1],[0.04+0.51*u,-0.56*(1-u),0.03])];}
    if(id==='rear'){hands=[add(shoulders[0],[-0.04-0.49*u,-0.55*(1-u),0.03-0.15*u]),add(shoulders[1],[0.04+0.49*u,-0.55*(1-u),0.03-0.15*u])];}
    if(['curl','hammer'].includes(id)){const angle=2.25*u;hands=shoulders.map(s=>add(s,[0,-0.30-0.29*Math.cos(angle),0.01+0.29*Math.sin(angle)]));}
    if(id==='triceps')hands=[add(shoulder,[-0.07,0.18+0.40*u,-0.25*(1-u)]),add(shoulder,[0.07,0.18+0.40*u,-0.25*(1-u)])];
    if(id==='sideplank')hands=[[0,0.08,0.59],add(shoulders[1],[0,0.57,0])];
    if(id==='birddog')hands=[add(shoulders[0],[0,-0.50*(1-left),0.05+0.53*left]),add(shoulders[1],[0,-0.50*(1-right),0.05+0.53*right])];
    const arms=shoulders.map((s,i)=>joint(s,hands[i],...lengths.arm,armHints[i]));
    const legs=hips.map((h,i)=>joint(h,feet[i],...lengths.leg,legHints[i]));
    return {id,u,hip,shoulder,head,axis,tilt,roll:id==='sideplank'?Math.PI/2:0,shoulders,hips,arms,legs,phaseLabel:['plank','sideplank'].includes(id)?'Hold & breathe':id==='carry'?'Short, controlled steps':u<0.15?'Starting position':u>0.85?'Controlled end position':'Move with control'};
  }
  return {ids,lengths,pose};
})();
if(typeof module!=='undefined')module.exports=ExerciseMotion;
