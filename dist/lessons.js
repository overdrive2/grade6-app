const lessonGroups = {
  theory: 'ทฤษฎีดนตรี',
  ear: 'โสตทักษะ',
  song: 'แต่งเพลง',
  classical: 'ปฏิบัติคลาสสิก'
};

const lessons = [
  {
    id: 'reading', group: 'theory', practice: 'reading', title: 'อ่านโน้ตจากกุญแจเสียง',
    steps: ['หากุญแจเสียงและเส้นอ้างอิงก่อน กุญแจซอลชี้ G บนเส้นที่ 2 กุญแจฟาชี้ F บนเส้นที่ 4 โดยนับจากล่าง', 'กุญแจโดให้ C อยู่บนเส้นกลางในกุญแจ Alto และบนเส้นที่ 4 ในกุญแจ Tenor', 'จากโน้ตอ้างอิง นับชื่อโน้ตทีละขั้นเมื่อขยับระหว่างเส้นกับช่องว่าง'],
    example: 'ในกุญแจซอล เส้นล่างขึ้นบนคือ E–G–B–D–F และช่องว่างคือ F–A–C–E',
    question: 'โน้ตบนเส้นกลางของกุญแจ Alto คืออะไร?', options: ['G', 'C', 'F'], answer: 1,
    explanation: 'กุญแจ Alto เป็นกุญแจโดที่กำหนดให้เส้นที่ 3 เป็น C'
  },
  {
    id: 'scale', group: 'theory', practice: 'scale', title: 'สร้างบันไดเสียงเมเจอร์และไมเนอร์',
    steps: ['Major ใช้ระยะ เต็ม–เต็ม–ครึ่ง–เต็ม–เต็ม–เต็ม–ครึ่ง โดยเขียนชื่อโน้ต A–G ให้ครบและไม่ซ้ำในหนึ่งรอบ', 'Harmonic Minor ยกขั้น 7 ของ Natural Minor ครึ่งเสียง ส่วน Melodic Minor แบบคลาสสิกยกขั้น 6 และ 7 ขาขึ้น แล้วใช้ Natural Minor ขาลง', 'Jazz Melodic Minor ใช้โน้ตชุดเดียวกับ Classical Melodic Minor ขาขึ้นทั้งสองทิศทาง'],
    example: 'A Natural Minor คือ A–B–C–D–E–F–G–A และ A Harmonic Minor เปลี่ยน G เป็น G♯',
    question: 'A Jazz Melodic Minor ขาลงใช้โน้ตขั้น 6 และ 7 ตัวใด?', options: ['F และ G', 'F และ G♯', 'F♯ และ G♯'], answer: 2,
    explanation: 'Jazz Melodic Minor ยกขั้น 6 และ 7 ทั้งขาขึ้นและขาลง'
  },
  {
    id: 'triad', group: 'theory', practice: 'triad', title: 'แยกทรัยแอดทั้งสี่ชนิด',
    steps: ['เรียงโน้ตเป็นราก ขั้น 3 และขั้น 5 แล้ววัดระยะจากรากเป็นครึ่งเสียง', 'Major ใช้ 0–4–7, Minor ใช้ 0–3–7, Diminished ใช้ 0–3–6 และ Augmented ใช้ 0–4–8'],
    example: 'C–E–G เป็น C Major และ C–E♭–G♭ เป็น C Diminished',
    question: 'C–E–G♯ เป็นทรัยแอดชนิดใด?', options: ['Augmented', 'Minor', 'Diminished'], answer: 0,
    explanation: 'E อยู่เหนือ C 4 ครึ่งเสียง ส่วน G♯ อยู่เหนือ C 8 ครึ่งเสียง'
  },
  {
    id: 'seventh', group: 'theory', practice: 'seventh', title: 'อ่านเซเว่นคอร์ดจากทรัยแอด',
    steps: ['ดูทรัยแอดสามตัวแรก แล้ววัดขั้น 7 จากราก', 'Major Seventh = Major + 11 ครึ่งเสียง, Dominant Seventh = Major + 10 และ Minor Seventh = Minor + 10', 'Half-Diminished และ Full-Diminished เริ่มจาก Diminished Triad ขั้น 7 อยู่ห่างจากราก 10 และ 9 ครึ่งเสียงตามลำดับ'],
    example: 'C–E–G–B♭ คือ C Dominant Seventh ส่วน C–E♭–G♭–B♭ คือ C Half-Diminished',
    question: 'C–E♭–G♭–B𝄫 เป็นคอร์ดชนิดใด?', options: ['Half-Diminished', 'Full-Diminished', 'Minor Seventh'], answer: 1,
    explanation: 'C–E♭–G♭ เป็น Diminished Triad และ B𝄫 อยู่เหนือ C 9 ครึ่งเสียง'
  },
  {
    id: 'interval', group: 'theory', practice: 'interval', title: 'นับเลขขั้นคู่และคุณภาพ',
    steps: ['นับชื่อโน้ตรวมตัวแรกและตัวสุดท้ายเพื่อหาเลขขั้นคู่', 'นับครึ่งเสียงเพื่อหา Major, Minor, Perfect, Augmented หรือ Diminished โดยพิจารณาเลขขั้นคู่ก่อนเสมอ'],
    example: 'C–F♯ ใช้ 4 ชื่อโน้ตและห่าง 6 ครึ่งเสียง จึงเป็น Augmented 4th ส่วน C–G♭ ห่างเท่ากันแต่เป็น Diminished 5th',
    question: 'จาก D ขึ้นไป F เป็นขั้นคู่ใด?', options: ['Major 3rd', 'Perfect 4th', 'Minor 3rd'], answer: 2,
    explanation: 'D–E–F นับได้ 3 และ D ถึง F ห่าง 3 ครึ่งเสียง'
  },
  {
    id: 'rhythm', group: 'theory', practice: 'rhythm', title: 'จัดกลุ่มจังหวะในหนึ่งห้อง',
    steps: ['ตัวเลขล่างบอกหน่วยโน้ต เช่น 4 คือโน้ตตัวดำ และ 8 คือเขบ็ตหนึ่งชั้น', 'อัตราจังหวะธรรมดาแบ่งจังหวะหลักเป็นสองส่วน ส่วนอัตราจังหวะผสมแบ่งเป็นสามส่วน', 'อัตราจังหวะซ้อน เช่น 5/8 มีจังหวะหลักขนาดต่างกัน จัดกลุ่มได้ 2+3 หรือ 3+2 ตามการเน้นของเพลง'],
    example: '6/8 จัดเขบ็ตหนึ่งชั้นเป็น 3+3 และนับจังหวะหลักได้ 2 จังหวะ',
    question: '9/8 แบบอัตราจังหวะผสมมีกี่จังหวะหลัก?', options: ['3', '6', '9'], answer: 0,
    explanation: 'เขบ็ตหนึ่งชั้น 9 ตัว แบ่งเป็น 3 กลุ่ม กลุ่มละ 3 ตัว'
  },
  {
    id: 'transpose', group: 'theory', practice: 'transpose', title: 'ทดคีย์โดยคงลำดับขั้นของทำนอง',
    steps: ['เขียนบันไดเสียงต้นทางและปลายทาง', 'หาเลขขั้นของโน้ตในทำนองต้นฉบับ แล้วแทนด้วยโน้ตเลขขั้นเดียวกันในคีย์ใหม่ โดยคงจังหวะเดิม'],
    example: 'C–E–G คือขั้น 1–3–5 ใน C Major เมื่อย้ายไป D Major ได้ D–F♯–A',
    question: 'ทด C–D–E จาก C Major ไป F Major จะได้อะไร?', options: ['F–G–A♭', 'F–G–A', 'F–G♭–A'], answer: 1,
    explanation: 'ขั้น 1–2–3 ใน F Major คือ F–G–A'
  },
  {
    id: 'hear-interval', group: 'ear', practice: 'interval', title: 'ฟังขั้นคู่ขาขึ้น',
    steps: ['ฟังโน้ตแรกให้ชัดแล้วฮัมตาม จากนั้นฮัมโน้ตที่สองและเปรียบเทียบระยะ', 'ฝึกแยกคู่ที่ห่างเพียงครึ่งเสียง เช่น Minor 3rd กับ Major 3rd ก่อนสุ่มโน้ตฐานใหม่'],
    example: 'ตัวอย่างเล่น Minor 3rd ก่อน แล้วตามด้วย Major 3rd จากโน้ตฐานเดียวกัน',
    clips: [{label:'ฟัง Minor 3rd',audio:[60,63],sequence:true},{label:'ฟัง Major 3rd',audio:[60,64],sequence:true}],
    question: 'ลองฟังเสียงโจทย์ ระยะห่างเป็นขั้นคู่ใด?', audio: [62,69], sequence: true,
    options: ['Perfect 4th', 'Tritone', 'Perfect 5th'], answer: 2,
    explanation: 'เสียงโจทย์ขึ้นจาก D ไป A ห่าง 7 ครึ่งเสียง'
  },
  {
    id: 'hear-triad', group: 'ear', practice: 'triad', title: 'ฟังทรัยแอดโดยเทียบชนิดคอร์ด',
    steps: ['ฟังตัวอย่างที่ใช้รากเดียวกันและสังเกตการเปลี่ยนขั้น 3 ระหว่าง Major กับ Minor', 'เทียบ Minor กับ Diminished โดยฟังการลดขั้น 5 ลงครึ่งเสียง และเทียบ Major กับ Augmented โดยฟังการยกขั้น 5 ขึ้นครึ่งเสียง'],
    example: 'ตัวอย่างทั้งสี่ใช้ C เป็นราก ให้ลองฟังสลับกันก่อนตอบ',
    clips: Object.entries(triads).map(([label, steps]) => ({label, audio:steps.map(step => 60 + step)})),
    question: 'ฟังเสียงโจทย์แล้วระบุชนิดทรัยแอด', audio: [62,65,68],
    options: ['Diminished', 'Major', 'Minor'], answer: 0,
    explanation: 'ได้ยิน D–F–A♭ ซึ่งมีขั้น 3 ห่าง 3 ครึ่งเสียงและขั้น 5 ห่าง 6 ครึ่งเสียงจากราก'
  },
  {
    id: 'hear-seventh', group: 'ear', practice: 'seventh', title: 'จำแนกเซเว่นคอร์ดจากเสียง',
    steps: ['ลองฟัง Major Seventh กับ Dominant Seventh ที่มีทรัยแอดฐานเหมือนกัน แล้วเทียบเสียงตัวบน', 'ฟัง Half-Diminished เทียบกับ Full-Diminished ด้วยวิธีเดียวกัน ต่อด้วย Minor Seventh แล้วลองสุ่มราก'],
    example: 'ตัวอย่างทั้งห้าชนิดเล่นจากราก C เพื่อให้สังเกตความเปลี่ยนของโน้ตในคอร์ด',
    clips: Object.entries(sevenths).map(([label, steps]) => ({label, audio:steps.map(step => 60 + step)})),
    question: 'ฟังเสียงโจทย์แล้วระบุชนิดเซเว่นคอร์ด', audio: [62,66,69,72],
    options: ['Major Seventh', 'Dominant Seventh', 'Minor Seventh'], answer: 1,
    explanation: 'D–F♯–A เป็น Major Triad และ C อยู่เหนือ D 10 ครึ่งเสียง'
  },
  {
    id: 'dictation', group: 'ear', practice: 'dictation', title: 'เขียนทำนองจากเสียงทีละรอบ',
    steps: ['ฟังรอบแรกเพื่อจับจังหวะและทิศทางของทำนอง แล้วตีเส้นห้อง', 'รอบถัดไปจดจังหวะและโน้ตที่มั่นใจก่อน จากนั้นเติมโน้ตที่เหลือโดยเทียบกับโทนิก', 'ฟังทวนแล้วอ่านโน้ตที่จดให้ตรงกับเสียง ฝึกทั้ง 2/4 และ 4/4 โดยโจทย์สอบยาวไม่เกิน 4 ห้อง'],
    example: 'ตัวอย่าง C Major ใน 2/4 เล่นโน้ตตัวดำ 4 ตัว ลองตบจังหวะพร้อมเสียงก่อนระบุโน้ต',
    question: 'ฟังตัวอย่างแล้วเลือกทำนองที่ได้ยิน', audio: [60,64,62,60], sequence: true,
    options: ['C–D | E–C', 'C–E | F–C', 'C–E | D–C'], answer: 2,
    explanation: 'เสียงกระโดดจาก C ขึ้น E แล้วไล่ลง D และ C'
  },
  {
    id: 'sight', group: 'ear', practice: 'sight', title: 'ร้องจากโน้ตด้วยโซลเฟจ',
    steps: ['อ่านกุญแจเสียง คีย์ อัตราจังหวะ และโน้ตเริ่มต้นก่อนร้อง', 'ตบจังหวะเงียบ ๆ หนึ่งรอบ แล้วมองช่วงที่ทำนองกระโดด ฝึกใน 2/4, 3/4, 4/4 และ 6/8', 'Fixed-Do ให้ C เป็นโด ส่วน Movable-Do ให้โทนิกของคีย์เป็นโด เลือกระบบที่คุ้นแล้วใช้ให้สม่ำเสมอ'],
    example: 'ร้องตัวอย่าง C Major จากโน้ตด้วยตัวเองก่อน จากนั้นเปิดเสียงเทียบทีละตัว',
    melody: {meter:'3/4',beats:3,degrees:[0,1,2,4,2,0], audio:[60,62,64,67,64,60]},
    question: 'ใน G Major โน้ตใดคือโดเมื่อใช้ Movable-Do?', options: ['G', 'C', 'D'], answer: 0,
    explanation: 'ในระบบ Movable-Do โดคือขั้นที่ 1 หรือโทนิกของคีย์'
  },
  {
    id: 'song-form', group: 'song', title: 'วางโครงเพลงจาก Backing Track',
    steps: ['ฟัง Intro แล้วนับเข้าท่อนร้องให้ถูก ทั้งสองแบบมี Intro 4 ห้องและ Chorus 8 ห้อง', 'แบบที่ 1 มี Verse 4 ห้องและ Pre-Chorus 8 ห้อง ส่วนแบบที่ 2 มี Verse 8 ห้องและ Pre-Chorus 4 ห้อง', 'ทดลองร้องท่อนสูงสุดของ Chorus ก่อนเลือกคีย์ C, D, F หรือ G แล้วใช้ Verse เล่าเรื่องและ Pre-Chorus พาเข้าสู่ Chorus'],
    example: 'ตอนซ้อม 60 นาที ลองใช้ 10 นาทีวางโครง 15 นาทีคิดทำนอง 20 นาทีเขียนคำร้อง และ 15 นาทีร้องทวน',
    question: 'ถ้า Verse ยาว 8 ห้อง Pre-Chorus ต้องยาวกี่ห้อง?', options: ['8 ห้อง', '4 ห้อง', '12 ห้อง'], answer: 1,
    explanation: 'เป็นโครงสร้างแบบที่ 2 ซึ่งมี Pre-Chorus 4 ห้อง'
  },
  {
    id: 'song-motif', group: 'song', title: 'สร้าง Motif และวางคำร้อง',
    steps: ['สร้างทำนองสั้นที่ร้องซ้ำได้ แล้วลองแปรจังหวะหรือเปลี่ยนโน้ตท้ายเพื่อให้ยังจำทำนองหลักได้', 'ให้ Verse และ Chorus มีรูปร่างทำนองต่างกัน เช่น ใช้ช่วงเสียงกว้างขึ้นหรือยืดโน้ตสำคัญใน Chorus', 'อ่านเนื้อร้องออกเสียง แล้วเทียบเสียงวรรณยุกต์กับทำนอง ทบทวนความชัดของคำและความตรงคีย์จากวิดีโอที่อัดหลังหมดเวลา'],
    example: 'Motif C–D–E สามารถแปรเป็น C–D–G โดยคงจังหวะเดิมไว้ แล้วลองเปลี่ยนโน้ตตัวท้าย',
    question: 'ข้อใดเป็นตัวอย่างการแปร Motif?', options: ['เปลี่ยนคีย์ Backing Track อย่างเดียว', 'เขียนคำร้องเพิ่มโดยคงทำนองทั้งหมด', 'คงสองโน้ตแรกและเปลี่ยนโน้ตท้าย'], answer: 2,
    explanation: 'ผู้ฟังยังจำจุดเริ่มต้นได้ แต่ได้ยินความเปลี่ยนที่ปลายวลี'
  },
  {
    id: 'classical-scale', group: 'classical', title: 'ซ้อม Scale และ Arpeggio',
    steps: ['ตรวจเงื่อนไขเครื่องดนตรีของตัวเองก่อน เกณฑ์บรรเลงทั่วไปให้เตรียม Major, Harmonic Minor และ Melodic Minor ในคีย์ไม่เกิน 4 ชาร์ปหรือ 4 แฟลต', 'ซ้อม Arpeggio เมเจอร์และไมเนอร์ด้วยโน้ตขั้น 1–3–5 จากนั้นเพิ่มออกเตฟตามเกณฑ์เครื่องดนตรี', 'เริ่มช้าด้วยเมโทรนอม ตรวจนิ้ว ระดับเสียง และความสม่ำเสมอ แล้วค่อยเพิ่มความเร็ว'],
    example: 'D Major Arpeggio คือ D–F♯–A–D ส่วน D Minor Arpeggio คือ D–F–A–D',
    question: 'โน้ตตัวใดต่างกันระหว่าง D Major และ D Minor Arpeggio?', options: ['ขั้น 3', 'ขั้น 1', 'ขั้น 5'], answer: 0,
    explanation: 'เมเจอร์ใช้ F♯ ส่วนไมเนอร์ใช้ F ที่ขั้น 3'
  },
  {
    id: 'classical-piece', group: 'classical', title: 'เตรียมบทสอบและซ้อมรันเต็ม',
    steps: ['เลือกเครื่องดนตรีในห้องปฏิบัติเพื่อตรวจจำนวนบท ท่อนที่ต้องเล่น และเงื่อนไขเรื่องความจำหรือผู้บรรเลงประกอบ', 'แยกซ้อมช่วงที่พลาดบ่อยก่อน แล้วบันทึกการเล่นเต็มบทเพื่อฟังจังหวะ น้ำเสียง และการตีความ', 'ซ้อมรันตามลำดับสอบโดยไม่หยุดแก้กลางบท แล้วจดว่าช่วงใดต้องกลับไปซ้อมแยก'],
    example: 'สายเปียโนเตรียม Bach, ท่อนเร็วจากโซนาตายุคคลาสสิก และบทจากยุคโรแมนติกหรือศตวรรษที่ 20 โดยเล่นจากความจำอย่างน้อย 2 บท',
    question: 'ตามเกณฑ์ในเอกสาร เปียโนต้องเล่นจากความจำอย่างน้อยกี่บท?', options: ['1 บท', '2 บท', '3 บท'], answer: 1,
    explanation: 'เอกสารกำหนดอย่างน้อย 2 บทจากทั้งหมด 3 บท'
  }
];
