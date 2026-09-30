import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const chapters=fs.readdirSync('src/content/journey').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('src/content/journey/'+f,'utf8'))).sort((a,b)=>a.order-b.order);
const firstIndexDescription=fs.readFileSync('src/content/guides/first-change.mdx','utf8').match(/^description: (.+)$/m)?.[1]?.trim();
if(!firstIndexDescription)throw Error('Expected the first guide inline metadata description');
const firstIndex={...JSON.parse(fs.readFileSync('src/content/first-change.json','utf8')),description:firstIndexDescription};
function call(code){const raw=execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code','-'],{input:code,encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});return JSON.parse(raw).result;}
function alignIndex(){
 console.log(call(fs.readFileSync('design/penpot/align-mobile-guide-index.js','utf8').replace('__FIRST_INDEX_DESCRIPTION__',JSON.stringify(firstIndexDescription))));
 // Penpot can retain stale line wrapping after a component's text is resized.
 // Separate requests let its text engine settle before restoring exact widths.
 console.log(call(`if(penpot.currentPage.name!=='Guide index')throw Error('Open Guide index');storage.indexTextRefresh=[];for(const b of penpot.root.children.filter(s=>s.type==='board'&&s.getPluginData('opensp-guide-index'))){for(const t of penpotUtils.findShapes(s=>s.type==='text'&&!s.hidden&&Number(s.fontSize)>=11,b)){storage.indexTextRefresh.push({id:t.id,width:t.width});t.resize(t.width+1,t.height);}}return {refreshing:storage.indexTextRefresh.length};`));
 console.log(call(`for(const item of storage.indexTextRefresh){const t=penpot.currentPage.getShapeById(item.id);t.resize(item.width,t.height);}return {restored:storage.indexTextRefresh.length};`));
}
function step(expression){const result=call(`return await storage.journey.${expression};`);console.log(expression,JSON.stringify(result));return result;}
const [command,slug]=process.argv.slice(2);
if(command==='load'){
 console.log(call(fs.readFileSync('design/penpot/journey-guides.js','utf8').replace('__CHAPTERS__','[]')));
 for(const a of chapters)console.log(call('storage.journey.chapters.push('+JSON.stringify(a)+');return {loaded:storage.journey.chapters.length};'));
 console.log(call('storage.journey.indexCopy='+fs.readFileSync('src/content/guide-index.json','utf8')+';storage.journey.first='+JSON.stringify(firstIndex)+';return {indexCopy:true};'));
}
else if(command==='helpers'){
 console.log(call(fs.readFileSync('design/penpot/journey-guides.js','utf8').replace('__CHAPTERS__','storage.journey.chapters')));
 console.log(call('storage.journey.indexCopy='+fs.readFileSync('src/content/guide-index.json','utf8')+';storage.journey.first='+JSON.stringify(firstIndex)+';return {indexCopy:true};'));
}
else if(command==='prepare'){
 console.log(call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f39fff8489");return {requested:"First guide"};'));
 step('captureMobile()');
 console.log(call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return {requested:"Guide components"};'));
 step('prepare()');
}
else if(command==='chapter'||command==='mobile'){
 const a=chapters.find(a=>a.slug===slug);if(!a)throw Error('Unknown chapter');step('open()');
 for(const mobile of command==='mobile'?[true]:[false,true]){step(`begin(${JSON.stringify(slug)},${mobile})`);for(let i=0;i<a.sections.length;i++)step(`section(${i})`);step('finish()');step('dark()');while(step('darkBatch()').remaining){};}
}else if(command==='resume-sections'){
 const a=chapters.find(a=>a.slug===slug);if(!a)throw Error('Unknown chapter');
 const state=call('const j=storage.journey;return {page:penpot.currentPage.name,slug:j.article?.slug,y:j.y,ready:j.active?.children.some(s=>s.name==="Sequence disclosure"),started:j.active?.children.some(s=>s.name.startsWith("Section heading /"))};');
 if(state.page!=='Guide series'||state.slug!==slug||!state.ready||state.started||!Number.isFinite(state.y))throw Error('Inspect partial layout before resuming sections');
 for(let i=0;i<a.sections.length;i++)step(`section(${i})`);step('finish()');step('dark()');while(step('darkBatch()').remaining){};
}else if(command==='index'){
 step('openIndex()');for(const mobile of [false,true]){step(`indexLayout(${mobile})`);step('indexDark()');while(step('darkBatch()').remaining){};}
 alignIndex();
}else if(command==='align-index')alignIndex();
else step(command);
