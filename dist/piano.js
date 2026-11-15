const pianoBuffers = new Map();
const pianoRequests = new Map();
const pianoSampleNames = ['C','Ds','Fs','A'];

function pianoSampleFor(midi) {
  return Math.max(36,Math.min(84,Math.round(midi/3)*3));
}

function pianoSampleFile(midi) {
  const name = pianoSampleNames[(midi%12)/3];
  const octave = Math.floor(midi/12)-1;
  return `audio/grand-piano/${name}${octave}.mp3`;
}

function loadPianoSample(context, midi) {
  if(pianoBuffers.has(midi)) return Promise.resolve();
  if(!pianoRequests.has(midi)){
    const request = (async()=>{
      const response=await fetch(pianoSampleFile(midi),{signal:AbortSignal.timeout(8000)});
      if(!response.ok) throw new Error('Piano sample unavailable');
      const buffer=await context.decodeAudioData(await response.arrayBuffer());
      pianoBuffers.set(midi,buffer);
    })().catch(()=>{}).finally(()=>pianoRequests.delete(midi));
    pianoRequests.set(midi,request);
  }
  return pianoRequests.get(midi);
}

function pianoNeeded(pitches) {
  return [...new Set(pitches.map(pianoSampleFor))].filter(midi=>!pianoBuffers.has(midi));
}

function createPianoVoice(context,midi,start,duration,volume) {
  const sample=pianoSampleFor(midi);
  const buffer=pianoBuffers.get(sample);
  if(!buffer) return;
  const source=context.createBufferSource();
  const envelope=context.createGain();
  const end=start+duration+.25;
  source.buffer=buffer;
  source.playbackRate.value=2**((midi-sample)/12);
  envelope.gain.setValueAtTime(0,start);
  envelope.gain.linearRampToValueAtTime(Math.min(.62,volume*3.35),start+.008);
  envelope.gain.setTargetAtTime(.0001,start+duration,.055);
  return {source,envelope,end};
}
