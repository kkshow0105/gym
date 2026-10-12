/* Run with existing Playwright only; this script never downloads browsers.
   All browser contexts and data are independent of the user's browser. */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {execFileSync}=require('node:child_process');
const {randomInt}=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'output','local-records');
fs.mkdirSync(out,{recursive:true});
// Read the public pre-release source from preserved Git history, not local backups.
const baselineRevision='3c5abdc4aab8ceb1b573c5259770780d79fd3548';
const gitRoot=fs.existsSync(path.join(root,'.git'))?root:path.join(root,'release-gym');
const baseline=new Map(['index.html','style.css','app.js','manifest.webmanifest','sw.js','icon.svg'].map(name=>[
 name,execFileSync('git',['-c','safe.directory='+gitRoot,'-C',gitRoot,'show',baselineRevision+':'+name],{encoding:'utf8',stdio:['ignore','pipe','pipe']})
]));
const oldCache=baseline.get('sw.js').match(/training-checkin-v\d+/)[0];
const priorRecords=new Map(['index.html','style.css','app.js','manifest.webmanifest','sw.js','icon.svg','hidden-records.js','record-store.js','records.css'].map(name=>{
 let source=fs.readFileSync(path.join(root,name),'utf8');
 if(name==='index.html')source=source.replace('<span class="app-version">1.2</span>','<span class="app-version">1.1</span>');
 if(name==='sw.js')source=source.replace('training-checkin-v12','training-checkin-v11');
 return [name,source];
}));
const seed=JSON.stringify({start:'2026-08-01',history:[{date:'2026-08-03',type:'workout',phase:1,workout:'A'},{date:'2026-08-04',type:'rest',phase:1,workout:null}],draft:{'sample-existing-draft':true},timerPrefs:{'1|A|臀桥':{sets:3,reps:14,rest:30}},migrations:{phase1Rest30:true}});
const key='jointSafeTrainingPwaV1';
let checks=0,legacyMode=false;
function pass(name){checks++;console.log('PASS '+name)}
const server=http.createServer((req,res)=>{
 let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(pathname==='/')pathname='/index.html';
 let file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 let source;
 if(pathname.startsWith('/before/')){
  const name=pathname.slice(8);source=baseline.get(name);file=path.join(root,name);
 }else if(legacyMode){source=(legacyMode==='records'?priorRecords:baseline).get(pathname.slice(1))}
 if(source===undefined&&(!fs.existsSync(file)||!fs.statSync(file).isFile())){res.writeHead(404);res.end();return}
 const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png'};
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
 res.setHeader('Cache-Control','no-cache');if(source!==undefined)res.end(source);else fs.createReadStream(file).pipe(res);
});
async function seven(page){for(let i=0;i<7;i++)await page.locator('.app-version').click();await page.locator('#recordCheckDialog').waitFor({state:'visible'})}
async function submit(page,value){await page.locator('#recordCheckInput').fill(value);await page.locator('#recordCheckSubmit').click()}
async function unlock(page,pin){await seven(page);await submit(page,pin);await page.locator('#recordPage').waitFor({state:'visible'})}
async function checkDisplay(page){
 const field=page.locator('#recordCheckInput');
 assert.equal(await field.getAttribute('type'),'text');
 assert.equal(await field.getAttribute('inputmode'),'numeric');
 assert.equal(await field.getAttribute('autocomplete'),'off');
 assert.equal(await page.locator('#recordConfirmInput').getAttribute('type'),'password');
 await field.fill('20260512');assert.ok((await field.inputValue())==='20260512','Date input must preserve digits');
 const display=await field.evaluate(el=>{
  const geometry=()=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {x:r.x,y:r.y,width:r.width,height:r.height,font:s.font,border:s.border,padding:s.padding}};
  const current=geometry(),security=getComputedStyle(el).getPropertyValue('-webkit-text-security');
  el.type='password';const previous=geometry();el.type='text';return {current,previous,security};
 });
 assert.deepEqual(display.current,display.previous);assert.equal(display.security,'none');await field.fill('');
}
async function vault(page){return page.evaluate(async()=>{
 const v=await WorkoutRecordStore.read();return v?{revision:v.revision,iv:Array.from(v.iv),cipher:Array.from(new Uint8Array(v.ciphertext)),fields:Object.keys(v).sort()}:null;
})}
async function waitRevision(page,n){await page.waitForFunction(async n=>(await WorkoutRecordStore.read())?.revision>=n,n)}
async function fields(page){return page.locator('#recordList textarea').evaluateAll(els=>els.map(el=>el.value))}
async function locked(page){assert.equal(await page.locator('#recordPage').isVisible(),false);assert.equal(await page.locator('main.shell').first().isVisible(),true);assert.equal(await page.locator('#recordList textarea').count(),0)}
async function setup(page,pin){await seven(page);assert.equal(await page.locator('#recordCheckTitle').textContent(),'本地校验设置');await page.locator('#recordCheckInput').fill(pin);await page.locator('#recordConfirmInput').fill(pin);await page.locator('#recordCheckSubmit').click();await page.waitForFunction(()=>document.getElementById('recordCheckTitle').textContent==='训练数据校验')}

async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 const contexts=[];
 async function context(options={}){
  const c=await browser.newContext({viewport:{width:390,height:844},...options});contexts.push(c);
  await c.addInitScript(({key,seed})=>{if(!localStorage.getItem(key))localStorage.setItem(key,seed)},{key,seed});return c;
 }
 try{
  const baseline=await context({serviceWorkers:'block'}),before=await baseline.newPage();
  await before.goto(url+'/before/index.html');await before.locator('.app-version').evaluate(el=>{el.textContent='1.2'});const original=await before.screenshot({path:path.join(out,'home-before.png'),fullPage:true,animations:'disabled'});
  const c=await context({permissions:['clipboard-read','clipboard-write']}),page=await c.newPage();
  const errors=[];page.on('pageerror',()=>errors.push('page error'));
  await page.goto(url+'/index.html');await page.evaluate(()=>navigator.serviceWorker.ready);
  assert.equal(await page.locator('.app-version').textContent(),'1.2');assert.equal(await vault(page),null);pass('release version 1.2 and fresh installation');
  const current=await page.screenshot({path:path.join(out,'home-after.png'),fullPage:true,animations:'disabled'});
  assert.ok(original.equals(current),'Home pixels changed');
  await before.setViewportSize({width:1280,height:900});await page.setViewportSize({width:1280,height:900});
  assert.ok((await before.screenshot({fullPage:true,animations:'disabled'})).equals(await page.screenshot({fullPage:true,animations:'disabled'})),'Desktop home pixels changed');
  await before.setViewportSize({width:390,height:844});await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),seed);pass('home pixel identity and training data preservation');
  for(let i=0;i<6;i++)await page.locator('.app-version').click();assert.equal(await page.locator('#recordCheckDialog').isVisible(),false);
  await page.waitForTimeout(3100);await page.locator('.app-version').click();assert.equal(await page.locator('#recordCheckDialog').isVisible(),false);
  for(let i=0;i<5;i++)await page.locator('.app-version').click();assert.equal(await page.locator('#recordCheckDialog').isVisible(),false);
  await page.locator('.app-version').click();await page.locator('#recordCheckDialog').waitFor({state:'visible'});pass('seven clicks and timeout reset');
  await page.locator('#recordCheckCancel').click();assert.equal(await vault(page),null);pass('cancel does not initialize');
  const pin=String(randomInt(0,1000000)).padStart(6,'0'),wrong=String((Number(pin)+1)%1000000).padStart(6,'0');
  await seven(page);assert.equal(await page.locator('#recordCheckInput').getAttribute('type'),'password');assert.equal(await page.locator('#recordConfirmInput').getAttribute('type'),'password');await page.locator('#recordCheckInput').fill(pin);await page.locator('#recordConfirmInput').fill(wrong);await page.locator('#recordCheckSubmit').click();
  assert.equal(await vault(page),null);assert.equal(await page.locator('#recordCheckMessage').textContent(),'两次输入不一致，请重新确认');
  await page.locator('#recordConfirmInput').fill(pin);await page.locator('#recordCheckSubmit').click();
  await page.waitForFunction(()=>document.getElementById('recordCheckTitle').textContent==='训练数据校验');
  assert.equal(await page.locator('#recordCheckInput').inputValue(),'');assert.equal(await page.locator('#recordPage').isVisible(),false);
  await checkDisplay(page);pass('double confirmation, masked setup and plaintext numeric check');
  const initial=await vault(page);
  for(const bad of [wrong,'12345','1234567','202605121','abc123','2026abcd','00000101','20260001','20261301','20260100','20260132','20260431','20260229','19000229','21000229']){
   await submit(page,bad);await page.waitForFunction(()=>document.getElementById('recordCheckMessage').textContent==='输入日期格式不正确');assert.equal(await page.locator('#recordPage').isVisible(),false);
  }pass('wrong six digits and invalid lengths, characters, Gregorian dates');
  for(const good of ['20260512','20240229','20000229','00010101','99991231']){
   await submit(page,good);assert.equal(await page.locator('#recordCheckResult').textContent(),'检测完成，当前训练数据正常，无须修复。');
   await page.locator('#recordCheckSubmit').click();await locked(page);await seven(page);
  }
  assert.deepEqual(await vault(page),initial);assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),seed);pass('valid dates simulate detection without changing any data');
  await submit(page,pin);await page.locator('#recordPage').waitFor({state:'visible'});assert.deepEqual(await fields(page),['','','']);pass('six digits unlock; no ordinary reinitialization');
  await page.locator('#recordAdd').click();await waitRevision(page,1);
  const text='00123 Abc 普通文本\n第二行 0',last='000007';
  await page.locator('#recordList textarea').nth(0).fill(text);await page.locator('#recordList textarea').nth(3).fill(last);await waitRevision(page,3);
  await page.locator('[data-copy]').first().click();assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),text);pass('full content copy including leading zeros and line breaks');
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined})});
  await page.locator('[data-copy]').nth(3).click();assert.equal(await page.locator('#recordStatus').textContent(),'已复制');pass('legacy selection clipboard fallback');
  const encrypted=await vault(page);assert.deepEqual(encrypted.fields,['ciphertext','iterations','iv','revision','salt','version']);
  assert.notEqual(new TextDecoder().decode(Uint8Array.from(encrypted.cipher)),text);
  assert.ok(!Buffer.from(encrypted.cipher).includes(Buffer.from(text)));assert.notDeepEqual(initial.iv,encrypted.iv);pass('ciphertext only database and fresh IV');
  page.once('dialog',d=>d.dismiss());await page.locator('.record-number').nth(1).click();assert.equal(await page.locator('#recordList textarea').count(),4);
  page.once('dialog',d=>d.accept());await page.locator('.record-number').nth(1).click();await waitRevision(page,4);assert.deepEqual(await fields(page),[text,'',last]);pass('add edit delete confirmation and empty row preservation');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  await page.setViewportSize({width:320,height:700});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'records-small-screen.png'),fullPage:true,animations:'disabled'});
  await page.locator('#recordBack').click();await locked(page);await unlock(page,pin);assert.deepEqual(await fields(page),[text,'',last]);
  await page.reload();await locked(page);await unlock(page,pin);assert.deepEqual(await fields(page),[text,'',last]);pass('return locks; reload locks and data persists');
  for(const event of ['blur','pagehide']){
   await page.evaluate(name=>window.dispatchEvent(new Event(name)),event);await locked(page);await unlock(page,pin);
  }
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await locked(page);
  await page.evaluate(()=>{delete document.hidden});await unlock(page,pin);
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await locked(page);pass('synchronous clearing on blur visibility pagehide and bfcache return');
  // Late async decryption must never re-open a page after locking.
  await seven(page);await page.locator('#recordCheckInput').fill(pin);
  await page.evaluate(()=>{document.getElementById('recordCheckForm').requestSubmit();window.dispatchEvent(new Event('blur'))});await page.waitForTimeout(800);await locked(page);pass('lock during async unlock has no late plaintext display');
  await unlock(page,pin);const rev=(await vault(page)).revision;
  await page.evaluate(()=>{const field=document.querySelector('#recordList textarea');for(let i=0;i<20;i++){field.value='000'+i;field.dispatchEvent(new Event('input'))}document.getElementById('recordBack').click()});
  await locked(page);await waitRevision(page,rev+20);await unlock(page,pin);assert.equal((await fields(page))[0],'00019');pass('rapid autosave is ordered and survives immediate lock');
  await page.locator('#recordBack').click();
  const cached=await page.evaluate(async()=>{const c=await caches.open('training-checkin-v12');return (await c.keys()).map(r=>new URL(r.url).pathname)});
  for(const asset of ['/record-store.js','/hidden-records.js','/records.css','/app.js','/index.html'])assert.ok(cached.includes(asset));
  await c.setOffline(true);await page.reload();await locked(page);await unlock(page,pin);assert.equal((await fields(page))[0],'00019');await page.locator('#recordBack').click();await c.setOffline(false);pass('offline PWA home and encrypted records');
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),seed);
  await page.locator('#settingsButton').click();assert.equal(await page.locator('#settingsDialog').isVisible(),true);await page.locator('#settingsDialog button[value=cancel]').click();
  await page.locator('#historyButton').click();assert.equal(await page.locator('.history-item').count(),2);await page.locator('#historyDialog button').click();
  await page.locator('.timer-button').first().click();assert.equal(await page.locator('#timerDialog').isVisible(),true);await page.locator('#timerCloseButton').click();pass('settings history timer and localStorage regression checks');
  assert.equal(errors.length,0);pass('no page script errors');
  // A second isolated context checks initialization races and stale-tab writes.
  const multi=await context({serviceWorkers:'block'}),a=await multi.newPage(),b=await multi.newPage();
  await a.goto(url+'/index.html');await b.goto(url+'/index.html');await setup(a,pin);
  const created=await vault(a);
  const duplicate=await b.evaluate(async pin=>{try{await WorkoutRecordStore.create(pin);return false}catch{return true}},wrong);
  assert.ok(duplicate);assert.deepEqual(await vault(a),created);pass('initialization cannot overwrite an existing vault');
  await a.evaluate(async pin=>{
   const v=await WorkoutRecordStore.read(),first=await WorkoutRecordStore.unlock(pin,v),second=await WorkoutRecordStore.unlock(pin,v);
   await WorkoutRecordStore.commit(first.meta,await WorkoutRecordStore.encrypt(first.key,['first write']));
   try{await WorkoutRecordStore.commit(second.meta,await WorkoutRecordStore.encrypt(second.key,['stale write']));throw new Error('stale accepted')}catch(e){if(e.message==='stale accepted')throw e}
   const read=await WorkoutRecordStore.unlock(pin,await WorkoutRecordStore.read());if(read.records[0]!=='first write')throw new Error('lost write');
  },pin);pass('stale tab cannot overwrite newer records');

  await submit(a,pin);await a.locator('#recordPage').waitFor({state:'visible'});
  await b.evaluate(async pin=>{const s=await WorkoutRecordStore.unlock(pin,await WorkoutRecordStore.read());await WorkoutRecordStore.commit(s.meta,await WorkoutRecordStore.encrypt(s.key,['newer content']))},pin);
  await a.locator('#recordList textarea').first().fill('unsaved local content');
  await a.waitForFunction(()=>document.getElementById('recordStatus').classList.contains('is-error'));
  assert.equal(await a.locator('#recordAdd').isDisabled(),true);assert.equal(await a.locator('[data-copy]').first().isDisabled(),false);
  assert.equal(await b.evaluate(async pin=>(await WorkoutRecordStore.unlock(pin,await WorkoutRecordStore.read())).records[0],pin),'newer content');
  pass('save conflict reports failure, protects newer data and permits copying unsaved content');
  legacyMode='training';const upgrade=await context(),u=await upgrade.newPage();await u.goto(url+'/index.html');await u.evaluate(()=>navigator.serviceWorker.ready);await u.reload();
  assert.equal(await u.locator('#recordPage').count(),0);
  legacyMode=false;
  await u.evaluate(async()=>{const reg=await navigator.serviceWorker.ready;await new Promise((resolve,reject)=>{navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});reg.update().catch(reject)})});
  await u.reload();assert.equal(await u.locator('#recordPage').count(),1);await locked(u);
  const cacheNames=await u.evaluate(()=>caches.keys());assert.ok(cacheNames.includes('training-checkin-v12'));assert.ok(!cacheNames.includes(oldCache));
  assert.equal(await u.evaluate(key=>localStorage.getItem(key),key),seed);
  await upgrade.setOffline(true);await u.reload();await seven(u);assert.equal(await u.locator('#recordCheckTitle').textContent(),'本地校验设置');await upgrade.setOffline(false);
  pass('remote v8 worker upgrades to v12 with new offline assets and training data intact');

  legacyMode='records';const existing=await context(),e=await existing.newPage();await e.goto(url+'/index.html');await e.evaluate(()=>navigator.serviceWorker.ready);await e.reload();
  assert.equal(await e.locator('.app-version').textContent(),'1.1');await setup(e,pin);await submit(e,pin);await e.locator('#recordPage').waitFor({state:'visible'});
  await e.locator('#recordList textarea').first().fill('00042 upgrade');await waitRevision(e,1);await e.locator('#recordBack').click();const previousVault=await vault(e);
  legacyMode=false;
  await e.evaluate(async()=>{const reg=await navigator.serviceWorker.ready;await new Promise((resolve,reject)=>{navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true});reg.update().catch(reject)})});
  await e.reload();await locked(e);assert.equal(await e.locator('.app-version').textContent(),'1.2');assert.deepEqual(await vault(e),previousVault);
  await seven(e);await checkDisplay(e);await submit(e,pin);await e.locator('#recordPage').waitFor({state:'visible'});assert.equal((await fields(e))[0],'00042 upgrade');await e.locator('#recordBack').click();
  const updatedCaches=await e.evaluate(()=>caches.keys());assert.ok(updatedCaches.includes('training-checkin-v12'));assert.ok(!updatedCaches.includes('training-checkin-v11'));
  assert.equal(await e.evaluate(key=>localStorage.getItem(key),key),seed);
  await existing.setOffline(true);await e.reload();await unlock(e,pin);assert.equal((await fields(e))[0],'00042 upgrade');await existing.setOffline(false);
  pass('v11 upgrade preserves existing encrypted records, credentials, training data and offline access');
 }finally{for(const c of contexts)await c.close();await browser.close()}

 // Installed desktop WebKit covers another engine, not a real iPhone.
 let wk;
 try{
  let executablePath=process.env.WEBKIT_EXECUTABLE||webkit.executablePath();
  if(!fs.existsSync(executablePath)){
   const installed=path.dirname(path.dirname(executablePath));
   executablePath=fs.readdirSync(installed).filter(x=>/^webkit-\d+$/.test(x)).sort((a,b)=>Number(b.slice(7))-Number(a.slice(7))).map(x=>path.join(installed,x,'Playwright.exe')).find(x=>fs.existsSync(x));
   if(!executablePath)throw new Error('missing WebKit');
  }
  wk=await webkit.launch({headless:true,executablePath});
 }catch{console.log('LIMIT desktop WebKit unavailable; iPhone manual checks required');return}
 try{
  const c=await wk.newContext({viewport:{width:375,height:812},hasTouch:true,isMobile:true,serviceWorkers:'block'}),p=await c.newPage();
  const errors=[];p.on('pageerror',()=>errors.push('page error'));
  await p.goto(url+'/index.html');const pin=String(randomInt(0,1000000)).padStart(6,'0');await setup(p,pin);await checkDisplay(p);await submit(p,pin);await p.locator('#recordPage').waitFor({state:'visible'});
  await p.locator('#recordList textarea').first().fill('00042 WebKit');await waitRevision(p,1);await p.locator('#recordBack').click();await locked(p);await unlock(p,pin);assert.equal((await fields(p))[0],'00042 WebKit');
  await p.locator('[data-copy]').first().click();assert.equal(await p.locator('#recordStatus').textContent(),'已复制');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(errors.length,0);await c.close();pass('desktop WebKit mobile layout crypto persistence lock and copy');
 }finally{await wk.close()}
}
main().then(()=>console.log('TOTAL '+checks+' checks passed')).catch(error=>{console.error('FAIL '+error.message);process.exitCode=1}).finally(()=>server.close());
