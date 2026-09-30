import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
import {demos} from '../src/lib/demos/index.ts';

const output='.impeccable/review/demos';
fs.mkdirSync(output,{recursive:true});
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||(process.platform==='win32'?path.join(process.env.LOCALAPPDATA,'Google/Chrome SxS/Application/chrome.exe'):undefined);
const pkg=JSON.parse(fs.readFileSync('node_modules/astro/package.json','utf8'));
const server=spawn(process.execPath,[path.join('node_modules/astro',pkg.bin.astro),'preview','--host','127.0.0.1','--port','0'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
let log='',browser;
server.stdout.on('data',chunk=>log+=chunk);server.stderr.on('data',chunk=>log+=chunk);
try{
 let origin;
 for(let i=0;i<100;i++){origin=log.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];if(origin)break;if(server.exitCode!==null)throw Error(log);await new Promise(r=>setTimeout(r,200));}
 if(!origin)throw Error('Preview did not start');
 const build=JSON.parse(fs.readFileSync('dist/build-info.json','utf8'));
 if(JSON.stringify(await(await fetch(origin+'/build-info.json')).json())!==JSON.stringify(build))throw Error('Wrong preview build');
 browser=await chromium.launch({headless:true,executablePath});
 const captures=[];
 for(const width of [1440,390])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  for(const demo of demos){
   await page.goto(`${origin}/guides/${demo.slug}/`);
   await page.getByLabel('Color theme',{exact:true}).selectOption(theme);
   await page.locator('chapter-demo[data-ready="true"]').waitFor();
   await page.evaluate(()=>document.fonts.ready);
   const file=`${demo.slug}-${width}-${theme}.png`;
   await page.locator('.chapter-demonstration').screenshot({path:`${output}/${file}`});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   captures.push({file,slug:demo.slug,width,theme,overflow});
  }
  for(const slug of ['pad-information','synth-design']){
   await page.goto(`${origin}/guides/${slug}/`);await page.getByLabel('Color theme',{exact:true}).selectOption(theme);await page.evaluate(()=>document.fonts.ready);
   const file=`page-${slug}-${width}-${theme}.png`;await page.screenshot({path:`${output}/${file}`,fullPage:true});captures.push({file,slug,width,theme,page:true});
  }
  await page.close();console.log(`${width}px ${theme} captured`);
 }
 fs.writeFileSync(`${output}/captures.json`,JSON.stringify({build,captures},null,2)+'\n');
}finally{await browser?.close();server.kill();}
