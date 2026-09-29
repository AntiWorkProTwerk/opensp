import {execFileSync} from 'node:child_process';
function call(code){const raw=execFileSync(process.execPath,['tools/penpot-call.mjs','execute_code',code],{encoding:'utf8',maxBuffer:8*1024*1024});if(raw.includes('Tool execution failed:'))throw Error(raw);return JSON.parse(raw).result;}
function step(code){const result=call('=return await storage.guide.'+code+';');console.log(code,result);return result;}
const mode=process.argv[2];
if(mode==='mains'){
 call('=await penpot.openPage("88ef66de-c84d-8075-8008-b5f253b82bd6"); return true;');
 for(const kind of ['intro','memory','code','comparison','verification','result','hero','evidence']){
  const result=step(`upgrade('${kind}')`);
  if(result.scaleRemaining){let remaining;do{remaining=step('scaleBatch()').remaining;}while(remaining);}
 }
}else{
 call('=await penpot.openPage("88ef66de-c84d-8075-8008-b5f39fff8489"); return true;');
 for(const mobile of [false,true])for(const dark of [false,true]){
  step(`resume('First change / ${mobile?'Mobile':'Desktop'} / ${dark?'Dark':'Light'}',0)`);
  step('updateHero()');
  for(let i=0;i<7;i++)step(`placeSection(${i})`);
  step('finish()');
  if(dark){let remaining;do{remaining=step('darkBatch()').remaining;}while(remaining);}
 }
}
