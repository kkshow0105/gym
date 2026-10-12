/* Isolated local storage. No training data, network requests or credential storage. */
(() => {
 'use strict';
 const DB_NAME='workout-local-records-v1',STORE='vault',ID='records',ITERATIONS=600000;
 const encoder=new TextEncoder(),decoder=new TextDecoder();
 let connection;
 function open(){
  if(!window.isSecureContext||!window.crypto?.subtle||!window.indexedDB)return Promise.reject(new Error('unavailable'));
  if(!connection)connection=new Promise((resolve,reject)=>{
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
   request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null};resolve(db)};
   request.onerror=()=>{connection=null;reject(new Error('storage'))};
   request.onblocked=()=>{connection=null;reject(new Error('storage'))};
  });
  return connection;
 }
 async function read(){
  const db=await open();
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readonly'),request=tx.objectStore(STORE).get(ID);
   tx.oncomplete=()=>resolve(request.result||null);
   tx.onabort=tx.onerror=()=>reject(new Error('storage'));
  });
 }
 async function derive(digits,salt,iterations){
  const bytes=encoder.encode(digits);
  let material;
  try{material=await crypto.subtle.importKey('raw',bytes,'PBKDF2',false,['deriveKey'])}finally{bytes.fill(0)}
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
 }
 function encrypt(key,records){
  const iv=crypto.getRandomValues(new Uint8Array(12)),bytes=encoder.encode(JSON.stringify({records}));
  const pending=crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes);
  bytes.fill(0);
  return pending.then(ciphertext=>({iv,ciphertext}));
 }
 function validVault(vault){
  return vault?.version===1&&vault.salt instanceof Uint8Array&&vault.salt.length===16&&
   vault.iv instanceof Uint8Array&&vault.iv.length===12&&vault.ciphertext instanceof ArrayBuffer&&
   vault.iterations===ITERATIONS&&Number.isSafeInteger(vault.revision)&&vault.revision>=0;
 }
 async function unlock(digits,vault){
  if(!/^\d{6}$/.test(digits)||!validVault(vault))throw new Error('invalid');
  const key=await derive(digits,vault.salt,vault.iterations);
  const bytes=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:vault.iv},key,vault.ciphertext));
  let payload;
  try{payload=JSON.parse(decoder.decode(bytes))}finally{bytes.fill(0)}
  if(!Array.isArray(payload.records)||!payload.records.every(x=>typeof x==='string'))throw new Error('invalid');
  return {key,records:payload.records,meta:{version:1,salt:vault.salt,iterations:vault.iterations,revision:vault.revision}};
 }
 async function create(digits){
  if(!/^\d{6}$/.test(digits))throw new Error('invalid');
  const salt=crypto.getRandomValues(new Uint8Array(16)),key=await derive(digits,salt,ITERATIONS);
  const packet=await encrypt(key,['','','']),db=await open();
  const vault={version:1,salt,iterations:ITERATIONS,revision:0,...packet};
  // add, rather than put: another tab must never replace an existing initialization.
  await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).add(vault,ID);
   tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(new Error('storage'));
  });
 }
 async function commit(meta,packet){
  const db=await open();
  return new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),request=store.get(ID);
   request.onsuccess=()=>{
    const current=request.result;
    if(!validVault(current)||current.revision!==meta.revision||!current.salt.every((x,i)=>x===meta.salt[i])){tx.abort();return}
    store.put({...meta,revision:meta.revision+1,...packet},ID);
   };
   tx.oncomplete=()=>{meta.revision++;resolve()};
   tx.onabort=tx.onerror=()=>reject(new Error('storage'));
  });
 }
 window.WorkoutRecordStore=Object.freeze({read,create,unlock,encrypt,commit});
})();
