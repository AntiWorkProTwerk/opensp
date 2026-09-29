// Explicit, read-only design pull. Credentials remain in the existing local MCP client.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function call(argument){
  const raw=execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code',argument],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
  if(raw.includes('Tool execution failed:'))throw Error(raw.trim());
  const result=JSON.parse(raw);
  if(!('result' in result))throw Error('Unexpected Penpot response');
  return result.result;
}
call('=await penpot.openPage("e630c86e-d742-80d8-8008-b565a285cdc0"); return true;');
const data=call('design/penpot/export-production.js');
if(data.components.length!==12||data.source.fileId!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('Unexpected component library');
const out=path.join(root,'design/penpot/production.json');
fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');
call('=await penpot.openPage("65e71e3a-a290-8019-8008-b52b1fb87f69"); return true;');
const home=call('design/penpot/export-homepage.js');
fs.writeFileSync(path.join(root,'design/penpot/homepage.json'),JSON.stringify(home,null,2)+'\n');
fs.writeFileSync(path.join(root,'design/studies/home-copy.json'),JSON.stringify(home.copy,null,2)+'\n');
console.log(`Saved ${data.components.length} native SP definitions, ${data.colors.length} colors and ${data.typography.length} type styles. Review the diff before building.`);
