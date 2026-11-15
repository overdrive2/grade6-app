const notes = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const intervals = ['ยูนิซัน', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd', 'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th', 'Minor 7th', 'Major 7th', 'Perfect Octave'];
const triads = {Major:[0,4,7], Minor:[0,3,7], Diminished:[0,3,6], Augmented:[0,4,8]};
const sevenths = {'Major Seventh':[0,4,7,11], 'Minor Seventh':[0,3,7,10], 'Dominant Seventh':[0,4,7,10], 'Half-Diminished':[0,3,6,10], 'Full-Diminished':[0,3,6,9]};
const scales = {
  Major:[0,2,4,5,7,9,11], 'Natural Minor':[0,2,3,5,7,8,10],
  'Harmonic Minor':[0,2,3,5,7,8,11], 'Melodic Minor ขาขึ้น':[0,2,3,5,7,9,11],
  'Melodic Minor ขาลง':[0,2,3,5,7,8,10], 'Jazz Melodic Minor':[0,2,3,5,7,9,11]
};
const categories = {
  theory:{reading:'อ่านโน้ต', scale:'บันไดเสียง', triad:'ทรัยแอด', seventh:'เซเว่นคอร์ด', interval:'ขั้นคู่', rhythm:'จังหวะ', transpose:'ทดคีย์'},
  ear:{interval:'ขั้นคู่ขาขึ้น', triad:'ทรัยแอด', seventh:'เซเว่นคอร์ด', dictation:'เขียนทำนอง', sight:'ร้องจากโน้ต'}
};
const keys = ['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const letters = 'CDEFGAB';
const natural = [0,2,4,5,7,9,11];
const random = n => Math.floor(Math.random() * n);
const pick = list => list[random(list.length)];
const shuffled = list => {
  const copy = [...list];
  for (let i=copy.length-1; i>0; i--) {
    const j=random(i+1);
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
};
const mod = (n, size) => (n % size + size) % size;
const pitchClass = name => mod(natural[letters.indexOf(name[0])] + (name[1] === '♯' ? 1 : name[1] === '♭' ? -1 : 0),12);
function spell(root, semitone, degree) {
  const index = mod(letters.indexOf(root[0]) + degree, 7);
  const delta = mod(pitchClass(root) + semitone - natural[index] + 6,12)-6;
  return letters[index] + (delta < 0 ? '♭'.repeat(-delta) : '♯'.repeat(delta));
}
function multiple(question, answer, pool, explanation, extra={}) {
  return {question, answer, options:shuffled([answer,...shuffled(pool.filter(v=>v!==answer)).slice(0,3)]), explanation,...extra};
}
const rhythmQuestions = [
  ['อัตราจังหวะ 6/8 มีกี่จังหวะหลักต่อห้อง?', '2 จังหวะ', ['1 จังหวะ','2 จังหวะ','3 จังหวะ','6 จังหวะ'], 'แบ่งเขบ็ตหนึ่งชั้นเป็น 3 + 3 จึงได้ 2 จังหวะหลัก'],
  ['ใน 9/8 ควรจัดกลุ่มเขบ็ตหนึ่งชั้นอย่างไร?', '3 + 3 + 3', ['2 + 2 + 2 + 3','3 + 3 + 3','4 + 5','3 + 6'], '9/8 เป็นอัตราจังหวะผสม 3 จังหวะหลัก แต่ละจังหวะมีเขบ็ตหนึ่งชั้น 3 ตัว'],
  ['ใน 5/8 ข้อใดเป็นการจัดกลุ่มตามจังหวะหลักที่ใช้ได้?', '2 + 3', ['2 + 3','3 + 3','2 + 2','4 + 2'], '5/8 เป็นอัตราจังหวะซ้อน แบ่งได้เป็น 2 + 3 หรือ 3 + 2'],
  ['4/4 จัดอยู่ในอัตราจังหวะประเภทใด?', 'ธรรมดา (Simple)', ['ธรรมดา (Simple)','ผสม (Compound)','ซ้อน (Complex)'], 'แต่ละจังหวะหลักแบ่งเป็น 2 ส่วนเท่า ๆ กัน']
];
const clefs = {
  'Treble':'EGBDF', 'Bass':'GBDFA', 'Alto':'FACEG', 'Tenor':'DFACE',
  'Soprano':'CEGBD', 'Mezzo-soprano':'ACEGB', 'Baritone (C clef)':'BDFAC',
  'Baritone (F clef)':'BDFAC', 'French violin':'GBDFA', 'Sub-bass':'EGBDF'
};
function makeQuestion(room, category) {
  const root=pick(keys);
  const midi=60+pitchClass(root);
  if (category==='reading') {
    const clef=pick(Object.keys(clefs));
    const line=random(5);
    const answer=clefs[clef][line];
    return multiple(`ในกุญแจ ${clef} โน้ตบนเส้นที่ ${line+1} จากล่างคือโน้ตอะไร?`,answer,[...letters],`เส้นทั้งห้าจากล่างขึ้นบนคือ ${[...clefs[clef]].join(' – ')}`);
  }
  if (category==='scale') {
    const type=pick(Object.keys(scales));
    const degree=pick([1,2,3,4,5,6]);
    const scale=scales[type].map((step,index)=>spell(root,step,index));
    const answer=scale[degree];
    return multiple(`ขั้นที่ ${degree+1} ของบันไดเสียง ${root} ${type} คือโน้ตอะไร?`,answer,[...new Set([...scale,...notes,answer])],scale.join(' – '));
  }
  if (category==='triad'||category==='seventh') {
    const bank=category==='triad'?triads:sevenths;
    const type=pick(Object.keys(bank));
    const chord=bank[type].map((step,index)=>spell(root,step,index*2));
    const question=room==='ear'?'ฟังเสียงแล้วเลือกชนิดคอร์ด':`คอร์ด ${chord.join(' – ')} เป็นคอร์ดชนิดใด?`;
    const pool=Object.keys(bank);
    const quiz=multiple(question,type,pool,`โน้ตในคอร์ด ${chord.join(' – ')}`,{audio:bank[type].map(step=>midi+step)});
    if(room==='ear') quiz.options=shuffled(pool);
    return quiz;
  }
  if (category==='interval') {
    const step=1+random(12);
    const diminished=room==='theory'&&step===6&&random(2)===0;
    const degree=diminished?4:[0,1,1,2,2,3,3,4,5,5,6,6,7][step];
    const upper=spell(root,step,degree);
    const answer=room==='theory'&&step===6?(diminished?'Diminished 5th':'Augmented 4th'):intervals[step];
    const pool=room==='theory'?[...intervals.slice(1).filter(value=>value!=='Tritone'),'Augmented 4th','Diminished 5th'] : intervals.slice(1);
    const question=room==='ear'?'ฟังโน้ตสองตัวแล้วระบุขั้นคู่ขาขึ้น':`${root} → ${upper}${step===12?' (สูงขึ้น 1 ออกเตฟ)':''} เป็นขั้นคู่ใด?`;
    return multiple(question,answer,pool,`ระยะห่าง ${step} ครึ่งเสียง`,{audio:[midi,midi+step],sequence:true});
  }
  if (category==='rhythm') return multiple(...pick(rhythmQuestions));
  if (category==='transpose') {
    const target=pick(keys.filter(key=>key!==root));
    const degrees=shuffled([0,1,2,3,4,5,6]).slice(0,3);
    const phrase=key=>degrees.map(degree=>spell(key,scales.Major[degree],degree));
    const answer=phrase(target).join(' – ');
    return multiple(`ทดทำนอง ${phrase(root).join(' – ')} จาก ${root} Major ไป ${target} Major`,answer,keys.map(key=>phrase(key).join(' – ')),`คงลำดับขั้นของโน้ต ${degrees.map(d=>d+1).join(' – ')} ไว้ในคีย์ใหม่`);
  }
  const sight=category==='sight';
  const meter=sight?pick(['2/4','3/4','4/4','6/8']):pick(['2/4','4/4']);
  const beats=Number(meter[0]);
  const degrees=[0,...Array.from({length:beats*2-2},()=>random(6)),0];
  return {practice:true,sight,meter,beats,degrees,question:sight?'ร้องทำนองจากโน้ตก่อนฟังเสียงตัวอย่าง':'ฟังแล้วเขียนทำนองลงบนบรรทัดห้าเส้น',audio:degrees.map(d=>60+scales.Major[d]),sequence:true};
}
