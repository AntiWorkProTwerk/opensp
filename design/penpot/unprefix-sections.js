// Run on Design system first, then Homepage. Change text only; retain all styles.
if(penpot.currentFile?.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3')throw Error('OpenSP only');
const page=penpot.currentPage;
const roots=page.name==='Design system'
 ? penpot.library.local.components.filter(c=>['Section label','Section header'].includes(c.name)).map(c=>c.mainInstance())
 : page.name==='Homepage'
 ? page.root.children.filter(b=>!b.hidden&&b.name.startsWith('Homepage /')).flatMap(b=>b.children.filter(s=>['Releases header','Guides header'].includes(s.name)))
 : [];
if(!roots.length)throw Error('Open Design system or Homepage');
const style=s=>JSON.stringify([s.fontId,s.fontFamily,s.fontSize,s.fontWeight,s.fontStyle,s.lineHeight,s.letterSpacing,s.align,s.fills,s.x,s.y,s.width,s.height]);
return roots.map(root=>{
 const label=penpotUtils.findShape(s=>s.type==='text'&&s.name==='Label',root);
 if(!label)throw Error('Missing label in '+root.name);
 const before=style(label),old=label.characters;
 const value=old.replace(/^0[12]\s*\/\s*/, '');
 if(!['RELEASES','GUIDES'].includes(value))throw Error('Unexpected label '+old);
 if(value!==old)label.characters=value;
 if(style(label)!==before)throw Error('Style changed in '+root.name);
 return {root:root.name,text:label.characters,font:label.fontFamily,size:label.fontSize,unchangedStyle:true};
});
