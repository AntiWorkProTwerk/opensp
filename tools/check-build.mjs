import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {assertPublicText,checkJourney,journeySlugs} from './check-journey.mjs';
const root=new URL('../',import.meta.url),dist=new URL('../dist/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,dist));
const hash=data=>createHash('sha256').update(data).digest('hex');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const built=files(fileURLToPath(dist)),home=read('index.html').toString();
const htmlFiles=built.filter(p=>p.endsWith('.html'));
const journeyChapters=checkJourney();
if(!home.includes('OpenSP')||!home.includes('<sp-display')||home.includes('<astro-island'))throw Error('Homepage must be static HTML with the progressive screen player');
for(const page of htmlFiles)if(/design\.penpot\.app|[Cc]:[\\/]Users|penpot-mcp|localhost|\.penpot|Direction contract|impeccable:product-schema/.test(fs.readFileSync(page,'utf8')))throw Error('Private/design-only reference in output '+path.relative(fileURLToPath(dist),page));
const publicLessons=new Set(['menu-title-check',...journeySlugs].map(slug=>fileURLToPath(new URL(`examples/${slug}.py`,dist))));
const privateArtifact=/\.(?:penpot|py|env|ts|tsx|astro|mdx?|c|h|cpp|elf|bin|hex|uf2|map|zip|tar|tgz|pem|key|sqlite|pcap)$/i;
if(built.some(p=>!publicLessons.has(p)&&(privateArtifact.test(p)||/(?:^|[\\/])\.env(?:\.|$)/i.test(p)||p.endsWith('.xml')&&!path.basename(p).startsWith('sitemap'))))throw Error('Unexpected source material in deployment');
for(const p of built.filter(p=>/\.(?:html|json|py|js|css|svg)$/.test(p)))assertPublicText(fs.readFileSync(p,'utf8'),path.relative(fileURLToPath(dist),p));
const scripts=built.filter(p=>p.endsWith('.js'));
// Keep the 15 KiB ceiling for each complete page, including its selected lazy
// demonstration. Report the whole-site total separately; readers do not load
// unrelated chapters' models. Conservatively charge the largest model group.
function staticGraph(file,seen=new Set()){
 if(seen.has(file))return seen;
 if(!fs.existsSync(file))throw Error('Missing script dependency '+file);
 seen.add(file);
 for(const match of fs.readFileSync(file,'utf8').matchAll(/\b(?:import|export)\s*(?:[^\("';]*?\sfrom\s*)?["']([^"']+\.js)["']/g)){
   const child=match[1].startsWith('/')?path.join(fileURLToPath(dist),match[1]):path.resolve(path.dirname(file),match[1]);staticGraph(child,seen);
 }
 return seen;
}
const gzipScripts=files=>[...files].reduce((sum,p)=>sum+gzipSync(fs.readFileSync(p)).length,0);
const modelGroups=scripts.filter(p=>/[/\\](?:early|systems|audio)\.[^/\\]+\.js$/.test(p));
if(modelGroups.length!==3)throw Error('Expected three separate demonstration model groups');
const pageReports=htmlFiles.map(p=>{
 const html=fs.readFileSync(p,'utf8'),seen=new Set();
 const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
 for(const m of html.matchAll(/<script\b[^>]*\bsrc="(\/_astro\/[^"#?]+\.js)"/g))staticGraph(path.join(fileURLToPath(dist),m[1]),seen);
 const inlineJavascriptGzipBytes=inline.reduce((sum,s)=>sum+gzipSync(s).length,0);
 const initialJavascriptGzipBytes=gzipScripts(seen)+inlineJavascriptGzipBytes;
 const activeJavascriptGzipBytes=html.includes('<chapter-demo')?Math.max(...modelGroups.map(group=>gzipScripts(staticGraph(group,new Set(seen)))+inlineJavascriptGzipBytes)):initialJavascriptGzipBytes;
 return {path:path.relative(fileURLToPath(dist),p).replaceAll('\\','/'),sha256:hash(html),gzipBytes:gzipSync(html).length,inlineJavascriptGzipBytes,initialJavascriptGzipBytes,activeJavascriptGzipBytes};
});
const javascriptGzipBytes=Math.max(...pageReports.map(page=>page.activeJavascriptGzipBytes));
const totalJavascriptGzipBytes=gzipScripts(scripts)+Math.max(...pageReports.map(page=>page.inlineJavascriptGzipBytes));
if(javascriptGzipBytes>15*1024)throw Error(`JavaScript budget exceeded: ${javascriptGzipBytes} bytes gzip`);
for(const page of htmlFiles)for(const match of fs.readFileSync(page,'utf8').matchAll(/(?:src|href)="(\/_astro\/[^"#?]+)"/g))if(!fs.existsSync(new URL('.'+match[1],dist)))throw Error('Missing built asset '+match[1]);
const packageData=JSON.parse(fs.readFileSync(new URL('package.json',root),'utf8'));
const journeyDesign=new URL('design/penpot/journey-components.json',root);
const journeyLayouts=new URL('design/penpot/journey-layouts.json',root);
const journeyIndexLayouts=new URL('design/penpot/journey-index-layouts.json',root);
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),astro:packageData.dependencies.astro,homepageSha256:hash(home),penpotSnapshotSha256:hash(fs.readFileSync(new URL('design/penpot/production.json',root))),guideDesignSha256:hash(fs.readFileSync(new URL('design/penpot/guide-components.json',root))),journeyContentSha256:hash(JSON.stringify(journeyChapters)),journeyDesignSha256:fs.existsSync(journeyDesign)?hash(fs.readFileSync(journeyDesign)):null,journeyLayoutsSha256:fs.existsSync(journeyLayouts)?hash(fs.readFileSync(journeyLayouts)):null,javascriptGzipBytes,homepageGzipBytes:gzipSync(home).length,pages:pageReports};
report.journeyIndexLayoutsSha256=fs.existsSync(journeyIndexLayouts)?hash(fs.readFileSync(journeyIndexLayouts)):null;
report.totalJavascriptGzipBytes=totalJavascriptGzipBytes;
report.scriptBudgetScope='maximum per-page static imports plus the largest single lazy demonstration group and inline scripts';
report.demoDesignSha256=hash(fs.readFileSync(new URL('design/penpot/demo-components.json',root)));
fs.writeFileSync(new URL('build-info.json',dist),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
