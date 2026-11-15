const noteExample = (title, labels, audio, detail, chord=false) => ({title, labels:labels.split(' '), audio, detail, chord});
const lessonVisuals = {
  'start-pitch': {title:'ฟังสองเสียงแล้วมองทิศทาง',examples:[
    noteExample('เสียงสูงขึ้น','C4 G4',[60,67],'เริ่มที่ C4 แล้วขยับไปทางขวาถึง G4'),
    noteExample('เสียงต่ำลง','G4 C4',[67,60],'เริ่มที่ G4 แล้วขยับไปทางซ้ายถึง C4'),
    noteExample('ระดับเสียงเท่ากัน','C4 C4',[60,60],'คีย์เดิมดังสองครั้ง')
  ]},
  'start-names': {title:'ฟังและอ่านชื่อโน้ตสองภาษา',examples:[
    {...noteExample('จากโดกลางถึงโดสูง','C4 D4 E4 F4 G4 A4 B4 C5',[60,62,64,65,67,69,71,72],'กดชื่อโน้ตแล้วพูดตาม ตั้งแต่โดกลางไปถึงโดสูง'),
     captions:['โด · C4','เร · D4','มี · E4','ฟา · F4','ซอล · G4','ลา · A4','ที · B4','โดสูง · C5']}
  ]},
  'start-keyboard': {title:'ใช้กลุ่มคีย์ดำเป็นจุดสังเกต',examples:[
    {...noteExample('หา C จากกลุ่มดำสองคีย์','C4 C5',[60,72],'C4 อยู่ซ้ายกลุ่มคีย์ดำสองคีย์แรก ส่วน C5 เป็นต้นรอบถัดไป'),rangeEnd:76},
    noteExample('หา F จากกลุ่มดำสามคีย์','F4',[65],'มองหากลุ่มดำสามคีย์ แล้วกดคีย์ขาวที่อยู่ชิดซ้าย'),
    noteExample('ไล่คีย์ขาวจาก C','C4 D4 E4 F4 G4 A4 B4 C5',[60,62,64,65,67,69,71,72],'คีย์ขาวเรียงตามลำดับตัวอักษร แล้ววนกลับมาที่ C')
  ]},
  'start-staff': {title:'จับคู่หัวโน้ตกับคีย์เปียโน',examples:[
    {...noteExample('เส้น–ช่อง–เส้น · E F G','E4 F4 G4',[64,65,67],'E อยู่บนเส้นที่ 1, F อยู่ในช่องที่ 1, G อยู่บนเส้นที่ 2'),staff:true},
    {...noteExample('ขึ้นไปอีกหนึ่งช่อง · G A B','G4 A4 B4',[67,69,71],'จาก G บนเส้นที่ 2 ขึ้นไป A ในช่องที่ 2 แล้วไป B บนเส้นที่ 3'),staff:true}
  ]},
  'start-beat': {title:'นับจังหวะตามแท่งทีละห้อง',examples:[
    {title:'4/4 · นับ 1–2–3–4',groups:[4,4],unit:'จังหวะ',detail:'นับ 1–2–3–4 | 1–2–3–4 ขณะฟังเสียง'},
    {title:'3/4 · นับ 1–2–3',groups:[3,3],unit:'จังหวะ',detail:'นับ 1–2–3 | 1–2–3 และตบมือให้หนักขึ้นที่เลข 1'}
  ]},
  'start-duration': {title:'ฟังโน้ต C ที่มีความยาวต่างกัน',examples:[
    {title:'♩ ตัวดำ 4 ตัว',groups:[1,1,1,1],unit:'จังหวะ',sustain:true,detail:'เริ่มเสียงใหม่ทุกจังหวะ เสียงแต่ละครั้งยาว 1 จังหวะ'},
    {title:'𝅗𝅥 ตัวขาว 2 ตัว',groups:[2,2],unit:'จังหวะ',sustain:true,detail:'เริ่มเสียงที่เลข 1 และ 3 แต่ละเสียงค้างผ่านเลขถัดไป'},
    {title:'𝅝 ตัวกลม 1 ตัว',groups:[4],unit:'จังหวะ',sustain:true,detail:'เริ่มเสียงครั้งเดียวที่เลข 1 และค้างจนครบห้อง'}
  ]},
  'start-steps': {title:'เทียบระยะของคีย์ที่อยู่ติดกัน',examples:[
    noteExample('C → C♯','C4 C♯4',[60,61],'ขยับไปคีย์ถัดไปหนึ่งครั้ง เท่ากับครึ่งเสียง'),
    noteExample('C → D','C4 D4',[60,62],'ผ่านคีย์ดำ C♯ ก่อนถึง D เท่ากับหนึ่งเต็มเสียง'),
    noteExample('E → F','E4 F4',[64,65],'คีย์ขาวสองตัวนี้ติดกัน เท่ากับครึ่งเสียง'),
    noteExample('D → D♭','D4 D♭4',[62,61],'แฟลตทำให้ D ต่ำลงครึ่งเสียง คีย์นี้ใช้ร่วมกับ C♯')
  ]},
  'start-scale': {title:'เล่น C Major จากโน้ตทีละตัว',showSteps:true,examples:[
    {...noteExample('ขาขึ้น · C4 ถึง C5','C4 D4 E4 F4 G4 A4 B4 C5',[60,62,64,65,67,69,71,72],'ตามบรรทัดห้าเส้นจากซ้ายไปขวา สังเกตครึ่งเสียงที่ E–F และ B–C'),staff:true},
    {...noteExample('ขาลง · C5 ถึง C4','C5 B4 A4 G4 F4 E4 D4 C4',[72,71,69,67,65,64,62,60],'เริ่มจากโดสูงแล้วไล่ลงจนถึงโดกลาง'),staff:true}
  ]},
  'start-chord': {title:'ฟังโน้ตชุดเดิมสองวิธี',examples:[
    noteExample('เล่นทีละโน้ต','C4 E4 G4',[60,64,67],'ฟังเสียง C, E และ G แยกกัน'),
    noteExample('เล่นพร้อมกัน','C4 E4 G4',[60,64,67],'ทั้งสามเสียงดังพร้อมกันเป็นคอร์ด C Major',true)
  ]},
  reading: {
    title:'จากบรรทัดห้าเส้นสู่คีย์เปียโน',
    examples:[
      {...noteExample('กุญแจซอล · เส้นที่ 1–5','E4 G4 B4 D5 F5',[64,67,71,74,77],'นับเส้นจากล่างขึ้นบน เริ่มที่ E4'),staff:true},
      {...noteExample('กุญแจซอล · ช่องที่ 1–4','F4 A4 C5 E5',[65,69,72,76],'นับช่องจากล่างขึ้นบน เริ่มที่ F4'),staff:true}
    ]
  },
  scale: {
    title:'เปรียบเทียบบันไดเสียง',
    showSteps:true,
    examples:[
      noteExample('A Major','A4 B4 C♯5 D5 E5 F♯5 G♯5 A5',[69,71,73,74,76,78,80,81],'เว้นเต็มเสียงทุกคู่ ยกเว้นขั้น 3–4 และ 7–8'),
      noteExample('A Natural Minor','A4 B4 C5 D5 E5 F5 G5 A5',[69,71,72,74,76,77,79,81],'ขั้น 6 คือ F และขั้น 7 คือ G'),
      noteExample('A Harmonic Minor','A4 B4 C5 D5 E5 F5 G♯5 A5',[69,71,72,74,76,77,80,81],'ยกเฉพาะขั้น 7 จาก G เป็น G♯'),
      noteExample('A Melodic Minor · ขาขึ้น','A4 B4 C5 D5 E5 F♯5 G♯5 A5',[69,71,72,74,76,78,80,81],'ยกขั้น 6 และ 7 เมื่อเล่นขาขึ้น'),
      noteExample('A Melodic Minor · ขาลง','A5 G5 F5 E5 D5 C5 B4 A4',[81,79,77,76,74,72,71,69],'ขาลงแบบคลาสสิกกลับมาใช้ G และ F'),
      noteExample('A Jazz Melodic Minor · ขาลง','A5 G♯5 F♯5 E5 D5 C5 B4 A4',[81,80,78,76,74,72,71,69],'แบบแจ๊สคง G♯ และ F♯ ไว้เมื่อเล่นขาลง')
    ]
  },
  interval: {title:'นับครึ่งเสียงบนแป้น',examples:[
    noteExample('Minor 3rd','C4 E♭4',[60,63],'ห่าง 3 ครึ่งเสียง'),
    noteExample('Major 3rd','C4 E4',[60,64],'ห่าง 4 ครึ่งเสียง'),
    noteExample('Augmented 4th','C4 F♯4',[60,66],'ชื่อ C–F ใช้เลขขั้นคู่ 4 ระยะ 6 ครึ่งเสียง'),
    noteExample('Diminished 5th','C4 G♭4',[60,66],'ชื่อ C–G ใช้เลขขั้นคู่ 5 แม้กดคีย์เดียวกับ F♯')
  ]},
  'hear-interval': {title:'ฟังและดูระยะขั้นคู่ขาขึ้น',examples:[
    noteExample('Minor 3rd','C4 E♭4',[60,63],'ลองฮัมโน้ตที่สองแล้วจำระยะ 3 ครึ่งเสียง'),
    noteExample('Major 3rd','C4 E4',[60,64],'ใช้โน้ตฐานเดิมแล้วเพิ่มระยะอีกครึ่งเสียง'),
    noteExample('Perfect 4th','C4 F4',[60,65],'ขยายเป็น 5 ครึ่งเสียงเพื่อเปรียบเทียบ')
  ]},
  transpose: {title:'ย้ายทำนองโดยคงขั้น 1–3–5',examples:[
    noteExample('ก่อนทด · C Major','C4 E4 G4',[60,64,67],'จากขั้น 1 ไปขั้น 3 ห่าง 4 ครึ่งเสียง จากขั้น 3 ไปขั้น 5 ห่าง 3 ครึ่งเสียง'),
    noteExample('หลังทด · D Major','D4 F♯4 A4',[62,66,69],'ทั้งสามโน้ตเลื่อนสูงขึ้น 2 ครึ่งเสียง โดยระยะภายในทำนองเท่าเดิม')
  ]},
  dictation: {title:'ดูทิศทางทำนองหลังฝึกฟัง',examples:[
    {...noteExample('ฝึกถอดทำนอง 2/4','C4 D4 F4 E4',[60,62,65,64],'เริ่มจาก C ขึ้นทีละขั้น จากนั้นกระโดดขึ้น F แล้วลง E'),staff:true,meter:'2/4'}
  ]},
  sight: {title:'อ่านโน้ตและฟังเสียงเทียบ',examples:[
    {...noteExample('ร้องโซลเฟจ · 3/4','C4 D4 E4 G4 E4 C4',[60,62,64,67,64,60],'ลองร้อง โด–เร–มี | ซอล–มี–โด ก่อนกดเล่น'),staff:true,meter:'3/4'}
  ]},
  'song-motif': {title:'ลองฟังทำนองหลักและทำนองที่แปรแล้ว',examples:[
    {...noteExample('Motif เดิม','C4 D4 E4',[60,62,64],'ฟังรูปร่างขาขึ้นจาก C ไป E'),staff:true},
    {...noteExample('เปลี่ยนโน้ตท้าย','C4 D4 G4',[60,62,67],'สองโน้ตแรกและความยาวเท่าเดิม เปลี่ยนเฉพาะ E เป็น G'),staff:true}
  ]},
  'classical-scale': {title:'ดูตำแหน่งโน้ตใน Scale และ Arpeggio',examples:[
    noteExample('D Major Scale','D4 E4 F♯4 G4 A4 B4 C♯5 D5',[62,64,66,67,69,71,73,74],'ฟังบันไดเสียงครบหนึ่งออกเตฟก่อนเพิ่มจำนวนออกเตฟตามเกณฑ์เครื่องดนตรี'),
    noteExample('D Major Arpeggio','D4 F♯4 A4 D5',[62,66,69,74],'เลือกโน้ตขั้น 1–3–5 และกลับที่ขั้น 1'),
    noteExample('D Minor Arpeggio','D4 F4 A4 D5',[62,65,69,74],'ลดขั้น 3 จาก F♯ เป็น F')
  ]},
  'classical-piece': {title:'แยกซ้อมวลีสั้นแล้วต่อกลับเป็นวลีเต็ม',examples:[
    {...noteExample('ซ้อมช่วงกระโดด','E4 A4 G4',[64,69,67],'ฟังและร้องช่วง E–A ก่อนเล่นวลีเต็ม'),staff:true},
    {...noteExample('ต่อกลับเข้าวลี','C4 D4 E4 A4 G4 E4 D4 C4',[60,62,64,69,67,64,62,60],'พอช่วงกระโดดนิ่งแล้ว เล่นตั้งแต่ต้นจนจบโดยรักษาจังหวะ'),staff:true,meter:'4/4'}
  ]},
  rhythm: {title:'มองการแบ่งจังหวะในหนึ่งห้อง',examples:[
    {title:'2/4 · จังหวะธรรมดา',groups:[2,2],unit:'เขบ็ตหนึ่งชั้น',detail:'เขบ็ตหนึ่งชั้น 4 ตัว แบ่งเป็น 2 จังหวะหลัก'},
    {title:'6/8 · จังหวะผสม',groups:[3,3],unit:'เขบ็ตหนึ่งชั้น',detail:'เขบ็ตหนึ่งชั้น 6 ตัว แบ่งเป็น 2 จังหวะหลัก'},
    {title:'5/8 · เน้น 2+3',groups:[2,3],unit:'เขบ็ตหนึ่งชั้น',detail:'ลองฟังจุดเน้นต้นกลุ่มที่ 1 และ 3'},
    {title:'5/8 · เน้น 3+2',groups:[3,2],unit:'เขบ็ตหนึ่งชั้น',detail:'ลองฟังจุดเน้นต้นกลุ่มที่ 1 และ 4'},
    {title:'9/8 · จังหวะผสม',groups:[3,3,3],unit:'เขบ็ตหนึ่งชั้น',detail:'เขบ็ตหนึ่งชั้น 9 ตัว แบ่งเป็น 3 จังหวะหลัก'}
  ]},
  'song-form': {title:'ดูจำนวนห้องและจุดเข้าท่อนร้อง',examples:[
    {title:'โครงสร้างแบบที่ 1',groups:[4,4,8,8],unit:'ห้อง',labels:['Intro','Verse','Pre-Chorus','Chorus'],detail:'เริ่ม Verse ห้องที่ 5, Pre-Chorus ห้องที่ 9 และ Chorus ห้องที่ 17'},
    {title:'โครงสร้างแบบที่ 2',groups:[4,8,4,8],unit:'ห้อง',labels:['Intro','Verse','Pre-Chorus','Chorus'],detail:'เริ่ม Verse ห้องที่ 5, Pre-Chorus ห้องที่ 13 และ Chorus ห้องที่ 17'}
  ]}
};

const chordVisuals = (bank, spellings) => Object.entries(bank).map(([title,steps],index)=>
  noteExample('C '+title,spellings[index],steps.map(step=>60+step),
    'ระยะจาก C ตามลำดับ '+steps.join(' · ')+' ครึ่งเสียง',true));
const triadVisuals=chordVisuals(triads,['C4 E4 G4','C4 E♭4 G4','C4 E♭4 G♭4','C4 E4 G♯4']);
const seventhVisuals=chordVisuals(sevenths,['C4 E4 G4 B4','C4 E♭4 G4 B♭4','C4 E4 G4 B♭4','C4 E♭4 G♭4 B♭4','C4 E♭4 G♭4 B♭♭4']);
lessonVisuals.triad={title:'ดูโน้ตราก ขั้น 3 และขั้น 5',examples:triadVisuals};
lessonVisuals.seventh={title:'ดูโน้ตที่เพิ่มจากทรัยแอด',examples:seventhVisuals};
lessonVisuals['hear-triad']={title:'เทียบคีย์ที่เปลี่ยนเมื่อฟังทรัยแอด',examples:triadVisuals};
lessonVisuals['hear-seventh']={title:'เทียบเสียงตัวบนของเซเว่นคอร์ด',examples:seventhVisuals};
