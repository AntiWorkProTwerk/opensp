import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),dist=new URL('../dist/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,dist));
const hash=data=>createHash('sha256').update(data).digest('hex');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const built=files(fileURLToPath(dist)),home=read('index.html').toString();
const htmlFiles=built.filter(p=>p.endsWith('.html'));
if(!home.includes('OpenSP')||!home.includes('<sp-display')||home.includes('<astro-island'))throw Error('Homepage must be static HTML with the progressive screen player');
for(const page of htmlFiles)if(/design\.penpot\.app|[Cc]:[\\/]Users|penpot-mcp|localhost|\.penpot|Direction contract|impeccable:product-schema/.test(fs.readFileSync(page,'utf8')))throw Error('Private/design-only reference in output '+path.relative(fileURLToPath(dist),page));
const publicLesson=fileURLToPath(new URL('examples/menu-title-check.py',dist));
if(built.some(p=>p!==publicLesson&&(/\.(penpot|py|env)$/.test(p)||p.endsWith('.xml')&&!path.basename(p).startsWith('sitemap'))))throw Error('Unexpected source material in deployment');
const scripts=built.filter(p=>p.endsWith('.js'));
// Conservative budget: all generated JS plus the largest page's inline scripts.
const pageReports=htmlFiles.map(p=>{const html=fs.readFileSync(p,'utf8');const inline=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);return {path:path.relative(fileURLToPath(dist),p).replaceAll('\\','/'),sha256:hash(html),gzipBytes:gzipSync(html).length,inlineJavascriptGzipBytes:inline.reduce((sum,s)=>sum+gzipSync(s).length,0)};});
const javascriptGzipBytes=scripts.reduce((sum,p)=>sum+gzipSync(fs.readFileSync(p)).length,0)+Math.max(...pageReports.map(p=>p.inlineJavascriptGzipBytes));
if(javascriptGzipBytes>15*1024)throw Error(`JavaScript budget exceeded: ${javascriptGzipBytes} bytes gzip`);
for(const match of home.matchAll(/(?:src|href)="(\/_astro\/[^"#?]+)"/g))if(!fs.existsSync(new URL('.'+match[1],dist)))throw Error('Missing built asset '+match[1]);
const packageData=JSON.parse(fs.readFileSync(new URL('package.json',root),'utf8'));
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),astro:packageData.dependencies.astro,homepageSha256:hash(home),penpotSnapshotSha256:hash(fs.readFileSync(new URL('design/penpot/production.json',root))),guideDesignSha256:hash(fs.readFileSync(new URL('design/penpot/guide-components.json',root))),javascriptGzipBytes,homepageGzipBytes:gzipSync(home).length,pages:pageReports};
fs.writeFileSync(new URL('build-info.json',dist),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
