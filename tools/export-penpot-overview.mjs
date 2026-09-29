// Read-only exports of every visible top-level shape. No canvas mutations.
import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const output=path.resolve(process.argv[2]||'design/exports/penpot-overview');
fs.mkdirSync(path.join(output,'assets'),{recursive:true});
const client=path.resolve('tools/penpot-call.mjs');
async function call(args){
 const r=await run(process.execPath,[client,...args],{maxBuffer:64*1024*1024,timeout:180000,windowsHide:true});
 if(r.stderr)process.stderr.write(r.stderr);
 if(r.stdout.startsWith('Tool execution failed:'))throw Error(r.stdout);
 return r.stdout;
}
const code=`if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('Wrong file');
return {fileId:penpot.currentFile.id,pages:penpot.currentFile.pages.map(p=>({id:p.id,name:p.name,shapes:p.root.children.filter(s=>!s.hidden).map(s=>({id:s.id,name:s.name,type:s.type,x:s.x,y:s.y,width:s.width,height:s.height}))}))};`;
const manifest=JSON.parse(await call(['execute_code','='+code])).result;
manifest.exportedAt=new Date().toISOString();
for(const p of manifest.pages)for(const s of p.shapes)s.asset='assets/'+s.id+'.svg';
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const jobs=manifest.pages.flatMap(p=>p.shapes.map(s=>({p,s})));
let next=0,done=0;
async function worker(){
 while(next<jobs.length){
  const {p,s}=jobs[next++],file=path.join(output,s.asset);
  if(!fs.existsSync(file)||!fs.readFileSync(file,'utf8').trimStart().startsWith('<svg')){
   await call(['export_shape',JSON.stringify({shapeId:s.id,format:'svg'}),'--out',file]);
   if(!fs.existsSync(file))throw Error('Missing export: '+s.name);
  }
  console.log(`${++done}/${jobs.length}: ${p.name} / ${s.name}`);
 }
}
// Two export requests at a time keep the hosted renderer's queue bounded.
await Promise.all([worker(),worker()]);
console.log('Exported '+manifest.pages.length+' pages to '+output);
