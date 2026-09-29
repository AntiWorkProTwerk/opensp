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
if(!home.includes('OpenSP')||!home.includes('<sp-display')||home.includes('<astro-island'))throw Error('Homepage must be static HTML with the progressive screen player');
if(/design\.penpot\.app|C:\\Users|penpot-mcp|localhost|\.penpot/.test(home))throw Error('Private/design-only reference in output');
if(built.some(p=>/\.(penpot|py|env)$/.test(p)||p.endsWith('.xml')&&!path.basename(p).startsWith('sitemap')))throw Error('Unexpected source material in deployment');
const scripts=built.filter(p=>p.endsWith('.js'));
const inline=[...home.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
// Conservative first-launch budget: all generated JS plus inline homepage JS.
const javascriptGzipBytes=scripts.reduce((sum,p)=>sum+gzipSync(fs.readFileSync(p)).length,0)+inline.reduce((sum,s)=>sum+gzipSync(s).length,0);
if(javascriptGzipBytes>15*1024)throw Error(`JavaScript budget exceeded: ${javascriptGzipBytes} bytes gzip`);
for(const match of home.matchAll(/(?:src|href)="(\/_astro\/[^"#?]+)"/g))if(!fs.existsSync(new URL('.'+match[1],dist)))throw Error('Missing built asset '+match[1]);
const packageData=JSON.parse(fs.readFileSync(new URL('package.json',root),'utf8'));
const report={commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),astro:packageData.dependencies.astro,homepageSha256:hash(home),penpotSnapshotSha256:hash(fs.readFileSync(new URL('design/penpot/production.json',root))),javascriptGzipBytes,homepageGzipBytes:gzipSync(home).length};
fs.writeFileSync(new URL('build-info.json',dist),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
