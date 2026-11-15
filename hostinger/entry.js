const entry = document.getElementById('entry');
let identity = {state:'loading'};

async function request(action, data) {
  const response = await fetch('api/index.php?route='+action, {
    method:data ? 'POST' : 'GET',
    credentials:'same-origin',
    cache:'no-store',
    headers:data ? {'Content-Type':'application/json','X-SMCC-CSRF':identity.csrfToken} : undefined,
    body:data ? JSON.stringify(data) : undefined
  });
  const result = await response.json();
  if(!response.ok) throw Object.assign(new Error(result.error),{status:response.status});
  return result;
}

function render(){
  const hash=location.hash;
  const tokenMatch=hash.match(/^#verify\/([a-f0-9]{64})$/);
  const register=hash==='#account/register';
  const pending=identity.state==='verification-required'&&!register&&!tokenMatch&&hash!=='#account/login';
  const password=(label,kind)=>`<label class="field">${label}<input type="password" name="password"
    autocomplete="${kind}" required maxlength="72" ${kind==='new-password'?'minlength="12"':''}></label>`;
  const submit=(label)=>`<button class="button primary" type="submit">${label}</button>`;
  if(identity.state==='loading') return;
  if(identity.state==='error'){
    entry.innerHTML='<h2>เปิดระบบบัญชีไม่ได้</h2><p>กรุณาโหลดหน้าใหม่เพื่อลองเชื่อมต่ออีกครั้ง</p>';
    return;
  }
  const status='<p id="entry-status" role="status"></p>';
  if(tokenMatch){
    entry.innerHTML=`<h2>ยืนยันอีเมลผู้เรียน</h2><p>กรอกรหัสผ่านที่คุณตั้งตอนสมัครเพื่อยืนยันอีเมลและเริ่มเรียน</p>
      <form class="stack" method="post">${password('รหัสผ่านที่ใช้สมัคร','current-password')}<div>${submit('ยืนยันอีเมล')}</div>${status}</form>`;
    entry.querySelector('form').onsubmit=event=>submitForm(event,'verify',{token:tokenMatch[1]});
  }else if(pending){
    entry.innerHTML=`<h2>กรุณายืนยันอีเมล</h2><p>เปิดลิงก์จากอีเมล SMCC แล้วกรอกรหัสผ่านที่ใช้สมัคร ลิงก์ใช้ได้ 1 ชั่วโมง</p>
      <div class="lesson-actions"><button class="button primary" id="resend" type="button">ส่งอีเมลยืนยันอีกครั้ง</button>
      <a class="button" href="#account/login">กลับไปหน้าเข้าสู่ระบบ</a></div>${status}`;
    const message=entry.querySelector('#entry-status');
    if(identity.sent===false) message.textContent='ส่งอีเมลไม่สำเร็จ กรุณาลองส่งอีกครั้งหลังผ่านไป 1 นาที';
    if(identity.sent===true) message.textContent='ส่งลิงก์แล้ว กรุณาตรวจกล่องจดหมายและจดหมายขยะ';
    entry.querySelector('#resend').onclick=async event=>{
      const button=event.currentTarget;
      button.disabled=true;
      try{identity=await request('resend',{});render();}
      catch(error){message.textContent=error.status===429?'กรุณารอสักครู่แล้วลองส่งอีกครั้ง':'ส่งไม่สำเร็จ ลองเข้าสู่ระบบด้วยบัญชีของคุณอีกครั้ง';}
      finally{button.disabled=false;}
    };
  }else{
    entry.innerHTML=`<h2>${register?'สมัครบัญชีผู้เรียนฟรี':'เข้าสู่ระบบ'}</h2>
      <p>${register?'ใช้อีเมลที่เปิดรับลิงก์ยืนยันได้':'ใช้บัญชีที่ยืนยันอีเมลแล้วเพื่อเข้าเรียนและบันทึกความคืบหน้า'}</p>
      <form class="stack" method="post">
        ${register?'<label class="field">ชื่อที่แสดง<input name="displayName" autocomplete="nickname" maxlength="60" required></label>':''}
        <label class="field">อีเมล<input type="email" name="email" autocomplete="username" maxlength="254" required></label>
        ${password('รหัสผ่าน',register?'new-password':'current-password')}
        ${register?'<p class="hint">ตั้งรหัสผ่านอย่างน้อย 12 ตัวอักษร เว็บใช้อีเมลสำหรับบัญชีและการยืนยัน และบันทึกความคืบหน้าที่คุณทำในเว็บ</p>':''}
        <div class="lesson-actions">${submit(register?'สมัครฟรี':'เข้าสู่ระบบ')}<a class="button" href="${register?'#account/login':'#account/register'}">${register?'เข้าสู่ระบบด้วยบัญชีเดิม':'สร้างบัญชีใหม่'}</a></div>${status}
      </form>`;
    entry.querySelector('form').onsubmit=event=>submitForm(event,register?'register':'login');
  }
}

async function submitForm(event, action, extra={}) {
  event.preventDefault();
  const form=event.currentTarget;
  const button=form.querySelector('button');
  const message=entry.querySelector('#entry-status');
  button.disabled=true;
  message.textContent='กำลังดำเนินการ…';
  try{
    identity=await request(action,{...Object.fromEntries(new FormData(form)),...extra});
    form.reset();
    if(identity.state==='registered'){
      location.replace('./?welcome=1#lessons');
      return;
    }
    location.hash='#account/verify-email';
    render();
  }catch(error){
    const errors={
      invalid_verification:'ลิงก์หมดอายุหรือรหัสผ่านไม่ถูกต้อง ลองเข้าสู่ระบบเพื่อขอลิงก์ใหม่',
      invalid_credentials:'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      invalid_registration:'ตรวจชื่อที่แสดงและรหัสผ่าน รหัสผ่านต้องยาวอย่างน้อย 12 ตัวอักษรและไม่เกิน 72 ไบต์',
      email_unavailable:'สมัครไม่สำเร็จ หากเคยสมัครแล้วให้ลองเข้าสู่ระบบ',
      invalid_csrf:'เซสชันหมดอายุ กรุณาโหลดหน้าใหม่',
      rate_limited:'ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง'
    };
    message.textContent=errors[error.message]||'ระบบบัญชีขัดข้อง กรุณาลองใหม่';
  }finally{
    button.disabled=false;
  }
}

window.addEventListener('hashchange',render);
request('account').then(result=>{
  identity=result;
  if(identity.state==='registered'){
    location.reload();
    return;
  }
  render();
}).catch(()=>{
  identity={state:'error'};
  render();
});
