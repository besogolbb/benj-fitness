'use strict';
const ExerciseCatalog = (() => {
  const base={
 squat:{name:'Dumbbell goblet squat',equipment:'Dumbbell',target:'3 sets · 8–12 reps',steps:['Hold one dumbbell close to your chest; stand with feet comfortably apart.','Brace your trunk and sit down between your hips, keeping heels grounded.','Lower only as far as you can control, then push the floor away to stand.'],tip:'Keep your knees following the direction of your toes.'},
 bench:{name:'Dumbbell bench press',equipment:'Bench + dumbbells',target:'3 sets · 8–12 reps',steps:['Sit on a stable bench, then lie back with dumbbells supported near your chest.','Plant your feet. Keep your wrists stacked over your elbows and shoulders gently pulled back.','Press the weights up, then lower slowly with elbows roughly 45 degrees from your torso.'],tip:'Start light. Use a floor press if getting weights into position feels unstable.'},
 pull:{name:'Cable lat pulldown',equipment:'Pulldown cable',target:'3 sets · 10–12 reps',steps:['Secure the machine and adjust the seat or support. Grip the bar comfortably wider than your shoulders.','Keep your chest tall and pull your elbows down toward your sides.','Bring the bar toward your upper chest, then return slowly with control.'],tip:'Pull in front of your head; avoid swinging or leaning far back.'},
 rdl:{name:'Dumbbell Romanian deadlift',equipment:'Dumbbells',target:'3 sets · 8–12 reps',steps:['Stand tall holding dumbbells in front of your thighs with soft knees.','Push your hips back, keeping the weights close and your back in a comfortable neutral position.','Stop when you feel your hamstrings stretch, then stand by driving through your feet.'],tip:'This is a hip hinge. Depth comes from your hips, not rounding your back.'},
 row:{name:'Supported dumbbell row',equipment:'Bench + dumbbell',target:'3 sets · 10 reps / side',steps:['Support one hand on your bench, set your feet firmly, and hinge at your hips.','Pull the dumbbell toward your hip with your elbow close to your body.','Lower slowly and finish both sides with the same number of repetitions.'],tip:'Keep your torso still; choose a weight you can control.'},
 lunge:{name:'Dumbbell reverse lunge',equipment:'Dumbbells',target:'2 sets · 8 reps / side',steps:['Stand tall with light dumbbells by your sides.','Step one foot back and bend both knees through a comfortable range.','Push through the front foot to return, then alternate sides.'],tip:'Start without weights and use support if your balance needs it.'},
 press:{name:'Seated dumbbell shoulder press',equipment:'Bench + dumbbells',target:'2 sets · 8–12 reps',steps:['Sit upright on a stable bench with dumbbells near shoulder height.','Brace your trunk and press overhead through a comfortable range.','Lower slowly without arching your lower back.'],tip:'Use light weights and a pain-free range.'},
 deadbug:{name:'Dead bug',equipment:'Yoga mat',target:'2 sets · 8 reps / side',steps:['Lie on your back with knees over hips and arms reaching upward.','Exhale and gently brace, then slowly extend the opposite arm and leg.','Return and switch sides while keeping your trunk steady.'],tip:'Shorten the movement if your lower back arches.'},
 plank:{name:'Forearm plank',equipment:'Yoga mat',target:'2 sets · 20–30 sec',steps:['Place forearms on your mat with elbows under shoulders.','Extend your legs or keep knees down for an easier version.','Hold a steady line through your trunk while breathing normally.'],tip:'End the hold when you can no longer keep good form.'}
};
  const extras={
  "floorpress": {
    "name": "Dumbbell floor press",
    "equipment": "Dumbbells + yoga mat",
    "group": "Chest",
    "sets": 3,
    "target": "3 sets · 8–12 reps",
    "steps": [
      "Lie on your back with knees bent and feet planted; bring light dumbbells beside your chest.",
      "Keep wrists above elbows and gently lower until your upper arms meet the floor.",
      "Press upward with control, then return softly without bouncing your elbows."
    ],
    "tip": "Use a comfortable range and a weight you can position safely."
  },
  "pushup": {
    "name": "Push-up",
    "equipment": "Yoga mat / bodyweight",
    "group": "Chest",
    "sets": 2,
    "target": "2 sets · 6–12 reps",
    "steps": [
      "Place hands a little wider than shoulder width and brace your trunk.",
      "Lower your chest while keeping head, hips, and heels in a steady line.",
      "Press the floor away; use knees down or hands on a stable elevated surface for an easier version."
    ],
    "tip": "Keep elbows angled slightly back, not flared straight out."
  },
  "straightpull": {
    "name": "Cable straight-arm pulldown",
    "equipment": "High cable + compatible bar",
    "group": "Back",
    "sets": 2,
    "target": "2 sets · 10–15 reps",
    "steps": [
      "Fit a compatible bar to the high pulley and stand back with soft knees.",
      "Brace your trunk, hinge slightly, and keep a small fixed bend in your elbows.",
      "Pull the bar toward your thighs, then return slowly without moving your torso."
    ],
    "tip": "Use only a secure high pulley with the correct attachment; substitute a dumbbell row if unavailable."
  },
  "split": {
    "name": "Dumbbell split squat",
    "equipment": "Dumbbells",
    "group": "Legs",
    "sets": 2,
    "target": "2 sets · 8–10 reps / side",
    "steps": [
      "Stand in a stable staggered stance; start without weights if needed.",
      "Bend both knees to lower through a comfortable range while the front foot stays planted.",
      "Push through your front foot to rise; finish one side, then switch."
    ],
    "tip": "Keep the rear heel lifted. Use support for balance."
  },
  "bridge": {
    "name": "Glute bridge",
    "equipment": "Yoga mat",
    "group": "Legs",
    "sets": 2,
    "target": "2 sets · 10–15 reps",
    "steps": [
      "Lie on your back with knees bent and feet flat, comfortably near your hips.",
      "Brace gently and lift your hips by pressing through your feet.",
      "Pause when your torso and thighs align, then lower slowly."
    ],
    "tip": "Finish with your glutes, without overextending your lower back."
  },
  "calf": {
    "name": "Dumbbell calf raise",
    "equipment": "Dumbbells / stable support",
    "group": "Legs",
    "sets": 2,
    "target": "2 sets · 12–15 reps",
    "steps": [
      "Stand tall with feet comfortably apart; use stable support if needed.",
      "Rise onto the balls of your feet with a slow, controlled movement.",
      "Pause briefly, then lower your heels gently to the floor."
    ],
    "tip": "Start without weights if balance is difficult. Avoid bouncing."
  },
  "lateral": {
    "name": "Dumbbell lateral raise",
    "equipment": "Dumbbells",
    "group": "Shoulders",
    "sets": 2,
    "target": "2 sets · 10–15 reps",
    "steps": [
      "Stand tall with light dumbbells at your sides and a small bend in your elbows.",
      "Raise arms out to the sides through a comfortable range, no higher than shoulder level.",
      "Lower slowly without swinging or shrugging."
    ],
    "tip": "Use lighter weights than for a shoulder press."
  },
  "rear": {
    "name": "Dumbbell rear-delt fly",
    "equipment": "Dumbbells",
    "group": "Shoulders",
    "sets": 2,
    "target": "2 sets · 10–15 reps",
    "steps": [
      "Hinge at your hips with soft knees and a steady, comfortable back position.",
      "With a small bend in your elbows, raise the weights out to your sides.",
      "Lower with control while keeping your torso still."
    ],
    "tip": "Keep your neck relaxed and choose a light load."
  },
  "curl": {
    "name": "Dumbbell biceps curl",
    "equipment": "Dumbbells",
    "group": "Arms",
    "sets": 2,
    "target": "2 sets · 10–12 reps",
    "steps": [
      "Stand tall with arms by your sides and palms facing forward.",
      "Bend your elbows to raise the dumbbells while keeping upper arms close to your body.",
      "Lower slowly until your arms return to a comfortable straight position."
    ],
    "tip": "Keep wrists steady and avoid swinging your torso."
  },
  "hammer": {
    "name": "Dumbbell hammer curl",
    "equipment": "Dumbbells",
    "group": "Arms",
    "sets": 2,
    "target": "2 sets · 10–12 reps",
    "steps": [
      "Stand tall with dumbbells at your sides and palms facing inward.",
      "Curl the weights without changing that neutral grip or moving your upper arms.",
      "Lower slowly while keeping your trunk still."
    ],
    "tip": "Use the same controlled motion on both sides."
  },
  "triceps": {
    "name": "Overhead triceps extension",
    "equipment": "One dumbbell",
    "group": "Arms",
    "sets": 2,
    "target": "2 sets · 10–12 reps",
    "steps": [
      "Hold one light dumbbell securely with both hands overhead and brace your trunk.",
      "Bend your elbows to lower the weight behind your head through a comfortable range.",
      "Extend your elbows without arching your back, then repeat slowly."
    ],
    "tip": "Keep upper arms reasonably steady. Skip this movement if overhead positioning is uncomfortable."
  },
  "sideplank": {
    "name": "Side plank",
    "equipment": "Yoga mat",
    "group": "Core",
    "sets": 2,
    "unit": "seconds",
    "target": "2 sets · 15–30 sec / side",
    "steps": [
      "Lie on your side with your elbow beneath your shoulder.",
      "Lift your hips into a steady line; bend your knees for an easier version.",
      "Breathe throughout the hold, then lower and repeat on the other side."
    ],
    "tip": "End the hold when your hips drop or your shoulder feels uncomfortable."
  },
  "birddog": {
    "name": "Bird dog",
    "equipment": "Yoga mat",
    "group": "Core",
    "sets": 2,
    "target": "2 sets · 6–10 reps / side",
    "steps": [
      "Start on hands and knees, with hands under shoulders and knees under hips.",
      "Slowly reach one arm forward and the opposite leg backward while keeping your trunk steady.",
      "Return to the start, then switch sides without twisting or arching."
    ],
    "tip": "Reach long rather than lifting the leg high."
  },
  "carry": {
    "name": "Farmer carry",
    "equipment": "Dumbbells + clear walking space",
    "group": "Carry",
    "sets": 2,
    "unit": "seconds",
    "target": "2 sets · 30–45 sec",
    "steps": [
      "Stand tall holding a manageable dumbbell in each hand.",
      "Walk with short, controlled steps and relaxed shoulders, keeping your trunk upright.",
      "Turn slowly in a clear space, then set the weights down with control."
    ],
    "tip": "The demo steps in place; walk in your clear space, or hold in place if space is limited."
  }
};
  const groups={"squat":"Legs","bench":"Chest","pull":"Back","rdl":"Legs","row":"Back","lunge":"Legs","press":"Shoulders","deadbug":"Core","plank":"Core"};
  for(const [id,exercise] of Object.entries(base))Object.assign(exercise,{group:groups[id],sets:['lunge','press','deadbug','plank'].includes(id)?2:3,unit:id==='plank'?'seconds':'reps'});
  for(const exercise of Object.values(extras))exercise.unit ||= 'reps';
  return {...base,...extras};
})();
if(typeof module!=='undefined')module.exports=ExerciseCatalog;

