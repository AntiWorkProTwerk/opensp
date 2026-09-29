import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const layouts=JSON.parse(fs.readFileSync('design/penpot/first-guide-layouts.json','utf8'));
fs.mkdirSync('design/exports/first-guide',{recursive:true});
for(const board of layouts.boards){
 const name=board.name.split(' / ').slice(1).join('-').toLowerCase();
 const target=`design/exports/first-guide/${name}.png`;
 execFileSync(process.execPath,['tools/penpot-call.mjs','export_shape',JSON.stringify({shapeId:board.id,format:'png'}),'--out',target],{stdio:'inherit'});
 if(!fs.existsSync(target))throw Error('No exported image: '+target);
}
