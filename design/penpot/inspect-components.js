if (penpot.currentFile?.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3') throw new Error('Open the OpenSP file first.');
return {
  version:penpot.version,
  pages:penpotUtils.getPages(),
  currentPage:penpot.currentPage?.name,
  components:penpot.library.local.components.map(c=>({id:c.id,name:c.name,path:c.path,main: c.mainInstance()?.id})),
  typographies:penpot.library.local.typographies.map(t=>({id:t.id,name:t.name,font:t.fontFamilies})),
  colors:penpot.library.local.colors.map(c=>({id:c.id,name:c.name,color:c.color})),
  fonts:['Arial','Courier New','Inter','Roboto Mono'].map(name=>{const f=penpot.fonts.findByName(name);return f?{name:f.name,id:f.id,variants:f.variants}:null}),
  homepage:penpotUtils.shapeStructure(penpotUtils.getPageByName('Homepage').root,2)
};
