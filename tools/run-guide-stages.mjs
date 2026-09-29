import {execFileSync} from 'node:child_process';
function stage(code){const raw=execFileSync(process.execPath,['tools/design-guide.mjs',code],{encoding:'utf8',maxBuffer:8*1024*1024});console.log(raw);return JSON.parse(raw).result;}
const [mobile,dark]=process.argv.slice(2).map(x=>x==='true');
stage(`layout(${mobile},${dark})`);
if(mobile){let pending;do{pending=stage('scaleBatch()').remaining;}while(pending);}
for(let i=0;i<7;i++)stage(`placeSection(${i})`);
stage('finish()');
if(dark){let pending;do{pending=stage('darkBatch()').remaining;}while(pending);}
