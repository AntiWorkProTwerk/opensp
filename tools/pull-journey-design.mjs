import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
function call(code){const raw=execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code','-'],{input:code,encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});return JSON.parse(raw).result;}
if(!process.argv.includes('--index-only')){
call('await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6");return true;');
const serializer=fs.readFileSync('design/penpot/export-guide-components.js','utf8').replace("c.path==='OpenSP / Guide'","c.path==='OpenSP / Journey'");
const components=call(serializer);
fs.writeFileSync('design/penpot/journey-components.json',JSON.stringify(components,null,2)+'\n');
if(process.argv.includes('--components-only')){console.log(`Saved ${components.components.length} native journey mains.`);process.exit(0);}
}
function exportLayouts(pageName,tag,filename){
const page=call(`const p=penpot.currentFile.pages.find(p=>p.name===${JSON.stringify(pageName)});if(!p)throw Error("Missing layout page");await penpot.openPage(p);return {fileId:penpot.currentFile.id,pageId:p.id};`);
const ids=call(`return penpot.root.children.filter(s=>s.type==="board"&&s.getPluginData(${JSON.stringify(tag)})).map(s=>s.id);`);
const boards=[];
for(const id of ids)boards.push(call(`const b=penpot.currentPage.getShapeById(${JSON.stringify(id)});const visible=s=>{for(let p=s;p;p=p.parent)if(p.hidden||p.name.startsWith('Archive'))return false;return true;};return {id:b.id,name:b.name,width:b.width,height:b.height,...JSON.parse(b.getPluginData(${JSON.stringify(tag)})),linkedComponents:penpotUtils.findShapes(s=>visible(s)&&s.isComponentHead(),b).map(s=>({id:s.id,name:s.name,component:s.component()?.name,componentId:s.component()?.id,x:s.x-b.x,y:s.y-b.y,width:s.width,height:s.height})),text:penpotUtils.findShapes(s=>s.type==='text'&&visible(s),b).map(s=>({id:s.id,name:s.name,text:s.characters,x:s.x-b.x,y:s.y-b.y,width:s.width,height:s.height,font:s.fontFamily,size:s.fontSize,ink:s.textBounds}))};`));
fs.writeFileSync(filename,JSON.stringify({source:{...page,kind:'native-layout-api-export'},boards},null,2)+'\n');
console.log(`Saved ${boards.length} linked layouts from ${pageName}.`);
}
if(!process.argv.includes('--index-only'))exportLayouts('Guide series','opensp-journey','design/penpot/journey-layouts.json');
if(!process.argv.includes('--articles-only'))exportLayouts('Guide index','opensp-guide-index','design/penpot/journey-index-layouts.json');
