import {execFileSync} from 'node:child_process';
function stage(code){const raw=execFileSync(process.execPath,['tools/design-guide.mjs',code],{encoding:'utf8',maxBuffer:8*1024*1024});const result=JSON.parse(raw).result;console.log(code,result);return result;}
stage('load');
for(const mobile of [false,true]){stage(`cloneDark(${mobile})`);let pending;do{pending=stage('darkBatch()').remaining;}while(pending);}
