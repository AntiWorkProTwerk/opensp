import {execFileSync} from 'node:child_process';
function call(code){const raw=execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code',code],{encoding:'utf8',maxBuffer:8*1024*1024});if(raw.includes('Tool execution failed:'))throw Error(raw);return JSON.parse(raw).result;}
function step(code){const result=call('=return await storage.guide.'+code+';');console.log(code,result);return result;}
call('=await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6"); return true;');step('reviewMain()');
call('=await penpot.openPage("88ef66de-c84d-8075-8008-b5f39fff8489"); return true;');
for(const mobile of [false,true]){step(`reviewLight(${mobile})`);for(let i=0;i<7;i++)step(`placeSection(${i})`);step('finish()');}
step('removeStaleDark()');
for(const mobile of [false,true]){step(`cloneDark(${mobile})`);let remaining;do{remaining=step('darkBatch()').remaining;}while(remaining);}
