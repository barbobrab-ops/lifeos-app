(()=>{'use strict';
const cfg=window.LIFEOS_CONFIG||{}, overlay=document.getElementById('auth-overlay'),msg=document.getElementById('auth-message'),status=document.getElementById('cloud-status'),logout=document.getElementById('logout');
const configured=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url)&&/^sb_publishable_/.test(cfg.key);
let session=null, dirty=false, saving=false, timer=null, savePromise=null;
const base=(cfg.url||'').replace(/\/$/,'');
function note(t){msg.textContent=t}function state(t){status.textContent=t}
async function request(path,method='GET',body=null,token=null,prefer=null){
 const h={'apikey':cfg.key,'Content-Type':'application/json'};
 if(token)h.Authorization='Bearer '+token;
 if(path.startsWith('/rest/v1/')){h['Accept-Profile']='lifeos';h['Content-Profile']='lifeos'}
 if(prefer)h.Prefer=prefer;
 const r=await fetch(base+path,{method,headers:h,body:body===null?undefined:JSON.stringify(body),cache:'no-store'});
 const raw=await r.text();let val;try{val=raw?JSON.parse(raw):null}catch{val=raw}
 if(!r.ok)throw Error(typeof val==='object'?(val.msg||val.message||val.error_description||val.error||'Errore API'):String(val));return val;
}
function store(){sessionStorage.setItem('lifeos_cloud_session',JSON.stringify(session))}
async function validToken(){if(!session)throw Error('Accedi prima');if(Date.now()<session.expires_at-90000)return session.access_token;
 const r=await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token});session={...r,expires_at:Date.now()+r.expires_in*1000};store();return session.access_token;
}
async function remoteRead(){const t=await validToken();const r=await request('/rest/v1/state?select=payload&user_id=eq.'+encodeURIComponent(session.user.id),'GET',null,t);return r[0]?.payload||null}
async function remoteWrite(){const t=await validToken();await request('/rest/v1/state?on_conflict=user_id','POST',{user_id:session.user.id,payload:data,updated_at:new Date().toISOString()},t,'resolution=merge-duplicates,return=minimal')}
window.lifeosCloudSave=()=>{if(!window.lifeosCloudReady)return;dirty=true;state('Sincronizzazione in attesa…');clearTimeout(timer);timer=setTimeout(flush,550)};
async function flush(){if(saving)return savePromise;if(!dirty||!session)return true;saving=true;dirty=false;state('Sincronizzazione…');savePromise=(async()=>{try{await remoteWrite();state('✓ Salvato online');return true}catch(e){dirty=true;state('⚠ Salvataggio online non riuscito');console.error(e);return false}finally{saving=false}})();const ok=await savePromise;if(dirty&&ok)setTimeout(flush,100);return ok}
async function finishPendingSave(){clearTimeout(timer);for(let i=0;i<3;i++){if(saving&&savePromise)await savePromise;if(!dirty)return true;const ok=await flush();if(!ok)return false}return !dirty}
async function enter(){window.lifeosCloudReady=false;state('Caricamento dati…');const remote=await remoteRead();if(remote){data={...initial(),...remote};localStorage.setItem(KEY,JSON.stringify(data))}else{
 // First login: never silently overwrite cloud with old local data.
 const local=load(),hasLocal=Object.values(local).some(a=>Array.isArray(a)&&a.length);
 if(hasLocal&&confirm('Nessun dato online. Vuoi caricare i dati già presenti in questo browser nel tuo account? Premi Annulla per iniziare con dati vuoti.'))data=local;
 else data=initial();localStorage.setItem(KEY,JSON.stringify(data));await remoteWrite();
 }
 window.lifeosCloudReady=true;overlay.hidden=true;logout.hidden=false;render();state('✓ Collegato al cloud');
}
async function authenticate(mode){if(!configured){note('Configura prima config.js con Project URL e publishable key.');return}const email=document.getElementById('auth-email').value.trim(),password=document.getElementById('auth-password').value;note('Attendi…');try{
 if(mode==='signup'){await request('/auth/v1/signup','POST',{email,password});note('Account creato. Controlla l’email di conferma, poi accedi.');return}
 const r=await request('/auth/v1/token?grant_type=password','POST',{email,password});session={...r,expires_at:Date.now()+r.expires_in*1000};store();await enter();note('');
 }catch(e){note('Errore: '+e.message);state('Accesso non riuscito')}}
document.getElementById('auth-form').addEventListener('submit',e=>{e.preventDefault();authenticate('login')});document.getElementById('signup').addEventListener('click',()=>authenticate('signup'));
logout.addEventListener('click',async()=>{const saved=await finishPendingSave();if(!saved){alert('La sincronizzazione non è riuscita. I dati sono ancora sul dispositivo: controlla la connessione e riprova prima di uscire.');return}try{if(session)await request('/auth/v1/logout','POST',{},await validToken())}catch{}session=null;sessionStorage.removeItem('lifeos_cloud_session');window.lifeosCloudReady=false;data=initial();localStorage.removeItem(KEY);render();overlay.hidden=false;logout.hidden=true;state('Disconnesso')});
if(!configured){note('Apri config.js e inserisci URL e publishable key del progetto Supabase.');return}
try{session=JSON.parse(sessionStorage.getItem('lifeos_cloud_session')||'null')}catch{}
if(session)enter().catch(e=>{session=null;sessionStorage.removeItem('lifeos_cloud_session');note('Effettua nuovamente l’accesso: '+e.message);state('Accesso richiesto')});else state('Accedi per sincronizzare');
window.addEventListener('online',()=>{if(dirty)flush()});window.addEventListener('pagehide',()=>{if(dirty)console.warn('Modifiche non ancora sincronizzate')});
})();