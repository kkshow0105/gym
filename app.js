const KEY='jointSafeTrainingPwaV1';

const reps=(sets,count,rest=60,sides='none')=>({mode:'reps',sets,reps:count,rest,up:1,down:3,sides});
const hold=(sets,work,rest=60,sides='none')=>({mode:'hold',sets,work,rest,sides});
const choice=(...options)=>({mode:'choice',options:options.map(([name,config])=>({name,config}))});

const coreChoice=()=>choice(
 ['死虫',reps(3,10,60,'alternating')],
 ['鸟狗',reps(3,10,60,'alternating')],
 ['侧桥',hold(3,20,60,'sequential')]
);

const phases=[
 {id:1,title:'适应与打基础',duration:56,required:20,description:'第 1–8 周：每周 3 次，重建动作控制和稳定性。',tip:'建议按 A / B / A 交替；下周从 B 开始。',workouts:{
  A:[
   ['臀桥','3 × 12–15｜臀部发力，不要过度挺腰',reps(3,14,30)],
   ['墙壁 / 高位俯卧撑','3 × 8–15｜身体保持一条直线',choice(['墙壁俯卧撑',reps(3,12,30)],['高位俯卧撑',reps(3,12,30)])],
   ['弹力带划船','3 × 12–15｜肩不耸，颈部放松',reps(3,14,30)],
   ['鸟狗式','每侧 2–3 × 8–10｜骨盆不晃',reps(3,9,30,'alternating')],
   ['死虫式','每侧 2–3 × 8–10｜不憋气',reps(3,9,30,'alternating')]
  ],
  B:[
   ['箱式浅蹲（坐椅子）','3 × 8–12｜无痛范围，膝盖稳定',reps(3,10,30)],
   ['直腿抬高','每侧 3 × 10–15｜股四头肌收紧',hold(3,20,10,'sequential')],
   ['蚌式开合','每侧 3 × 12–20｜感受臀侧发力',reps(3,16,30,'sequential')],
   ['弹力带下拉','3 × 12–15｜不仰头、不耸肩',reps(3,14,30)],
   ['前平板（高位可）','3 × 15–30 秒｜腰不塌、颈中立',hold(3,20,30)]
  ]}},
 {id:2,title:'增肌与力量基础',duration:112,required:48,description:'第 3–6 个月：每周 3–4 次，逐步增加阻力。',tip:'上肢 / 下肢＋核心交替；所有动作保留 2–3 次余力。',workouts:{
  上肢:[
   ['哑铃地板卧推 / 高位俯卧撑','2–4 × 8–15｜颈部贴稳',choice(['哑铃地板卧推',reps(3,12)],['高位俯卧撑',reps(3,12)])],
   ['单臂哑铃或弹力带划船','2–4 × 8–15｜先收肩胛',choice(['单臂哑铃划船',reps(3,12,60,'sequential')],['弹力带划船',reps(3,12)])],
   ['侧平举','2–3 × 10–15｜轻重量、不耸肩',reps(3,13)],
   ['弹力带下拉','2–4 × 10–15｜拉向锁骨附近',reps(3,13)],
   ['哑铃弯举（可选）','2–3 × 10–15｜动作慢',reps(3,13)]
  ],
  下肢核心:[
   ['臀桥 / 髋推','2–4 × 8–15｜不顶腰',choice(['臀桥',reps(3,12)],['髋推',reps(3,12)])],
   ['哑铃罗马尼亚硬拉','2–4 × 8–12｜髋后移、背中立',reps(3,10,90)],
   ['箱式浅蹲','2–4 × 8–12｜不疼再加幅度',reps(3,10,90)],
   ['低台阶上步（无痛时）','每侧 2–3 × 8–12｜台阶宜低',reps(3,10,90,'alternating')],
   ['死虫 / 鸟狗 / 侧桥','任选 2 项，各 2–3 组｜稳定优先',coreChoice()]
  ]}},
 {id:3,title:'长期巩固',duration:0,required:0,description:'第 7 个月及以后：每周保持 3–4 次，长期可持续。',tip:'可继续上肢 / 下肢＋核心交替；每 6–8 周安排 1 个减量周。',workouts:{
  上肢:[
   ['地板卧推 / 高位俯卧撑','2–4 × 8–15',choice(['地板卧推',reps(3,12)],['高位俯卧撑',reps(3,12)])],
   ['划船','2–4 × 8–15',reps(3,12)],
   ['侧平举或斜靠墙 Y 提拉','2–3 × 10–15',choice(['侧平举',reps(3,13)],['斜靠墙 Y 提拉',reps(3,13)])],
   ['弹力带下拉','2–4 × 10–15',reps(3,13)]
  ],
  下肢核心:[
   ['臀桥 / 髋推','2–4 × 8–15',choice(['臀桥',reps(3,12)],['髋推',reps(3,12)])],
   ['罗马尼亚硬拉','2–4 × 8–12',reps(3,10,90)],
   ['箱式浅蹲或低台阶上步','2–4 × 8–12｜无痛范围',choice(['箱式浅蹲',reps(3,10,90)],['低台阶上步',reps(3,10,90,'alternating')])],
   ['死虫 / 鸟狗 / 侧桥','任选 2 项，各 2–3 组',coreChoice()]
  ]}}
];

const restItems=[
 ['轻松步行','20–40 分钟｜舒适配速，能说完整句子即可',hold(1,1200,0)],
 ['下巴内收','10 秒 × 8–10 次｜后脑勺轻靠墙或仰卧，像轻轻做“双下巴”，不低头；颈部放松',{...hold(9,10,5),unit:'次',setsLabel:'次数',workLabel:'每次秒数'}],
 ['靠墙天使','2 组 × 10–15 次｜肩胛骨轻向后下方收，手臂在无痛范围移动；避免耸肩',reps(2,13)],
 ['弹力带拉开','2 组 × 10–15 次｜肩胛骨轻向后下方收，手臂在无痛范围移动；避免耸肩',reps(2,13)]
];
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
const dateDiff=(a,b)=>Math.max(0,Math.floor((new Date(b+'T12:00')-new Date(a+'T12:00'))/86400000));

let data=JSON.parse(localStorage.getItem(KEY)||'null')||{start:today(),history:[],draft:{}};
if(!data.draft||typeof data.draft!=='object')data.draft={};
if(!data.timerPrefs||typeof data.timerPrefs!=='object')data.timerPrefs={};
if(!data.migrations||typeof data.migrations!=='object')data.migrations={};
if(!data.migrations.phase1Rest30){
 Object.entries(data.timerPrefs).forEach(([key,pref])=>{
  if((key.startsWith('1|A|')||key.startsWith('1|B|'))&&[60,90].includes(pref?.rest))pref.rest=30;
 });
 data.migrations.phase1Rest30=true;
 localStorage.setItem(KEY,JSON.stringify(data));
}

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function completed(){return data.history.filter(x=>x.type==='workout')}
function currentPhase(){const n=completed().length,days=dateDiff(data.start,today());if(days>=56&&n>=20){if(days>=168&&n>=68)return phases[2];return phases[1]}return phases[0]}
function mondayOfWeek(date){const d=new Date(date+'T12:00'),day=d.getDay()||7;d.setDate(d.getDate()-day+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function scheduledPlan(phase){
 const day=new Date(today()+'T12:00').getDay();
 if(phase.id===1){
  if(![1,3,5].includes(day))return {isTraining:false,type:null};
  const week=Math.floor(dateDiff(mondayOfWeek(data.start),today())/7),firstWeek=['A','B','A'],secondWeek=['B','A','B'];
  return {isTraining:true,type:(week%2===0?firstWeek:secondWeek)[[1,3,5].indexOf(day)]};
 }
 const count=completed().filter(x=>x.phase===phase.id).length,keys=Object.keys(phase.workouts);
 return {isTraining:true,type:keys[count%keys.length]};
}
function formatDate(s){return new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(new Date(s+'T12:00'))}

let activePlan={};
function update(){
 const phase=currentPhase(),records=completed(),days=dateDiff(data.start,today()),phaseStart={1:0,2:56,3:168}[phase.id],phaseDays=Math.max(0,days-phaseStart),scheduled=scheduledPlan(phase),record=data.history.find(x=>x.date===today()),isTraining=record?record.type==='workout':scheduled.isTraining,type=record?.workout||scheduled.type,items=isTraining?phase.workouts[type]:restItems,done=!!record;
 activePlan={phase,isTraining,type};
 $('stageBadge').textContent='阶段 '+phase.id;$('stageTitle').textContent=phase.title;$('stageDescription').textContent=phase.description;$('dayText').textContent='计划第 '+(days+1)+' 天';
 $('workoutTitle').textContent=done?(isTraining?'今天已完成：'+type+' 训练':'今天已记录：恢复 / 休息日'):(isTraining?type+' 训练':'恢复 / 休息日');
 $('workoutTip').textContent=done?'已保存今天的记录。':(isTraining?phase.tip:'今天不安排力量训练。完成轻松步行和颈肩维护，动作保持轻柔、无痛。');
 const phaseRecs=records.filter(x=>x.phase===phase.id),pct=phase.required?Math.min(100,Math.round(Math.min(phaseDays/phase.duration,phaseRecs.length/phase.required)*100)):100;
 $('progressFill').style.width=pct+'%';$('progressText').textContent=phase.required?`${phaseRecs.length} / ${phase.required} 次`:'长期保持';
 $('unlockText').textContent=phase.required?`进入下一阶段：本阶段已持续 ${Math.floor(phaseDays/7)} / ${Math.ceil(phase.duration/7)} 周，完成 ${phaseRecs.length} / ${phase.required} 次训练。`:'维持每周 3–4 次；每 6–8 周主动减量一周。';
 $('totalWorkouts').textContent=phaseRecs.length;$('weeksElapsed').textContent=Math.floor(phaseDays/7);$('streak').textContent=streak(records);$('doneTag').hidden=!done;$('checklist').innerHTML='';
 items.forEach((item,i)=>{
  const id=`${today()}-${phase.id}-${type||'rest'}-${i}`,key=`${phase.id}|${type||'rest'}|${item[0]}`,checked=done?true:!!data.draft[id];
  const row=document.createElement('div');row.className='item-row';
  const label=document.createElement('label');label.className='item'+(checked?' checked':'');
  label.innerHTML=`<input type="checkbox" ${checked?'checked':''} ${done?'disabled':''}><div><strong>${item[0]}</strong><span>${item[1]}</span></div>`;
  const checkbox=label.querySelector('input');
  checkbox.onchange=e=>{data.draft[id]=e.target.checked;save();label.classList.toggle('checked',e.target.checked);toggleComplete()};
  const timerButton=document.createElement('button');timerButton.type='button';timerButton.className='timer-button';timerButton.textContent='🔊 声音指导';timerButton.disabled=done;
  timerButton.onclick=()=>openTimer(item,key,checkbox,label,id);
  row.append(label,timerButton);$('checklist').append(row);
 });
 $('completeButton').textContent=isTraining?'完成并记录本次训练':'完成并记录恢复活动';$('completeButton').hidden=!!done;$('restButton').hidden=!!done||!isTraining;toggleComplete();
}
function toggleComplete(){const boxes=[...document.querySelectorAll('#checklist input')];$('completeButton').disabled=!boxes.length||!boxes.every(x=>x.checked)}
function streak(records){let c=0,d=new Date(today()+'T12:00');const set=new Set(records.map(x=>x.date));while(set.has(d.toISOString().slice(0,10))){c++;d.setDate(d.getDate()-1)}return c}
function complete(){const {phase,isTraining,type}=activePlan;data.history.push({date:today(),type:isTraining?'workout':'rest',phase:phase.id,workout:isTraining?type:null});data.draft={};save();update()}
function history(){const list=$('historyList');list.innerHTML=data.history.length?data.history.slice().reverse().map(x=>`<div class="history-item"><strong>${formatDate(x.date)} · ${x.type==='workout'?`阶段 ${x.phase} ${x.workout} 训练`:'恢复 / 休息'}</strong><span>${x.type==='workout'?'已完成全部训练项目':'未计入阶段训练次数'}</span></div>`).join(''):'<p class="hint">还没有记录。完成今天的所有项目后，会显示在这里。</p>';$('historyDialog').showModal()}

let timerSetup=null,timerSession=null,audioContext=null,wakeLock=null,speechVoices=[],speechGeneration=0;
const speechUtterances=new Set(),speechTimers=new Set();

function selectedTimerConfig(){
 const base=timerSetup.item[2];
 if(base.mode!=='choice')return base;
 return base.options[Number($('timerChoice').value)||0].config;
}
function timerChoiceName(){
 const base=timerSetup.item[2];
 return base.mode==='choice'?base.options[Number($('timerChoice').value)||0].name:timerSetup.item[0];
}
function openTimer(item,key,checkbox,label,draftId){
 timerSetup={item,key,checkbox,label,draftId};
 prepareSpeech();
 const pref=data.timerPrefs[key]||{},base=item[2];
 $('timerTitle').textContent=item[0];$('timerSetup').hidden=false;$('timerRunning').hidden=true;
 $('timerChoiceLabel').hidden=base.mode!=='choice';$('timerChoice').innerHTML='';
 if(base.mode==='choice'){
  base.options.forEach((option,i)=>{const el=document.createElement('option');el.value=i;el.textContent=option.name;$('timerChoice').append(el)});
  const savedIndex=Math.max(0,base.options.findIndex(x=>x.name===pref.choice));$('timerChoice').value=String(savedIndex);
 }
 fillTimerFields(pref);$('timerDialog').showModal();
}
function fillTimerFields(pref={}){
 const config=selectedTimerConfig(),isRep=config.mode==='reps';
 $('timerRepsLabel').hidden=!isRep;$('timerWorkLabel').hidden=isRep;
 $('timerSetsText').textContent=config.setsLabel||'组数';$('timerWorkText').textContent=config.workLabel||'每组秒数';
 $('timerSets').value=pref.sets??config.sets;$('timerRest').value=pref.rest??config.rest;
 if(isRep)$('timerReps').value=pref.reps??config.reps;else $('timerWork').value=pref.work??config.work;
 const sideText=config.sides==='alternating'?'左右交替':config.sides==='sequential'?'先左侧、再右侧':'无需换边';
 $('timerSetupHint').textContent=isRep?`每次约 ${config.up+config.down} 秒（起 ${config.up} 秒、落 ${config.down} 秒），${sideText}。`:`每${config.unit||'组'}保持指定时间，${sideText}。`;
}
function readNumber(id,fallback,min,max){const value=Math.round(Number($(id).value));return Number.isFinite(value)?Math.min(max,Math.max(min,value)):fallback}
function currentRuntimeConfig(){
 const base=selectedTimerConfig(),config={...base};
 config.sets=readNumber('timerSets',base.sets,1,10);config.rest=readNumber('timerRest',base.rest,0,300);
 if(config.mode==='reps')config.reps=readNumber('timerReps',base.reps,1,50);else config.work=readNumber('timerWork',base.work,5,3600);
 return config;
}
function makeStep(kind,duration,phase,meta,speech,tone,reminders=[]){return {kind,duration,phase,meta,speech,tone,reminders}}
function workReminders(seconds){const result=[];if(seconds>15)result.push({remaining:10,text:'还剩十秒'});if(seconds>8)result.push({remaining:5,text:'还剩五秒'});return result}
function restReminders(seconds){return seconds>15?[{remaining:10,text:'还有十秒'}]:[]}
function buildRepSteps(config){
 const steps=[],addRep=(set,repNumber,side='')=>{
  const sideText=side?side+'侧 · ':'';
  steps.push(makeStep('work',config.up,'发力',`第 ${set}/${config.sets} 组 · ${sideText}第 ${repNumber}/${config.reps} 次`,`${side}${repNumber}，起`,'start'));
  steps.push(makeStep('move',config.down,'缓慢还原',`第 ${set}/${config.sets} 组 · ${sideText}第 ${repNumber}/${config.reps} 次`,'落','move'));
 };
 for(let set=1;set<=config.sets;set++){
  if(config.sides==='sequential'){
   for(let rep=1;rep<=config.reps;rep++)addRep(set,rep,'左');
   steps.push(makeStep('switch',10,'准备换边',`第 ${set}/${config.sets} 组 · 接下来右侧`,'左侧完成，十秒后换右侧','rest',restReminders(10)));
   for(let rep=1;rep<=config.reps;rep++)addRep(set,rep,'右');
  }else if(config.sides==='alternating'){
   for(let rep=1;rep<=config.reps;rep++){addRep(set,rep,'左');addRep(set,rep,'右')}
  }else{
   for(let rep=1;rep<=config.reps;rep++)addRep(set,rep);
  }
  if(set<config.sets&&config.rest>0)steps.push(makeStep('rest',config.rest,'组间休息',`已完成第 ${set} 组 · 下一组 ${set+1}/${config.sets}`,`第${set}组完成，休息${config.rest}秒`,'rest',restReminders(config.rest)));
 }
 return steps;
}
function buildHoldSteps(config){
 const steps=[],unit=config.unit||'组',addWork=(set,side='')=>steps.push(makeStep('work',config.work,'保持',`${side?side+'侧 · ':''}第 ${set}/${config.sets} ${unit}`,`${side}第${set}${unit}，开始`,'start',workReminders(config.work))),addRest=(set,side='')=>{if(config.rest>0)steps.push(makeStep('rest',config.rest,'放下休息',`${side?side+'侧 · ':''}已完成第 ${set} ${unit}`,`放下，休息${config.rest}秒`,'rest',restReminders(config.rest)))};
 if(config.sides==='sequential'){
  ['左','右'].forEach((side,sideIndex)=>{
   for(let set=1;set<=config.sets;set++){addWork(set,side);if(set<config.sets)addRest(set,side)}
   if(sideIndex===0)steps.push(makeStep('switch',10,'准备换边','左侧完成 · 接下来右侧','左侧完成，十秒后换右侧','rest',restReminders(10)));
  });
 }else{
  for(let set=1;set<=config.sets;set++){addWork(set);if(set<config.sets)addRest(set)}
 }
 return steps;
}
function buildTimerSteps(config,exerciseName){
 const preparation=makeStep('prepare',10,'准备',`${exerciseName} · 10 秒后开始`,`${exerciseName}，十秒后开始`,'start',[
  {remaining:3,text:'三'},
  {remaining:2,text:'二'},
  {remaining:1,text:'一'}
 ]);
 const exerciseSteps=config.mode==='reps'?buildRepSteps(config):buildHoldSteps(config);
 return [preparation,...exerciseSteps];
}

async function prepareAudio(){
 const AudioCtor=window.AudioContext||window.webkitAudioContext;
 if(AudioCtor&&!audioContext)audioContext=new AudioCtor();
 if(audioContext?.state==='suspended')await audioContext.resume().catch(()=>{});
}
function updateSpeechVoices(){
 if(!('speechSynthesis' in window))return [];
 speechVoices=window.speechSynthesis.getVoices();
 return speechVoices;
}
function preferredChineseVoice(){
 const voices=updateSpeechVoices();
 return voices.find(voice=>voice.lang.toLowerCase()==='zh-cn')||voices.find(voice=>voice.lang.toLowerCase().startsWith('zh'))||null;
}
function prepareSpeech(timeout=900){
 if(!('speechSynthesis' in window))return Promise.resolve();
 const synth=window.speechSynthesis;synth.resume();
 if(updateSpeechVoices().length)return Promise.resolve();
 return new Promise(resolve=>{
  let timer;
  const done=()=>{clearTimeout(timer);synth.removeEventListener?.('voiceschanged',changed);updateSpeechVoices();resolve()};
  const changed=()=>{if(updateSpeechVoices().length)done()};
  synth.addEventListener?.('voiceschanged',changed);timer=window.setTimeout(done,timeout);
 });
}
function scheduleSpeech(callback,delay){
 const timer=window.setTimeout(()=>{speechTimers.delete(timer);callback()},delay);speechTimers.add(timer);
}
function cancelSpeech(){
 speechGeneration++;speechTimers.forEach(timer=>clearTimeout(timer));speechTimers.clear();speechUtterances.clear();window.speechSynthesis?.cancel();
}
function playTone(type){
 if(!audioContext||audioContext.state!=='running')return;
 const frequencies=type==='complete'?[660,880,1100]:[type==='rest'?390:type==='move'?620:880];
 frequencies.forEach((frequency,index)=>{
  const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime+index*.16;
  oscillator.frequency.value=frequency;oscillator.type='sine';gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.16,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+.13);oscillator.connect(gain).connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+.14);
 });
}
function speak(text,interrupt=false){
 if(!('speechSynthesis' in window)||!text)return;
 if(interrupt)cancelSpeech();
 const generation=speechGeneration,synth=window.speechSynthesis;
 const attempt=retried=>{
  if(generation!==speechGeneration)return;
  const utterance=new SpeechSynthesisUtterance(text),voice=preferredChineseVoice();
  utterance.lang='zh-CN';utterance.rate=1.25;utterance.volume=1;if(voice)utterance.voice=voice;
  let started=false,handled=false,watchdog;
  const cleanup=()=>{clearTimeout(watchdog);speechUtterances.delete(utterance)};
  const retry=()=>{if(handled)return;handled=true;cleanup();if(!retried&&generation===speechGeneration){synth.cancel();scheduleSpeech(()=>attempt(true),180)}};
  utterance.onstart=()=>{started=true;clearTimeout(watchdog)};utterance.onend=()=>{handled=true;cleanup()};utterance.onerror=retry;
  speechUtterances.add(utterance);synth.resume();synth.speak(utterance);
  if(interrupt&&!retried)watchdog=window.setTimeout(()=>{if(!started)retry()},1200);
 };
 scheduleSpeech(()=>attempt(false),180);
}
async function requestWakeLock(){
 if(!('wakeLock' in navigator)){$('timerNotice').textContent='当前浏览器不支持屏幕常亮，请暂时关闭手机自动锁屏。';return}
 try{wakeLock=await navigator.wakeLock.request('screen');$('timerNotice').textContent='训练期间屏幕将保持常亮；切到后台会自动暂停。'}catch{$('timerNotice').textContent='无法保持屏幕常亮，请保持页面在前台并留意自动锁屏。'}
}
async function releaseWakeLock(){if(wakeLock){await wakeLock.release().catch(()=>{});wakeLock=null}}

async function startTimer(){
 const config=currentRuntimeConfig(),choiceName=timerChoiceName(),base=timerSetup.item[2];
 data.timerPrefs[timerSetup.key]={choice:base.mode==='choice'?choiceName:null,sets:config.sets,reps:config.reps,work:config.work,rest:config.rest};save();
 await prepareAudio();await prepareSpeech();requestWakeLock();
 const steps=buildTimerSteps(config,choiceName),total=steps.reduce((sum,step)=>sum+step.duration,0);
 timerSession={steps,index:-1,remaining:0,deadline:0,interval:null,paused:false,completed:false,doneDuration:0,total,current:null,announced:new Set()};
 $('timerSetup').hidden=true;$('timerRunning').hidden=false;$('timerRunning').className='timer-running';$('timerPauseButton').hidden=false;$('timerPauseButton').textContent='暂停';$('timerStopButton').textContent='提前结束';
 advanceTimerStep();
}
function advanceTimerStep(){
 if(!timerSession||timerSession.paused)return;
 if(timerSession.current)timerSession.doneDuration+=timerSession.current.duration;
 timerSession.index++;
 if(timerSession.index>=timerSession.steps.length){finishTimer();return}
 const step=timerSession.steps[timerSession.index];timerSession.current=step;timerSession.remaining=step.duration;timerSession.deadline=performance.now()+step.duration*1000;timerSession.announced=new Set();
 $('timerPhase').textContent=step.phase;$('timerMeta').textContent=step.meta;$('timerRunning').className='timer-running'+(['rest','switch'].includes(step.kind)?' is-rest':'');
 playTone(step.tone);speak(step.speech,['rest','switch','prepare'].includes(step.kind));
 clearInterval(timerSession.interval);timerSession.interval=window.setInterval(tickTimer,100);tickTimer();
}
function tickTimer(){
 if(!timerSession||timerSession.paused||!timerSession.current)return;
 timerSession.remaining=Math.max(0,(timerSession.deadline-performance.now())/1000);
 $('timerCountdown').textContent=Math.ceil(timerSession.remaining);
 const elapsed=timerSession.doneDuration+(timerSession.current.duration-timerSession.remaining),pct=timerSession.total?Math.min(100,elapsed/timerSession.total*100):100;
 $('timerProgressFill').style.width=pct+'%';
 timerSession.current.reminders.forEach(reminder=>{if(timerSession.remaining<=reminder.remaining&&!timerSession.announced.has(reminder.remaining)){timerSession.announced.add(reminder.remaining);speak(reminder.text)}});
 if(timerSession.remaining<=.03){clearInterval(timerSession.interval);advanceTimerStep()}
}
function pauseTimer(auto=false){
 if(!timerSession||timerSession.paused||timerSession.completed)return;
 timerSession.remaining=Math.max(0,(timerSession.deadline-performance.now())/1000);timerSession.paused=true;clearInterval(timerSession.interval);cancelSpeech();releaseWakeLock();
 $('timerRunning').classList.add('is-paused');$('timerPhase').textContent='已暂停';$('timerPauseButton').textContent='继续';
 $('timerNotice').textContent=auto?'页面进入后台，计时已自动暂停。返回后点“继续”。':'计时已暂停，准备好后继续。';
 if(!auto){playTone('rest');speak('已暂停',true)}
}
async function resumeTimer(){
 if(!timerSession||!timerSession.paused)return;
 await prepareAudio();await requestWakeLock();timerSession.paused=false;timerSession.deadline=performance.now()+timerSession.remaining*1000;
 $('timerRunning').classList.remove('is-paused');$('timerPhase').textContent=timerSession.current.phase;$('timerPauseButton').textContent='暂停';playTone('start');speak('继续',true);timerSession.interval=window.setInterval(tickTimer,100);tickTimer();
}
function finishTimer(){
 if(!timerSession)return;
 clearInterval(timerSession.interval);timerSession.completed=true;timerSession.current=null;releaseWakeLock();playTone('complete');speak(`${timerChoiceName()}，训练完成`,true);
 $('timerRunning').className='timer-running is-complete';$('timerPhase').textContent='项目完成';$('timerCountdown').textContent='完成';$('timerMeta').textContent='已自动勾选这个训练项目';$('timerProgressFill').style.width='100%';$('timerNotice').textContent='如实际未完成，可关闭后手动取消勾选。';$('timerPauseButton').hidden=true;$('timerStopButton').textContent='关闭';
 timerSetup.checkbox.checked=true;data.draft[timerSetup.draftId]=true;save();timerSetup.label.classList.add('checked');toggleComplete();
}
function clearTimer(){
 if(timerSession?.interval)clearInterval(timerSession.interval);timerSession=null;cancelSpeech();releaseWakeLock();
}
function closeTimer(){
 if(timerSession&&!timerSession.completed&&!confirm('计时尚未完成，确定提前结束吗？本项目不会自动勾选。'))return;
 clearTimer();$('timerDialog').close();
}

$('completeButton').onclick=complete;
$('restButton').onclick=()=>{if(!data.history.some(x=>x.date===today())){data.history.push({date:today(),type:'rest',phase:activePlan.phase.id,workout:null});save()}update()};
$('settingsButton').onclick=()=>{$('startDate').value=data.start;$('settingsDialog').showModal()};
$('saveSettings').onclick=()=>{if($('startDate').value){data.start=$('startDate').value;save();update()}};
$('resetButton').onclick=()=>{if(confirm('确定清除所有训练记录和声音指导偏好吗？此操作无法撤销。')){data={start:today(),history:[],draft:{},timerPrefs:{}};save();$('settingsDialog').close();update()}};
$('historyButton').onclick=history;
$('timerChoice').onchange=()=>fillTimerFields();
$('timerStartButton').onclick=startTimer;
$('timerPauseButton').onclick=()=>timerSession?.paused?resumeTimer():pauseTimer(false);
$('timerStopButton').onclick=()=>timerSession?.completed?closeTimer():closeTimer();
$('timerCloseButton').onclick=closeTimer;
$('timerDialog').addEventListener('cancel',event=>{event.preventDefault();closeTimer()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&timerSession&&!timerSession.paused&&!timerSession.completed)pauseTimer(true)});
window.addEventListener('pagehide',()=>{if(timerSession&&!timerSession.completed)pauseTimer(true)});

if('speechSynthesis' in window){updateSpeechVoices();window.speechSynthesis.addEventListener?.('voiceschanged',updateSpeechVoices)}
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));
update();
