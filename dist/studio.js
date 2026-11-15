const get = id => document.getElementById(id);
const storageKey='smcc-studio-v1';
let progress={answered:0,correct:0,checks:{},drafts:{},deadline:0,lessons:{}};
try { progress={...progress,...JSON.parse(localStorage.getItem(storageKey))}; } catch {}
function save() {
  try { localStorage.setItem(storageKey,JSON.stringify(progress)); } catch {}
  get('answered').textContent=progress.answered;
  get('accuracy').textContent=progress.answered?Math.round(100*progress.correct/progress.answered)+'%':'–';
  get('checked').textContent=Object.values(progress.checks).filter(Boolean).length;
  get('completed').textContent=lessons.filter(lesson=>progress.lessons[lesson.id]).length+'/'+lessons.length;
}
save();
const titles={
  theory:['MUSIC THEORY','ทฤษฎีดนตรี','เลือกหัวข้อและตอบโจทย์พร้อมเฉลย'],
  ear:['EAR TRAINING','โสตทักษะ','ฟังเสียงตัวอย่างผ่านลำโพงหรือหูฟัง'],
  song:['SONGWRITING','แต่งเพลง','ฝึกเขียนคำร้องและคิดทำนองภายใน 60 นาที'],
  classical:['CLASSICAL PERFORMANCE','ปฏิบัติคลาสสิก','เลือกเครื่องดนตรีหรือสาขาขับร้องเพื่อดูรายการเตรียมสอบ']
};
const room=get('room');
let clockId;
let context;
let playing=[];
let audioJob=0;
function stopAudio(){
  audioJob++;
  for(const oscillator of playing) oscillator.stop();
  playing=[];
}
function playTone(midi,start,length,volume=.10,type='sine') {
  const oscillator=context.createOscillator();
  const gain=context.createGain();
  oscillator.type=type;
  oscillator.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,start);
  gain.gain.linearRampToValueAtTime(volume,start+.025);
  gain.gain.exponentialRampToValueAtTime(.001,start+length);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start+length+.01);
  playing.push(oscillator);
  oscillator.onended=()=>{
    playing=playing.filter(voice=>voice!==oscillator);
    oscillator.disconnect();
    gain.disconnect();
  };
}
async function withAudio(action){
  stopAudio();
  const job=audioJob;
  try {
    const Audio=window.AudioContext||window.webkitAudioContext;
    context??=new Audio();
    await context.resume();
    if(job===audioJob) action(context.currentTime+.07);
  } catch {
    if(job===audioJob && get('audio-status')) get('audio-status').textContent='เบราว์เซอร์นี้เปิดเสียงไม่ได้';
  }
}
function playQuestion(question){
  withAudio(start=>question.audio.forEach((pitch,index)=>{
    const beat=question.practice?(question.meter==='6/8'?.33:.53):.55;
    playTone(pitch,start+(question.sequence?index*beat:0),question.sequence?beat-.07:.95,question.sequence?.18:.11,'triangle');
  }));
}
function drawMusic(canvas, quiz){
  const ctx=canvas.getContext('2d');
  const bottom=89, lineHeight=12, left=12, begin=118, spacing=39;
  const width=begin+quiz.degrees.length*spacing+16;
  canvas.width=width*2;
  canvas.height=250;
  canvas.style.width=width+'px';
  ctx.scale(2,2);
  ctx.strokeStyle=ctx.fillStyle='#19382f';
  ctx.lineWidth=1;
  const line=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
  for(let index=0;index<5;index++) line(left,bottom-index*lineHeight,width-12,bottom-index*lineHeight);
  ctx.font='52px "Segoe UI Symbol", "Noto Music", serif';
  ctx.fillText('𝄞',17,90);
  ctx.font='bold 22px serif';
  ctx.textAlign='center';
  ctx.fillText(quiz.meter[0],82,61);
  ctx.fillText(quiz.meter[2],82,84);
  line(begin+(quiz.beats-.5)*spacing,bottom-48,begin+(quiz.beats-.5)*spacing,bottom);
  line(width-13,bottom-48,width-13,bottom);
  line(width-17,bottom-48,width-17,bottom);
  quiz.degrees.forEach((degree,index)=>{
    const x=begin+index*spacing, y=bottom+(2-degree)*6;
    if(degree===0) line(x-10,y,x+10,y);
    ctx.beginPath();
    ctx.ellipse(x,y,7,4.6,-.24,0,Math.PI*2);
    ctx.fill();
    line(x+6,y,x+6,y-32);
    if(quiz.meter==='6/8') {
      ctx.beginPath(); ctx.moveTo(x+6,y-32);ctx.quadraticCurveTo(x+19,y-26,x+14,y-16);ctx.stroke();
    }
  });
  canvas.setAttribute('aria-label',`${quiz.meter} โน้ต ${quiz.degrees.map(degree=>letters[degree]+'4').join(' ')}`);
}
function renderQuiz(mode,category){
  const list=categories[mode];
  get('body').innerHTML=`<div class="panel"><div class="controls">
  <label class="field">หัวข้อฝึก<select id="category">${Object.entries(list).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label>
  <button class="button" id="next" type="button">สุ่มโจทย์ใหม่ ↻</button></div><div id="challenge"></div></div>`;
  const generate=()=>{
    stopAudio();
    const selected=get('category').value;
    const quiz=makeQuestion(mode,selected);
    const lesson=lessons.find(entry=>entry.group===mode&&entry.practice===selected);
    get('room-lesson').href='#lessons/'+lesson.id;
    let answered=false;
    get('challenge').innerHTML=`<h2>${quiz.question}</h2>
      ${quiz.practice?`<p class="hint">C Major • ${quiz.meter} • 2 ห้อง • ${quiz.sight?'ใช้ Fixed-Do หรือ Movable-Do':'เขียนคำตอบลงกระดาษก่อนดูเฉลย'}</p>
      <div id="notation" ${quiz.sight?'':'hidden'}><canvas role="img"></canvas></div>
      ${quiz.sight?'':'<button id="reveal" class="button" type="button">ดูเฉลย</button>'}`:''}
      ${mode==='ear'?'<button id="listen" class="button primary" type="button">▶ ฟังเสียง</button><div id="audio-status" role="status"></div>':''}
      ${quiz.options?`<div class="options">${quiz.options.map((option,index)=>`<button class="button" data-option="${index}" type="button">${option}</button>`).join('')}</div><div class="feedback" id="feedback" role="status"></div>`:''}`;
    if(quiz.practice) drawMusic(get('notation').querySelector('canvas'),quiz);
    if(get('listen')) get('listen').onclick=()=>playQuestion(quiz);
    if(get('reveal')) get('reveal').onclick=()=>{
      get('notation').hidden=false;
      get('reveal').hidden=true;
    };
    const buttons=[...room.querySelectorAll('[data-option]')];
    for(const button of buttons) button.onclick=()=>{
      if(answered) return;
      answered=true;
      const correct=quiz.options[Number(button.dataset.option)]===quiz.answer;
      progress.answered++;
      progress.correct+=Number(correct);
      save();
      buttons[quiz.options.indexOf(quiz.answer)].classList.add('correct');
      if(!correct) button.classList.add('incorrect');
      buttons.forEach(option=>option.setAttribute('aria-disabled','true'));
      get('feedback').textContent=`${correct?'ถูกต้อง':`คำตอบคือ ${quiz.answer}`} · ${quiz.explanation}`;
    };
  };
  if(Object.hasOwn(list,category)) get('category').value=category;
  get('category').onchange=generate;
  get('next').onclick=generate;
  generate();
}
const songParts=[['Intro','Verse','Pre-Chorus','Chorus'],[[4,4,8,8],[4,8,4,8]]];
const backingChords=[
  [[0,0,0,0],[7,0,4,5],[7,0,4,5],[0,7,9,5]],
  [[0,0,0,0],[7,0,4,5],[5,7,9,7],[0,5,9,7]]
];
const patterns={0:[0,4,7],4:[0,3,7],5:[0,4,7],7:[0,4,7],9:[0,3,7]};
let backingTimeout;
function renderSong(){
  get('body').innerHTML=`<div class="panel"><div class="controls">
    <label class="field">โครงสร้าง<select id="structure"><option value="0">แบบที่ 1</option><option value="1">แบบที่ 2</option></select></label>
    <label class="field">คีย์สำหรับร้อง<select id="song-key">${['C','D','F','G'].map(key=>`<option>${key}</option>`).join('')}</select></label>
    </div><div class="beat-grid" id="sections"></div><p class="hint">เสียงประกอบจำลองสำหรับซ้อม · 4/4 · 96 BPM</p>
    <div class="controls"><button class="button primary" id="backing" type="button">▶ เล่นเสียงประกอบ</button><button class="button" id="stop" type="button">หยุดเสียง</button></div><div id="audio-status" role="status"></div>
    <div class="timer" id="time" aria-label="เวลาที่เหลือ">60:00</div><div class="controls"><button class="button primary" id="start" type="button">เริ่มจับเวลา</button><button class="button" id="reset" type="button">ตั้งเวลาใหม่</button></div><div id="timer-status" role="status"></div>
    </div><div class="panel"><h2>กระดาษร่างคำร้อง</h2><p class="hint">บันทึกอัตโนมัติแยกตามโครงสร้าง ซ้อมร้องบันทึกวิดีโอหลังหมดเวลาแล้วประเมินตามเกณฑ์</p><div id="drafts" class="stack"></div></div>
    <div class="panel"><h2>เกณฑ์ประเมิน 100 คะแนน</h2><dl class="rubric"><dt>Motif &amp; Variation · ทำนองหลักและการแปรทำนอง</dt><dd>20</dd><dt>Melody · ความไพเราะและความเหมาะสมของทำนอง</dt><dd>40</dd><dt>Contrasting · ความแตกต่างระหว่างท่อน</dt><dd>20</dd><dt>Lyrics · คำร้อง สัมผัส และวรรณยุกต์</dt><dd>15</dd><dt>การร้องบันทึก · ชัดเจนและตรงคีย์</dt><dd>5</dd></dl></div>`;
  const updateTime=()=>{
    const seconds=progress.deadline?Math.max(0,Math.ceil((progress.deadline-Date.now())/1000)):3600;
    get('time').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
    get('start').disabled=Boolean(progress.deadline);
    get('timer-status').textContent=seconds===0?'หมดเวลา · ลองร้องและบันทึกวิดีโอเพื่อประเมินตัวเอง':'';
  };
  function stopBacking(){
    stopAudio();
    clearInterval(backingTimeout);
    room.querySelectorAll('#sections span').forEach(section=>section.classList.remove('active'));
  }
  const updateStructure=()=>{
    stopBacking();
    const structure=Number(get('structure').value);
    get('sections').innerHTML=songParts[0].map((part,index)=>`<span>${part} · ${songParts[1][structure][index]} ห้อง</span>`).join('');
    get('drafts').innerHTML=songParts[0].slice(1).map(part=>`<label class="field">${part}<textarea data-part="${part}" placeholder="เขียนคำร้องที่นี่"></textarea></label>`).join('');
    for(const field of room.querySelectorAll('textarea')){
      const key=`${structure}:${field.dataset.part}`;
      field.value=progress.drafts[key]||'';
      field.oninput=()=>{progress.drafts[key]=field.value;save();};
    }
  };
  get('backing').onclick=()=>{
    stopBacking();
    const structure=Number(get('structure').value);
    const tonic=48+pitchClass(get('song-key').value);
    const lengths=songParts[1][structure];
    const beat=60/96;
    withAudio(start=>{
      let bar=0;
      lengths.forEach((length,section)=>{
        for(let index=0;index<length;index++,bar++){
          const chords=backingChords[structure][section];
          const chord=chords[index%chords.length];
          const time=start+bar*4*beat;
          playTone(tonic+chord-12,time,beat*1.6,.17);
          playTone(tonic+chord-12,time+beat*2,beat*1.6,.14);
          for(let count=0;count<4;count++){
            playTone(count===0?91:84,time+count*beat,.055,.035);
            for(const interval of patterns[chord]){
              playTone(tonic+chord+interval,time+count*beat+.03,beat*.86,.035,'triangle');
            }
          }
        }
      });
      const sections=[...room.querySelectorAll('#sections span')];
      backingTimeout=setInterval(()=>{
        const elapsed=(context.currentTime-start)/(beat*4);
        let end=0;
        lengths.forEach((length,index)=>{
          sections[index].classList.toggle('active',elapsed>=end&&elapsed<end+length);
          end+=length;
        });
        if(elapsed>=end) clearInterval(backingTimeout);
      },100);
    });
  };
  get('stop').onclick=stopBacking;
  get('structure').onchange=updateStructure;
  get('song-key').onchange=stopBacking;
  get('start').onclick=()=>{progress.deadline=Date.now()+3600000;save();updateTime();};
  get('reset').onclick=()=>{progress.deadline=0;save();updateTime();};
  clockId=setInterval(updateTime,250);
  updateStructure();
  updateTime();
}
const winds={
  Flute:'Sonata ของ Handel หรือ Bach / Concerto ของ Vivaldi, Stamitz หรือ Mozart',
  Clarinet:'Mozart K.622 ท่อน 1–2 / Weber Concerto ท่อน 1 หรือ Concertino / Krommer Concerto ท่อน 1–2 / Schumann Op.73 ท่อน 1 และ 3',
  Saxophone:'Milhaud Scaramouche / Glazunov Concerto in E-flat / Creston Sonata Op.19 / Ibert Concerto da Camera / Villa-Lobos Fantasia / Demersseman Fantaisie / Maurice Tableaux de Provence',
  Oboe:'Schumann Three Romances / Sonata ท่อนเร็วของ Bach หรือ Handel / Mozart K.314 / Saint-Saëns Oboe Sonata',
  Bassoon:'Telemann Sonata in F Minor / Marcello Sonata in E Minor / Bach Cello Suites Nos.1–3 / Mozart K.191',
  Trumpet:'Haydn หรือ Hummel Trumpet Concerto ท่อน 1 หรือ 2 / Bordogni Vocalise Etudes เล่ม 1',
  'French Horn':'Mozart Horn Concerto No.1 ท่อน 1–2 หรือ No.3 ท่อน 1–3 / Saint-Saëns Morceau de Concert ท่อน 1 หรือ Romance / Strauss Nocturno',
  Trombone:'Rimsky-Korsakov Concerto ท่อน 1 / Ferdinand David Concertino ท่อน 1–2',
  'Tuba / Euphonium':'Vivaldi Sonata No.3 in A Minor ท่อน 1–2 / Marcello Sonata No.1 in F Major ท่อน 1–2'
};
const practical={
  ...Object.fromEntries(Object.entries(winds).map(([name,pieces])=>[name,[`บทช้า 1 บท · ${pieces}`,`บทเร็ว 1 บท · เลือกต่างยุคหรือต่างลีลาจากรายการหรือบทที่มาตรฐานเทียบเท่า`]])),
  Violin:['แบบฝึกหัด 1 บทจาก Mazas, Kreutzer, Paganini หรือเทียบเท่า','บทเดี่ยว 1 บท · Bach Sonatas and Partitas เลือกหนึ่งท่อน, Bach Concerto in A Minor ท่อน 1 หรือ Mozart Concerto in G Major ท่อน 1 พร้อม Cadenza หรือเทียบเท่า'],
  Viola:['แบบฝึกหัด 1 บทจาก Kayser, Mazas, Kreutzer, Paganini หรือเทียบเท่า','บทเดี่ยว 1 บท · Stamitz Concerto in D Major ท่อน 1 หรือ J.C. Bach Concerto in C Minor ท่อน 1 หรือเทียบเท่า'],
  Cello:['แบบฝึกหัดที่เลือกเอง 1 บท','บทเดี่ยว 1 บท · Breval Sonata No.1 in C, Vivaldi Sonata No.5 หรือ Seitz Concerto No.5 ท่อน 1 / Bach Cello Suites Nos.1–3 เลือกหนึ่งท่อน / Saint-Saëns The Swan หรือเทียบเท่า'],
  'Double Bass':['แบบฝึกหัดที่เลือกเอง 1 บท','บทเดี่ยว 1 บท · Saint-Saëns L’éléphant / Bach Menuet I / Koussevitzky Chanson Triste / Bottesini Reverie / Rachmaninoff Vocalise หรือเทียบเท่า'],
  Guitar:['บทอิสระระดับเทียบเท่าบทบังคับ 1 บท จากความจำ','บทบังคับเลือก 2 บทจากชุด Studies ของ Sor, Études ของ Villa-Lobos, Carcassi Op.60 หรือ Brouwer'],
  Piano:['Bach Three-Part Invention หรือ Prelude and Fugue จาก WTC เล่ม 1 หรือ 2 จำนวน 1 บท','โซนาตายุคคลาสสิก ท่อนเร็ว 1 ท่อน','บทเพลงยุคโรแมนติกหรือศตวรรษที่ 20 จำนวน 1 บท','ทั้ง 3 บทยากกว่าเกรด 6 ของสถาบันสอบในอังกฤษ และเล่นจากความจำอย่างน้อย 2 บท','Scale และ Arpeggio 4 ออกเตฟ · ถ้าส่งวิดีโอ เลือก Scale แต่ละชนิดอย่างละ 2 และ Arpeggio Major กับ Minor อย่างละ 2 คีย์'],
  Percussion:['เลือกเครื่อง 2 ชิ้นและเล่นชิ้นละ 1 เพลง จาก Marimba, Xylophone, Vibraphone, Timpani, Concert Snare Drum และ Marching Snare Drum','รัวจากเบาไปดัง','Sight Reading 2 บท'],
  'Voice (Classical)':['เตรียมผู้บรรเลงเปียโนประกอบ','Concone Op.9 หมายเลข 1–10 เลือก 2 บท ร้องสระ A, E, I, O หรือ U กับเปียโน','Vaccai Lesson 1 ร้อง 2 รอบ · โซลเฟจเดี่ยว แล้วร้องภาษาอิตาเลียนกับเปียโน','เพลงภาษาอิตาเลียน 2 เพลงจาก Anthology of Italian Song','ร้อง Scale และ Arpeggio 1 ออกเตฟตามเกณฑ์ Major และ Minor (Harmonic / Melodic)'],
  Electone:['เดี่ยวเปียโน 1 บท ระดับเกรด 5 ขึ้นไปของสถาบันในอังกฤษ หรือ Yamaha เกรด 7','เดี่ยวอิเลกโทน 2 บทต่างรูปแบบ โดยมี 1 บทที่แต่งหรือเรียบเรียงเอง ระดับ Yamaha เกรด 5 ขึ้นไป']
};
function renderClassical(){
  get('body').innerHTML=`<div class="panel"><label class="field">เครื่องดนตรี / ขับร้อง<select id="instrument">${Object.keys(practical).map(name=>`<option>${name}</option>`).join('')}</select></label>
  <p class="hint">เกณฑ์ปฏิบัติคลาสสิกฉบับปรับปรุง 14 กันยายน 2566</p></div><div class="panel"><h2>รายการเตรียมสอบ</h2>
  <p class="hint">เกณฑ์บรรเลงทั่วไป · Scale Major, Harmonic Minor และ Melodic Minor กับ Arpeggio Major และ Minor ในคีย์ไม่เกิน 4 ชาร์ปหรือ 4 แฟลต</p>
  <ul class="tasks" id="tasks"></ul></div>`;
  const selection=get('instrument');
  if(Object.hasOwn(practical,progress.instrument)) selection.value=progress.instrument;
  const showTasks=()=>{
    const name=selection.value;
    const general=['บันไดเสียง Major, Harmonic Minor และ Melodic Minor','อาร์เพจจิโอ Major และ Minor'];
    const tasks=['Voice (Classical)','Percussion','Electone'].includes(name)?practical[name]:[...general,...practical[name]];
    get('tasks').innerHTML=tasks.map((task,index)=>`<li><label><input type="checkbox" data-task="${index}"><span>${task}</span></label></li>`).join('');
    for(const checkbox of room.querySelectorAll('[data-task]')){
      const key=`${name}:${checkbox.dataset.task}`;
      checkbox.checked=Boolean(progress.checks[key]);
      checkbox.onchange=()=>{progress.checks[key]=checkbox.checked;save();};
    }
  };
  selection.onchange=()=>{progress.instrument=selection.value;save();showTasks();};
  showTasks();
}
function renderLessonIndex() {
  const incomplete=lessons.find(lesson=>!progress.lessons[lesson.id]);
  room.innerHTML=`<a class="back" href="#home">← หน้าหลัก</a>
    <header class="room-head"><p class="eyebrow">SMCC · GRADE 6</p><h1 tabindex="-1">บทเรียน</h1>
    <p>เรียนหลักการจากตัวอย่าง แล้วลองตอบก่อนเข้าห้องฝึก</p>
    ${incomplete?`<a class="button primary" href="#lessons/${incomplete.id}">${lessons.some(lesson=>progress.lessons[lesson.id])?'เรียนบทถัดไป':'เริ่มบทแรก'}</a>`:''}</header>
    <div class="lesson-groups">${Object.entries(lessonGroups).map(([group,title])=>{
      const list=lessons.filter(lesson=>lesson.group===group);
      const completed=list.filter(lesson=>progress.lessons[lesson.id]).length;
      return `<section class="panel lesson-group"><div class="lesson-group-title"><h2>${title}</h2><span>ผ่าน ${completed}/${list.length} บท</span></div>
      <ol>${list.map(lesson=>`<li><a href="#lessons/${lesson.id}"><span>${lesson.title}</span><span class="lesson-state">${progress.lessons[lesson.id]?'ผ่านแล้ว ✓':'→'}</span></a></li>`).join('')}</ol></section>`;
    }).join('')}</div>`;
}

function renderLesson(lesson) {
  const position=lessons.indexOf(lesson);
  const previous=lessons[position-1];
  const next=lessons[position+1];
  const practiceLink=[lesson.group,lesson.practice].filter(Boolean).join('/');
  const clipButton=(id,label)=>`<button class="button" type="button" id="${id}">▶ ${label}</button>`;
  room.innerHTML=`<a class="back" href="#lessons">← บทเรียนทั้งหมด</a>
    <header class="room-head"><p>${lessonGroups[lesson.group]} · บทที่ ${position+1}/${lessons.length}</p><h1 tabindex="-1">${lesson.title}</h1></header>
    <div class="lesson-content">
    <section class="panel"><h2>วิธีทำทีละขั้น</h2>
    <ol class="lesson-steps">${lesson.steps.map(step=>`<li>${step}</li>`).join('')}</ol>
    <div class="worked-example"><h3>ตัวอย่าง</h3><p>${lesson.example}</p>
    ${lesson.clips?`<div class="lesson-actions">${lesson.clips.map((clip,index)=>clipButton('clip-'+index,clip.label)).join('')}</div>`:''}
    ${lesson.melody?`<div class="lesson-notation"><canvas role="img"></canvas></div>${clipButton('play-melody','ฟังเสียงเทียบ')}`:''}
    </div></section>
    <section class="panel"><h2>ลองตอบ</h2><p>${lesson.question}</p>
    ${lesson.audio?clipButton('play-check','ฟังเสียงโจทย์'):''}
    <div id="audio-status" role="status"></div><div class="options">
    ${lesson.options.map((option,index)=>`<button class="button" data-answer="${index}" type="button">${option}</button>`).join('')}
    </div><p id="lesson-feedback" class="feedback" role="status"></p>
    <p id="lesson-passed" class="lesson-passed" ${progress.lessons[lesson.id]?'':'hidden'}>✓ ผ่านแบบทบทวนบทนี้แล้ว</p></section>
    <div class="lesson-actions lesson-navigation">
    ${previous?`<a class="button" href="#lessons/${previous.id}">← บทก่อนหน้า</a>`:''}
    <a class="button primary" href="#${practiceLink}">ฝึกต่อในห้องฝึก ↗</a>
    <a class="button" href="${next?'#lessons/'+next.id:'#lessons'}">${next?'บทถัดไป →':'บทเรียนทั้งหมด'}</a></div></div>`;
  lesson.clips?.forEach((clip,index)=>{get('clip-'+index).onclick=()=>playQuestion(clip);});
  if(lesson.melody){
    drawMusic(room.querySelector('canvas'),lesson.melody);
    get('play-melody').onclick=()=>playQuestion({...lesson.melody,practice:true,sequence:true});
  }
  if(lesson.audio) get('play-check').onclick=()=>playQuestion(lesson);
  const buttons=[...room.querySelectorAll('[data-answer]')];
  for(const button of buttons) button.onclick=()=>{
    if(button.getAttribute('aria-disabled')==='true') return;
    const correct=Number(button.dataset.answer)===lesson.answer;
    button.classList.add(correct?'correct':'incorrect');
    button.setAttribute('aria-disabled','true');
    get('lesson-feedback').textContent=correct?lesson.explanation:'ลองอีกครั้ง หรือย้อนดูตัวอย่างด้านบน';
    if(!correct) return;
    buttons.forEach(option=>option.setAttribute('aria-disabled','true'));
    progress.lessons[lesson.id]=true;
    save();
    get('lesson-passed').hidden=false;
  };
}

function route(){
  clearInterval(clockId);
  clearInterval(backingTimeout);
  stopAudio();
  const [name,topic]=location.hash.slice(1).split('/');
  const active=name==='lessons'||Object.hasOwn(titles,name);
  get('home').hidden=active;
  room.hidden=!active;
  if(!active){
    room.replaceChildren();
    if(['modules','progress'].includes(name)) get(name).scrollIntoView();
    else window.scrollTo(0,0);
    return;
  }
  if(name==='lessons'){
    const lesson=lessons.find(entry=>entry.id===topic);
    if(lesson) renderLesson(lesson);
    else renderLessonIndex();
  }else{
    const [english,thai,description]=titles[name];
    const lesson=lessons.find(entry=>entry.group===name&&entry.practice===topic)
      ||lessons.find(entry=>entry.group===name);
    room.innerHTML=`<a class="back" href="#modules">← ห้องฝึกทั้งหมด</a>
      <header class="room-head"><p class="eyebrow">${english}</p><h1 tabindex="-1">${thai}</h1><p>${description}</p>
      <a class="button secondary" id="room-lesson" href="#lessons/${lesson.id}">อ่านบทเรียน ${thai}</a></header><div id="body"></div>`;
    if(name==='song') renderSong();
    else if(name==='classical') renderClassical();
    else renderQuiz(name,topic);
  }
  window.scrollTo(0,0);
  room.querySelector('h1').focus({preventScroll:true});
}
window.addEventListener('hashchange',route);
route();
