import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {demos} from '../src/lib/demos/index.ts';
const call=code=>JSON.parse(execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code','-'],{input:code,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024})).result;
const mode=process.argv[2]||'inspect';
const specs=demos.map(d=>({...d,frame:undefined,act:undefined,...d.frame(d.initial,1)}));
if(mode==='inspect'){console.log(call('return {file:penpot.currentFile.id,page:penpot.currentPage.name,components:penpot.library.local.components.filter(c=>c.path?.includes("Demo")).map(c=>({id:c.id,name:c.name}))};'));}
if(mode==='create'){
 call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
 call(fs.readFileSync('design/penpot/demo-library.js','utf8'));
 for(const [i,spec] of specs.entries()){
   console.log(spec.slug,call(`return storage.demos.make(${JSON.stringify(spec)},${i});`));
   if(!process.argv.includes('--mains-only'))for(const mobile of [false,true])console.log(call(`return storage.demos.figure(${JSON.stringify(spec)},${i},${mobile});`));
 }
}
if(mode==='export'){
 call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
 const serializer=fs.readFileSync('design/penpot/export-guide-components.js','utf8').replace("c.path==='OpenSP / Guide'","c.path==='OpenSP / Demonstrations'").replace('rotation:round(s.rotation||0)','rotation:round(s.rotation||0),opacity:s.opacity');
 fs.writeFileSync('design/penpot/demo-components.json',JSON.stringify(call(serializer),null,2)+'\n');
 console.log('Exported native demonstration mains.');
}
if(mode==='export-figures'){
 call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
 const serializer=fs.readFileSync('design/penpot/export-guide-components.js','utf8').replace("c.path==='OpenSP / Guide'","c.path==='OpenSP / Demo figures'").replace('rotation:round(s.rotation||0)','rotation:round(s.rotation||0),opacity:s.opacity');
 fs.writeFileSync('design/penpot/demo-figures.json',JSON.stringify(call(serializer),null,2)+'\n');
 console.log('Exported native responsive demonstration figures.');
}
if(mode==='finish'){
 call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
 call(fs.readFileSync('design/penpot/demo-library.js','utf8'));
 call(fs.readFileSync('design/penpot/finish-demos.js','utf8'));
 for(const [slug,ids] of [['pad-information',['overlay-route','overlay-arrow','overlay-label','route-pulse']],['audio-stream',['interleave-path','execution-cursor']],['keeping-the-updater',['target-app-label']]]){
  const spec=specs.find(s=>s.slug===slug);console.log(call(`return storage.demos.repair(${JSON.stringify(spec)},${JSON.stringify(ids)});`));
 }
 const names=specs.flatMap(s=>[false,true].map(m=>'Demo figure: '+s.slug+(m?' (Mobile)':' (Desktop)')));
 for(let i=0;i<names.length;i+=4)console.log(call(`return storage.demos.finish(${JSON.stringify(names.slice(i,i+4))});`));
}
if(mode==='fit-labels'){
 call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
 call(fs.readFileSync('design/penpot/demo-library.js','utf8'));
 call(fs.readFileSync('design/penpot/finish-demos.js','utf8'));
 const fixes=[['pad-information',['current-label']],['first-animation',['memory-label']],['audio-stream',['first-name','second-name']]];
 for(const [slug,ids] of fixes){const marks=specs.find(s=>s.slug===slug).marks.filter(m=>ids.includes(m.id));console.log(call(`const lib=penpot.library.local,main=lib.components.find(c=>c.name===${JSON.stringify('Demo: '+slug)}).mainInstance(),boards=[main,...[false,true].map(m=>lib.components.find(c=>c.name===${JSON.stringify('Demo figure: '+slug)}+(m?' (Mobile)':' (Desktop)')).mainInstance().children.find(s=>s.component?.()?.name===${JSON.stringify('Demo: '+slug)}))];for(const b of boards)for(const m of ${JSON.stringify(marks)}){const t=penpotUtils.findShape(s=>s.name===m.id,b);t.resize(m.w*b.width/480,t.height);}return {slug:${JSON.stringify(slug)},boards:boards.length};`));}
 if(process.argv.includes('--mains-only'))process.exit(0);
 call('await penpot.openPage(penpot.currentFile.pages.find(p=>p.name==="Guide series"));return true;');
 for(const [slug,ids] of fixes){const marks=specs.find(s=>s.slug===slug).marks.filter(m=>ids.includes(m.id));console.log(call(`let count=0;for(const b of penpot.root.children.filter(b=>b.getPluginData('opensp-demo-migration')==='v1')){const diagram=penpotUtils.findShape(s=>s.component?.()?.name===${JSON.stringify('Demo: '+slug)},b);if(!diagram)continue;for(const m of ${JSON.stringify(marks)}){const t=penpotUtils.findShape(s=>s.name===m.id,diagram),k=diagram.width/480;t.resize(m.w*k,m.h*k);count++;}}return {slug:${JSON.stringify(slug)},labels:count};`));}
}
if(mode==='reflow'){
 call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
 call(fs.readFileSync('design/penpot/demo-library.js','utf8'));
 call(fs.readFileSync('design/penpot/reflow-demos.js','utf8'));
 // The corrected clock annotation belongs to the main, before creating page instances.
 console.log(call('const b=penpot.library.local.components.find(c=>c.name==="Demo: audio-stream").mainInstance();for(const [name,y] of [["timer-label",299],["timer-zero",212]])penpotUtils.findShape(s=>s.name===name,b).y=b.y+y;return {clockUpdated:true};'));
 for(const spec of specs)console.log(spec.slug,call(`const result=[];for(const mobile of [false,true])result.push(await storage.demos.reflow(${JSON.stringify(spec)},mobile));return result;`));
}
if(mode==='place'){
 const pages=[['Guide series','journey-layouts.json'],['First guide','first-guide-layouts.json']];
 for(const [page,file] of pages){
  call(`await penpot.openPage(penpot.currentFile.pages.find(p=>p.name===${JSON.stringify(page)}));return true;`);
  call(fs.readFileSync('design/penpot/place-demos.js','utf8'));
  const boards=JSON.parse(fs.readFileSync('design/penpot/'+file,'utf8')).boards;
  for(let i=0;i<boards.length;i+=2){
   const batch=boards.slice(i,i+2).map(b=>{
   const spec={slug:b.slug||'first-change'};
   if(spec.slug==='first-animation')spec.sectionId=JSON.parse(fs.readFileSync('src/content/journey/first-animation.json','utf8')).sections[1].id;
   return {id:b.id,spec};});
   console.log(call(`const results=[];for(const {id,spec} of ${JSON.stringify(batch)})results.push(await storage.demoPages.place(id,spec));return results;`));
  }
 }
}
