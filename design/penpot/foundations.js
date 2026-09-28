if (penpot.currentFile?.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3') throw new Error('OpenSP only');
if (penpotUtils.getPageByName('Design system')) throw new Error('Foundations already started; inspect before rerunning.');
const page=penpot.createPage(); page.name='Design system'; penpot.openPage(page);
storage.ds={pageId:page.id, colors:{}, type:{}, components:{}};
const lib=penpot.library.local;
for(const [name,value] of Object.entries({Paper:'#FFFFFF',Ink:'#111111',Muted:'#555555',Line:'#888888',Surface:'#F2F2F2','Dark paper':'#151617','Dark ink':'#EEF0EC','Dark muted':'#B6B9B5','Dark line':'#636763','Dark surface':'#242628'})){
  const c=lib.createColor(); c.name=name; c.path='OpenSP'; c.color=value; storage.ds.colors[name]=c;
}
const specs={Hero:[76,1.12], 'Hero mobile':[48,1.12], Heading:[36,1.2], 'Heading mobile':[28,1.25], Intro:[23,1.55], Body:[20,1.6], 'Body mobile':[18,1.6], Navigation:[18,1.3], Caption:[16,1.5], 'Caption mobile':[15,1.5], Label:[13,1.6,'Courier New'], Micro:[7,1.2], 'Pad number':[10,1.2], 'Display text':[13,1.2,'Courier New'], Brand:[27,1.2,'Arial','700']};
for(const [name,[size,leading,family='Arial',weight='400']] of Object.entries(specs)){
 const t=lib.createTypography(); t.name=name; t.path='OpenSP'; t.fontId=family==='Arial'?'arial':'courier-new'; t.fontFamilies=family; t.fontSize=String(size); t.fontWeight=weight; t.fontStyle='normal'; t.fontVariantId=weight==='700'?'bold':'regular'; t.lineHeight=String(leading); t.letterSpacing='0'; storage.ds.type[name]=t;
}
return {page:page.id,colors:11,typographies:Object.keys(specs)};
