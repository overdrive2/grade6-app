let accountState='loading';
let accountProfile;
let registrationAccountId;
let accountRevision=0;
let accountSaveTimer;
let accountDirty=false;
let accountSaving=false;
let accountConflict=false;
let accountSyncMessage='';
const signInURL='/signin-with-chatgpt?return_to=%2F%23account';
const signOutURL='/signout-with-chatgpt?return_to=%2F';

function showSync(message){
  accountSyncMessage=message;
  const notice=get('account-sync');
  if(notice) notice.textContent=message;
  if(get('account-retry')) get('account-retry').hidden=!accountDirty||accountConflict;
  if(get('account-refresh')) get('account-refresh').hidden=!accountConflict;
  if(accountState==='registered'){
    get('progress-location').textContent=accountDirty
      ? 'รอบันทึกเข้าบัญชี · ดูสถานะในเมนูบัญชีผู้เรียน'
      : 'เก็บความคืบหน้าในบัญชีผู้เรียน';
  }
}

async function accountRequest(path='/api/account',method='GET',body){
  const payload=body?JSON.stringify(body):undefined;
  const response=await fetch(path,{
    method,credentials:'same-origin',cache:'no-store',
    headers:body?{'Content-Type':'application/json'}:undefined,
    body:payload,
    keepalive:method==='PUT'&&new TextEncoder().encode(payload).length<60000
  });
  if(!response.ok) throw Object.assign(new Error('Account request failed'),{status:response.status});
  return response.json();
}

function queueAccountSave(){
  accountDirty=true;
  showSync(accountConflict?'มีการบันทึกจากอุปกรณ์อื่น กรุณาโหลดข้อมูลล่าสุด':'รอบันทึกความคืบหน้า…');
  clearTimeout(accountSaveTimer);
  accountSaveTimer=setTimeout(flushAccountSave,350);
}

async function flushAccountSave(){
  if(accountSaving||accountConflict||!accountDirty||accountState!=='registered') return;
  accountSaving=true;
  accountDirty=false;
  showSync('กำลังบันทึกความคืบหน้า…');
  try {
    const result=await accountRequest('/api/progress','PUT',{accountId:accountProfile.accountId,revision:accountRevision,progress});
    accountRevision=result.revision;
    showSync(accountDirty?'รอบันทึกความคืบหน้า…':'บันทึกความคืบหน้าแล้ว');
  }catch(error){
    accountDirty=true;
    accountConflict=error.status===409||error.status===401;
    showSync(error.status===401?'บัญชีที่เข้าสู่ระบบเปลี่ยนแล้ว กรุณาโหลดข้อมูลล่าสุด'
      :accountConflict?'มีการบันทึกจากอุปกรณ์อื่น กรุณาโหลดข้อมูลล่าสุด':'บันทึกไม่สำเร็จ กรุณาลองบันทึกอีกครั้ง');
    return;
  }finally{
    accountSaving=false;
  }
  if(accountDirty) flushAccountSave();
}

function useAccount(profile){
  accountProfile=profile;
  accountState='registered';
  accountRevision=profile.revision;
  accountConflict=false;
  accountDirty=false;
  progress={...blankProgress(),...profile.progress};
  saveAccountProgress=queueAccountSave;
  save(false);
  showSync('บันทึกความคืบหน้าในบัญชี');
}

function readGuestProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey));
    if(saved&&(saved.answered||Object.values(saved.lessons||{}).some(Boolean)||
      Object.values(saved.checks||{}).some(Boolean)||Object.values(saved.drafts||{}).some(Boolean))) return saved;
  }catch{}
}

function importGuestProgress(){
  const guest=readGuestProgress();
  if(!guest) return;
  if(guest.answered>progress.answered){
    progress.answered=guest.answered;
    progress.correct=guest.correct||0;
  }
  for(const key of ['lessons','checks']){
    for(const [id,value] of Object.entries(guest[key]||{})){
      if(value===true&&id!=='__proto__') progress[key][id]=true;
    }
  }
  progress.drafts={...guest.drafts,...progress.drafts};
  save();
  get('account-import').disabled=true;
  get('account-import').textContent='รวมความคืบหน้าแล้ว';
}

async function refreshAccount(){
  try {
    const profile=await accountRequest();
    accountState=profile.state;
    if(profile.state==='registered') useAccount(profile);
    else{
      registrationAccountId=profile.accountId;
      if(saveAccountProgress){
        saveAccountProgress=undefined;
        progress={...blankProgress(),...readGuestProgress()};
        save(false);
        get('progress-location').textContent='เก็บความคืบหน้าในเบราว์เซอร์นี้';
      }
    }
  }catch{
    if(accountState==='registered'){
      showSync('โหลดข้อมูลล่าสุดไม่สำเร็จ กรุณาลองอีกครั้ง');
      return;
    }
    accountState='unavailable';
  }
  if(location.hash==='#account'||accountState==='registered') route();
}

function accountMarkup(){
  const guest=accountState==='registered'&&readGuestProgress();
  if(accountState==='registered') return `<h2>โปรไฟล์ผู้เรียน</h2>
    <p>ชื่อที่แสดง <strong id="account-name"></strong></p>
    <p id="account-sync" class="hint" role="status"></p>
    <div class="lesson-actions">
      <button type="button" class="button" id="account-retry" hidden>ลองบันทึกอีกครั้ง</button>
      <button type="button" class="button" id="account-refresh" hidden>โหลดข้อมูลล่าสุดและละทิ้งรายการที่ยังรอบันทึก</button>
      ${guest?'<button type="button" class="button" id="account-import">รวมความคืบหน้าจากเบราว์เซอร์นี้</button>':''}
      <a class="button primary" href="#lessons">ไปที่บทเรียน</a>
      <a class="button" id="account-signout" href="${signOutURL}" target="_top">ออกจากระบบ</a>
    </div>`;
  if(accountState==='unregistered') return `<h2>ลงทะเบียนโปรไฟล์ผู้เรียน</h2>
    <p>ตั้งชื่อที่จะแสดงใน SMCC เพื่อบันทึกบทเรียนที่ผ่าน คะแนน เช็กลิสต์ และร่างคำร้องกับบัญชี ChatGPT ที่คุณเข้าสู่ระบบไว้</p>
    <form id="account-form" class="stack">
      <label class="field">ชื่อที่แสดง<input name="displayName" autocomplete="nickname" required maxlength="60"></label>
      <div><button type="submit" class="button primary">ลงทะเบียน</button></div>
      <p id="registration-status" role="status"></p>
    </form>`;
  if(accountState==='loading') return '<p role="status">กำลังโหลดข้อมูลบัญชี…</p>';
  if(accountState==='unavailable') return `<h2>เปิดระบบบัญชีไม่ได้</h2>
    <p>เปิดเว็บ SMCC เวอร์ชันออนไลน์เพื่อใช้บัญชีผู้เรียน</p>
    <button class="button" id="account-refresh" type="button">ลองเชื่อมต่ออีกครั้ง</button>`;
  return `<h2>เข้าสู่ระบบ</h2><p>ลงชื่อเข้าใช้ด้วย ChatGPT เพื่อสร้างโปรไฟล์หรือเรียนต่อจากบัญชีเดิม</p>
    <a class="button primary" href="${signInURL}" target="_top">เข้าสู่ระบบด้วย ChatGPT</a>`;
}

renderAccountView=()=>{
  room.innerHTML=`<a class="back" href="#home">← หน้าหลัก</a>
    <header class="room-head"><h1 tabindex="-1">บัญชีผู้เรียน</h1></header>
    <section class="panel account-panel">${accountMarkup()}</section>`;
  if(accountState==='registered'){
    get('account-name').textContent=accountProfile.displayName;
    showSync(accountSyncMessage);
    get('account-retry').onclick=flushAccountSave;
    get('account-refresh').onclick=refreshAccount;
    if(get('account-import')) get('account-import').onclick=importGuestProgress;
    get('account-signout').onclick=event=>{
      if(!accountDirty&&!accountSaving) return;
      event.preventDefault();
      if(!accountConflict) flushAccountSave();
      showSync(accountConflict?accountSyncMessage:'รอบันทึกให้เสร็จก่อนออกจากระบบ');
    };
  }else if(accountState==='unregistered'){
    get('account-form').onsubmit=async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const status=get('registration-status');
      const submit=form.querySelector('button');
      submit.disabled=true;
      status.textContent='กำลังลงทะเบียน…';
      try{
        useAccount(await accountRequest('/api/account','POST',{accountId:registrationAccountId,displayName:form.elements.displayName.value}));
        if(location.hash==='#account') route();
      }catch(error){
        status.textContent=error.status===400?'กรุณากรอกชื่อที่แสดง':'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่';
        submit.disabled=false;
      }
    };
  }else if(get('account-refresh')){
    get('account-refresh').onclick=refreshAccount;
  }
};

if(location.hash==='#account') route();
window.addEventListener('pagehide',flushAccountSave);
if(location.protocol==='file:'){
  accountState='unavailable';
  if(location.hash==='#account') route();
}else{
  refreshAccount();
}
