(() => {
 'use strict';
 const store=window.WorkoutRecordStore,$=id=>document.getElementById(id);
 const home=document.querySelector('main.shell'),version=document.querySelector('.app-version');
 const dialog=$('recordCheckDialog'),form=$('recordCheckForm'),input=$('recordCheckInput'),confirmInput=$('recordConfirmInput');
 const page=$('recordPage'),list=$('recordList'),status=$('recordStatus'),submit=$('recordCheckSubmit');
 let taps=0,tapStart=0,tapTimer,epoch=0,mode='check',busy=false,session=null,records=[];
 let writes=Promise.resolve(),saveFailed=false,statusTimer,pendingWrites=0;

 function resetGesture(){taps=0;tapStart=0;clearTimeout(tapTimer)}
 function clearInputs(){input.value='';confirmInput.value=''}
 function message(text){$('recordCheckMessage').textContent=text}
 function setStatus(text,error=false){
  clearTimeout(statusTimer);status.textContent=text;status.classList.toggle('is-error',error);
  if(text&&!error)statusTimer=setTimeout(()=>{status.textContent=''},1800);
 }
 function setMode(next){
  mode=next;clearInputs();message('');
  const setup=next==='setup',done=next==='done';
  $('recordCheckTitle').textContent=setup?'本地校验设置':'训练数据校验';
  $('recordCheckDescription').textContent=setup?'首次使用，请设置6位校验数字并再次确认。请牢记此数字。':'用于检查本地训练记录及计划数据。';
  $('recordConfirmLabel').hidden=!setup;
  $('recordCheckLabel').hidden=done;
  input.type=setup?'password':'text';
  input.placeholder=setup?'设置6位校验数字':'输入校验日期（格式20260512）';
  $('recordCheckLabel').querySelector('span').textContent=setup?'6位校验数字':'校验日期';
  submit.textContent=setup?'完成设置':done?'完成':'开始检测';
  $('recordCheckCancel').hidden=done;
  $('recordCheckResult').hidden=!done;
 }
 function lock(){
  epoch++;resetGesture();busy=false;submit.disabled=false;
  // Hide and discard plaintext synchronously, before any awaited work or repaint.
  page.hidden=true;home.hidden=false;
  list.querySelectorAll('textarea').forEach(el=>{el.value='';el.textContent=''});
  list.replaceChildren();records.fill('');records=[];
  if(session)session.key=null;
  session=null;clearInputs();message('');setStatus('');
  if(dialog.open)dialog.close();
 }
 async function openCheck(){
  const token=++epoch;busy=true;
  try{
   await writes;
   const vault=await store.read();
   if(token!==epoch||document.hidden)return;
   setMode(vault?'check':'setup');dialog.showModal();input.focus();
  }catch{
   if(token!==epoch||document.hidden)return;
   setMode('check');dialog.showModal();message('当前无法读取本地数据，请稍后重试。');
  }finally{if(token===epoch)busy=false}
 }
 version.addEventListener('click',()=>{
  if(busy||dialog.open||session)return;
  const now=performance.now();
  if(!taps||now-tapStart>=3000){resetGesture();tapStart=now;tapTimer=setTimeout(resetGesture,3000)}
  if(++taps===7){resetGesture();openCheck()}
 });
 function validDate(value){
  if(!/^\d{8}$/.test(value))return false;
  const year=Number(value.slice(0,4)),month=Number(value.slice(4,6)),day=Number(value.slice(6,8));
  if(year<1||month<1||month>12||day<1)return false;
  const leap=year%4===0&&(year%100!==0||year%400===0);
  return day<=[31,leap?29:28,31,30,31,30,31,31,30,31,30,31][month-1];
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;
  if(mode==='done'){lock();return}
  let digits=input.value,confirmation=confirmInput.value;
  const token=epoch;
  if(mode==='setup'){
   if(!/^\d{6}$/.test(digits)){message('请输入6位数字');return}
   if(digits!==confirmation){message('两次输入不一致，请重新确认');return}
  }else{
   // Six digits are always handled first; an eight-digit date never unlocks records.
   if(digits.length!==6){
    if(validDate(digits)){setMode('done');return}
    message('输入日期格式不正确');return;
   }
   if(!/^\d{6}$/.test(digits)){message('输入日期格式不正确');return}
  }
  busy=true;submit.disabled=true;message('');clearInputs();
  try{
   if(mode==='setup'){
    await store.create(digits);digits='';confirmation='';
    if(token!==epoch||document.hidden)return;
    setMode('check');input.focus();
   }else{
    const vault=await store.read();
    if(token!==epoch||document.hidden)return;
    const opened=await store.unlock(digits,vault);digits='';
    if(token!==epoch||document.hidden){opened.records.fill('');opened.key=null;return}
    session={key:opened.key,meta:opened.meta};records=opened.records;saveFailed=false;
    render();dialog.close();home.hidden=true;page.hidden=false;$('recordBack').focus();window.scrollTo(0,0);
   }
  }catch{
   if(token===epoch&&!document.hidden)message(mode==='setup'?'无法完成本地设置，请稍后重试。':'输入日期格式不正确');
  }finally{
   digits='';confirmation='';
   if(token===epoch){busy=false;submit.disabled=false}
  }
 });
 function saveRecords(){
  if(!session||saveFailed)return;
  const token=epoch,meta=session.meta;
  pendingWrites++;setStatus('正在保存…');
  // Start encryption immediately, so a background event can remove plaintext safely.
  const encrypted=store.encrypt(session.key,records);
  // Attach a rejection handler immediately, even if an older write is still pending.
  const packet=encrypted.then(value=>({value}),()=>({error:true}));
  writes=writes.then(async()=>{
   if(saveFailed)return;
   const result=await packet;
   if(result.error)throw new Error('storage');
   await store.commit(meta,result.value);
  }).catch(()=>{
   saveFailed=true;
   if(token===epoch&&session){
    list.querySelectorAll('textarea,button').forEach(el=>{el.disabled=true});$('recordAdd').disabled=true;
    setStatus('保存未完成：存储空间不足或数据已在其他窗口更改。请先复制本次内容，再返回重试。',true);
    // Copy remains available to recover unsaved text.
    list.querySelectorAll('[data-copy]').forEach(el=>{el.disabled=false});
   }
  }).finally(()=>{
   pendingWrites--;
   if(!pendingWrites&&!saveFailed&&token===epoch&&session)setStatus('已自动保存');
  });
 }
 async function copy(text,button){
  const token=epoch;
  const fallback=()=>{
   if(!session||token!==epoch)return false;
   const el=document.createElement('textarea');el.value=text;el.readOnly=true;
   el.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';page.append(el);
   el.focus();el.select();el.setSelectionRange(0,text.length);
   let ok=false;try{ok=document.execCommand('copy')}finally{el.value='';el.remove();button.focus({preventScroll:true})}
   return ok;
  };
  let ok=false;
  if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);ok=true}catch{ok=fallback()}}
  else ok=fallback();
  text='';if(token===epoch&&session){
   if(saveFailed){button.textContent=ok?'已复制':'重试';setTimeout(()=>{button.textContent='复制'},1800)}
   else setStatus(ok?'已复制':'复制未完成，请长按输入框选中并复制。',!ok);
  }
 }
 function render(){
  list.replaceChildren();$('recordAdd').disabled=false;
  records.forEach((text,index)=>{
   const row=document.createElement('div');row.className='record-row';
   const number=document.createElement('button');number.type='button';number.className='record-number';
   number.textContent=String(index+1).padStart(2,'0');number.setAttribute('aria-label',`删除第${index+1}条记录`);
   number.addEventListener('click',()=>{
    if(!session||saveFailed||!confirm('确定删除这条记录吗？'))return;
    if(!session||document.hidden)return;
    records.splice(index,1);saveRecords();render();
   });
   const field=document.createElement('textarea');field.rows=1;field.value=text;field.setAttribute('aria-label',`第${index+1}条记录`);
   field.autocomplete='off';field.spellcheck=false;field.setAttribute('autocapitalize','off');field.setAttribute('autocorrect','off');
   const fit=()=>{field.style.height='auto';field.style.height=Math.min(260,Math.max(44,field.scrollHeight+2))+'px'};
   field.addEventListener('input',()=>{if(session&&!saveFailed){fit();records[index]=field.value;saveRecords()}});
   requestAnimationFrame(()=>{if(session&&field.isConnected)fit()});
   const button=document.createElement('button');button.type='button';button.className='small-button';button.textContent='复制';button.dataset.copy='';
   // Read the live field, not a value captured when the row was rendered.
   button.addEventListener('click',()=>{if(session)copy(field.value,button)});
   row.append(number,field,button);list.append(row);
  });
 }
 $('recordAdd').addEventListener('click',()=>{if(!session||saveFailed)return;records.push('');saveRecords();render();list.lastElementChild.querySelector('textarea').focus()});
 $('recordBack').addEventListener('click',()=>{
  if(saveFailed&&!confirm('部分修改尚未保存，返回将丢弃这些修改。确定返回吗？'))return;
  lock();window.scrollTo(0,0);
 });
 $('recordCheckCancel').addEventListener('click',lock);
 dialog.addEventListener('cancel',event=>{event.preventDefault();lock()});
 input.addEventListener('input',()=>message(''));confirmInput.addEventListener('input',()=>message(''));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)lock()},{capture:true});
 window.addEventListener('pagehide',lock,{capture:true});
 window.addEventListener('pageshow',event=>{if(event.persisted)lock()},{capture:true});
 // An extra synchronous guard for iOS focus changes and app-switcher snapshots.
 window.addEventListener('blur',event=>{if(event.target===window)lock()},{capture:true});
 window.addEventListener('beforeunload',event=>{if(pendingWrites){event.preventDefault();event.returnValue=''}});
 lock();
})();
