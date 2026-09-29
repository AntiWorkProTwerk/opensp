import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
function call(code){const raw=execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code',code],{encoding:'utf8',maxBuffer:16*1024*1024});if(raw.includes('Tool execution failed:'))throw Error(raw);return JSON.parse(raw).result;}
call('=await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6"); return true;');
const components=call('design/penpot/export-guide-components.js');
fs.writeFileSync('design/penpot/guide-components.json',JSON.stringify(components,null,2)+'\n');
call('=await penpot.openPage("88ef66de-c84d-8075-8008-b5f39fff8489"); return true;');
const layouts=call('=return {source:{fileId:penpot.currentFile.id,pageId:penpot.currentPage.id},boards:penpot.root.children.filter(s=>s.type==="board").map(b=>({id:b.id,name:b.name,width:b.width,height:b.height,linkedComponents:penpotUtils.findShapes(s=>!s.hidden&&s.isComponentHead(),b).map(s=>({id:s.id,name:s.name,component:s.component()?.name,componentId:s.component()?.id,x:s.x-b.x,y:s.y-b.y,width:s.width,height:s.height})),text:penpotUtils.findShapes(s=>s.type==="text"&&!s.hidden,b).map(s=>({name:s.name,text:s.characters,x:s.x-b.x,y:s.y-b.y,width:s.width,height:s.height,font:s.fontFamily,size:s.fontSize}))}))};');
fs.writeFileSync('design/penpot/first-guide-layouts.json',JSON.stringify(layouts,null,2)+'\n');
console.log(`Saved ${components.components.length} guide mains and ${layouts.boards.length} layout snapshots.`);
