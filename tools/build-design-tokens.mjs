// Map exported Penpot library assets to CSS. This is not a DTCG token export.
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync(new URL('../design/penpot/production.json',import.meta.url),'utf8'));
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const declarations=[];
for(const c of data.colors)declarations.push(`--color-${slug(c.name)}:${c.color.toLowerCase()}`);
for(const t of data.typography){
  const prefix=`--type-${slug(t.name)}`;
  declarations.push(`${prefix}-family:${t.fontFamily}`,`${prefix}-size:${t.fontSize}px`,`${prefix}-weight:${t.fontWeight}`,`${prefix}-leading:${t.lineHeight}`,`${prefix}-tracking:${t.letterSpacing}px`);
}
const css=`/* Generated from design/penpot/production.json; edit Penpot assets first. */\n:root{${declarations.join(';')}}\n`;
fs.mkdirSync(new URL('../src/styles',import.meta.url),{recursive:true});
fs.writeFileSync(new URL('../src/styles/tokens.css',import.meta.url),css);
console.log(`Mapped ${data.colors.length} Penpot colors and ${data.typography.length} typography assets.`);
