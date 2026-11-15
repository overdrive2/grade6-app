import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8','.mp3':'audio/mpeg'};
const assets = {};
function collect(directory, url='') {
  for(const entry of readdirSync(directory,{withFileTypes:true})){
    if(entry.name.startsWith('.') || entry.name==='server') continue;
    const path=join(directory,entry.name);
    const route=url+'/'+entry.name;
    if(entry.isDirectory()){
      collect(path,route);
      continue;
    }
    const type=types[extname(entry.name)] || (entry.name==='LICENSE'?'text/plain; charset=utf-8':undefined);
    if(!type) continue;
    const binary=type==='audio/mpeg';
    assets[route]={type,binary,body:readFileSync(path,binary?'base64':'utf8')};
  }
}
collect('dist');
mkdirSync('dist/server',{recursive:true});
writeFileSync('dist/server/index.js','const assets = '+JSON.stringify(assets)+';\n'+readFileSync('worker.mjs','utf8'));
