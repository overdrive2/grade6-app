const whiteSteps = [0,2,4,5,7,9,11];
let threeImport;
let closeLessonVisual;

function visualKeys(audio) {
  const start = Math.floor(Math.min(...audio)/12)*12;
  const end = Math.ceil(Math.max(...audio)/12)*12;
  const keys = [];
  let white = 0;
  for(let midi=start;midi<=end;midi++){
    const dark=!whiteSteps.includes(midi%12);
    keys.push({midi,dark,x:dark?white-.5:white++});
  }
  return {keys,width:white};
}

function visualBars(groups) {
  return groups.flatMap((length,group)=>Array.from({length},(_,offset)=>({group,accent:offset===0})));
}

function lessonVisualMarkup(id) {
  const visual=lessonVisuals[id];
  return `<section class="panel lesson-visual" aria-labelledby="lesson-visual-title">
    <h2 id="lesson-visual-title">${visual.title}</h2>
    <label class="field">เลือกตัวอย่าง<select data-visual-example>
      ${visual.examples.map((item,index)=>`<option value="${index}">${item.title}</option>`).join('')}
    </select></label>
    <p class="visual-detail" data-visual-detail></p>
    <div class="visual-stage" data-visual-stage><div class="visual-fallback"></div></div>
    <p class="visual-guide" data-visual-guide></p>
    <div class="lesson-notation" data-visual-staff hidden><canvas role="img"></canvas></div>
    <div class="visual-notes" data-visual-notes></div>
    <div class="lesson-actions visual-actions"><button type="button" class="button primary" data-visual-play>▶ เล่นตัวอย่าง</button>
    <button type="button" class="button" data-visual-stop>หยุด</button></div>
  </section>`;
}

function createLessonScene(THREE, stage, selectKey) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera();
  const items=new THREE.Group();
  scene.add(items,new THREE.HemisphereLight(0xffffff,0x6c826f,2.1));
  const light=new THREE.DirectionalLight(0xffffff,2.25);
  light.position.set(-5,9,7);
  scene.add(light);
  const canvas=renderer.domElement;
  canvas.className='visual-webgl';
  canvas.setAttribute('aria-hidden','true');
  stage.append(canvas);
  const ray=new THREE.Raycaster();
  const point=new THREE.Vector2();
  let meshes=[];
  let extent=1;
  let shouldShow=false;
  let contextLost=false;
  const disposeMeshes=()=>{
    for(const mesh of meshes){
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    items.clear();
    meshes=[];
  };
  function render(){
    if(!shouldShow) return;
    renderer.render(scene,camera);
  }
  function resize(){
    const width=stage.clientWidth;
    const height=stage.clientHeight;
    if(!width||!height) return;
    const aspect=width/height;
    const halfWidth=Math.max(extent/2+.33,2.3*aspect);
    camera.left=-halfWidth;
    camera.right=halfWidth;
    camera.top=halfWidth/aspect;
    camera.bottom=-halfWidth/aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(width,height,false);
    render();
  }
  function mesh(width,height,depth,color,x,y,z,meta){
    const geometry=new THREE.BoxGeometry(width,height,depth);
    const material=new THREE.MeshStandardMaterial({color,roughness:.65});
    const box=new THREE.Mesh(geometry,material);
    box.position.set(x,y,z);
    box.userData={...meta,color,y};
    items.add(box);
    meshes.push(box);
  }
  function draw(example){
    if(contextLost) return;
    disposeMeshes();
    if(example.audio){
      const {keys,width}=visualKeys(example.audio);
      extent=width;
      camera.position.set(0,9,6.5);
      camera.lookAt(0,0,0);
      const inExample=new Set(example.audio);
      for(const {midi,dark,x} of keys){
        const color=inExample.has(midi)?(dark?0x8db75a:0xcde99b):(dark?0x203d35:0xfcfaf0);
        mesh(dark?.55:.96,dark?.34:.28,dark?2.03:3.28,color,x-(width-1)/2,dark?.29:0,dark?-.62:0,{midi});
      }
    }else{
      const bars=visualBars(example.groups);
      extent=Math.max(5,bars.length*.63);
      camera.position.set(0,9,5);
      camera.lookAt(0,0,0);
      const colors=[0x91b8a1,0xd8e69b,0xd7a868,0xb9a6cf];
      bars.forEach(({group,accent},index)=>{
        mesh(.50,accent?.96:.46,1.7,colors[group],.63*(index-(bars.length-1)/2),0,0,{index});
      });
    }
    shouldShow=true;
    resize();
    stage.classList.add('has-webgl');
  }
  function highlight(active,bar){
    for(const part of meshes){
      const {midi,index,color,y}=part.userData;
      const lit=active.includes(midi)||index===bar;
      part.material.color.setHex(lit?0x5e9b38:color);
      part.position.y=y+(lit?(midi===undefined?.22:-.09):0);
    }
    render();
  }
  function pointer(event){
    const bounds=canvas.getBoundingClientRect();
    point.set((event.clientX-bounds.left)/bounds.width*2-1,1-(event.clientY-bounds.top)/bounds.height*2);
    ray.setFromCamera(point,camera);
    const hit=ray.intersectObjects(meshes,false)[0]?.object.userData;
    if(hit?.midi!==undefined) selectKey(hit.midi);
  }
  function lost(event){
    event.preventDefault();
    contextLost=true;
    shouldShow=false;
    stage.classList.remove('has-webgl');
  }
  canvas.addEventListener('pointerdown',pointer);
  canvas.addEventListener('webglcontextlost',lost);
  const observer=new ResizeObserver(resize);
  observer.observe(stage);
  return {
    draw,highlight,
    dispose(){
      observer.disconnect();
      canvas.removeEventListener('pointerdown',pointer);
      canvas.removeEventListener('webglcontextlost',lost);
      disposeMeshes();
      renderer.dispose();
      renderer.forceContextLoss();
      stage.classList.remove('has-webgl');
      canvas.remove();
    }
  };
}

function mountLessonVisual(id) {
  const panel=room.querySelector('.lesson-visual');
  const {examples}=lessonVisuals[id];
  const stage=panel.querySelector('[data-visual-stage]');
  const fallback=stage.querySelector('.visual-fallback');
  const notes=panel.querySelector('[data-visual-notes]');
  const staff=panel.querySelector('[data-visual-staff]');
  const selector=panel.querySelector('[data-visual-example]');
  let example;
  let view;
  let frame;
  let active=[];
  let activeBar=-1;

  function highlight(pitches=[],bar=-1,position=-1){
    active=pitches;
    activeBar=bar;
    for(const key of fallback.querySelectorAll('[data-midi]')){
      key.classList.toggle('playing',pitches.includes(Number(key.dataset.midi)));
    }
    for(const block of fallback.querySelectorAll('[data-bar]')){
      block.classList.toggle('playing',Number(block.dataset.bar)===bar);
    }
    for(const note of notes.querySelectorAll('[data-note]')){
      const index=Number(note.dataset.note);
      note.classList.toggle('playing',position===index||(position<0&&pitches.includes(example.audio[index])));
    }
    const group=bar<0?-1:visualBars(example.groups)[bar].group;
    for(const label of notes.querySelectorAll('[data-group]')){
      label.classList.toggle('playing',Number(label.dataset.group)===group);
    }
    view?.highlight(pitches,bar);
    if(example.staff) drawStaff(position);
  }
  function stopVisual(){
    cancelAnimationFrame(frame);
    stopAudio();
    highlight();
  }
  function animate(start,beat,count,update){
    const job=audioJob;
    let last=-2;
    function tick(){
      const index=Math.floor((context.currentTime-start)/beat);
      if(job!==audioJob||index>=count){
        highlight();
        return;
      }
      if(index>=0&&index!==last){
        update(index);
        last=index;
      }
      frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);
  }
  function playKey(midi,position){
    stopVisual();
    withAudio(start=>{
      playTone(midi,start,.52,.18,'triangle');
      animate(start,.55,1,()=>highlight([midi],-1,position));
    });
  }
  function play(){
    stopVisual();
    withAudio(start=>{
      if(example.audio){
        const beat=example.chord?1.05:.46;
        example.audio.forEach((pitch,index)=>{
          playTone(pitch,start+(example.chord?0:beat*index),beat-.05,example.chord?.085:.16,'triangle');
        });
        animate(start,beat,example.chord?1:example.audio.length,index=>{
          if(example.chord) highlight(example.audio);
          else highlight([example.audio[index]],-1,index);
        });
      }else{
        const bars=visualBars(example.groups);
        const beat=example.labels?.length ? .50 : .31;
        bars.forEach(({accent},index)=>playTone(accent?88:76,start+index*beat,.075,accent?.15:.09));
        animate(start,beat,bars.length,index=>highlight([],index));
      }
    });
  }
  function drawStaff(position=-1){
    const meter=example.meter;
    const degrees=example.labels.map(label=>letters.indexOf(label[0])+7*(Number(label.at(-1))-4));
    drawMusic(staff.querySelector('canvas'),{
      meter,beats:meter?Number(meter[0]):degrees.length,degrees,
      labels:example.labels,position
    });
  }
  function showExample(){
    if(example) stopVisual();
    example=examples[Number(selector.value)];
    panel.querySelector('[data-visual-detail]').textContent=example.detail;
    panel.querySelector('[data-visual-guide]').textContent=example.audio
      ? 'คีย์สีเขียวคือโน้ตในตัวอย่าง กดแป้นหรือชื่อโน้ตเพื่อฟังทีละเสียง'
      : `หนึ่งแท่งแทนหนึ่ง${example.unit} แท่งสูงคือจุดเริ่มของแต่ละกลุ่ม`;
    staff.hidden=!example.staff;
    if(example.staff) drawStaff();
    if(example.audio){
      const {keys,width}=visualKeys(example.audio);
      stage.dataset.kind='piano';
      fallback.innerHTML=`<div class="flat-piano">${keys.map(({midi,dark,x})=>`<button type="button" aria-label="${notesForMidi(midi)}" data-midi="${midi}"
       class="${dark?'black-key':'white-key'} ${example.audio.includes(midi)?'example-key':''}"
       style="--key-x:${100*(x+(dark?.20:0))/width}%;--key-w:${(dark?58:100)/width}%"></button>`).join('')}</div>`;
      notes.innerHTML=example.labels.map((label,index)=>{
        const delta=Math.abs(example.audio[index+1]-example.audio[index]);
        const step=id==='scale'&&delta?`<span class="visual-step">${delta===1?'ครึ่ง':delta===2?'เต็ม':'เต็มครึ่ง'}</span>`:'';
        return `<button type="button" class="visual-note" data-note="${index}">${label}</button>${step}`;
      }).join('');
      for(const button of fallback.querySelectorAll('[data-midi]')) button.onclick=()=>playKey(Number(button.dataset.midi));
      for(const button of notes.querySelectorAll('[data-note]')){
        const index=Number(button.dataset.note);
        button.onclick=()=>playKey(example.audio[index],index);
      }
    }else{
      stage.dataset.kind='bars';
      fallback.innerHTML=`<div class="flat-bars">${visualBars(example.groups).map(({group,accent},index)=>
        `<span data-bar="${index}" data-group="${group}" class="${accent?'accent':''}"></span>`).join('')}</div>`;
      notes.innerHTML=example.groups.map((length,index)=>
        `<span class="visual-note" data-group="${index}">${example.labels?.[index]?example.labels[index]+' · ':''}${length} ${example.unit}</span>`).join('');
    }
    view?.draw(example);
  }
  function notesForMidi(midi){
    return windowNoteNames[midi%12]+(Math.floor(midi/12)-1);
  }
  const windowNoteNames=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  selector.onchange=showExample;
  panel.querySelector('[data-visual-play]').onclick=play;
  panel.querySelector('[data-visual-stop]').onclick=stopVisual;
  showExample();
  threeImport??=import('./vendor/three/three.module.min.js').catch(()=>null);
  threeImport.then(THREE=>{
    if(!THREE||!panel.isConnected) return;
    try{
      view=createLessonScene(THREE,stage,playKey);
      view.draw(example);
      view.highlight(active,activeBar);
    }catch{
      view?.dispose();
      view=undefined;
    }
  });
  closeLessonVisual=()=>{
    cancelAnimationFrame(frame);
    view?.dispose();
  };
}
