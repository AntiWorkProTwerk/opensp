// Read-only native component/asset snapshot. Run on SP components.
if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3'||penpot.currentPage.name!=='SP components')throw Error('Open the OpenSP SP components page');
const round=n=>Math.round(Number(n)*1000000)/1000000;
function shape(s,parent){
  if(s.hidden)return null;
  const n={id:s.id,name:s.name,type:s.type,x:round(s.x-(parent?.x||0)),y:round(s.y-(parent?.y||0)),width:round(s.width),height:round(s.height),rotation:round(s.rotation||0)};
  if(s.isComponentHead()){n.componentId=s.component()?.id;n.componentName=s.component()?.name;}
  if(s.fills?.length)n.fills=s.fills.map(f=>({color:f.fillColor,opacity:f.fillOpacity??1,ref:f.fillColorRefId}));
  if(s.strokes?.length)n.strokes=s.strokes.map(f=>({color:f.strokeColor,width:f.strokeWidth,opacity:f.strokeOpacity??1,ref:f.strokeColorRefId}));
  if(s.type==='path'){n.d=s.toD();n.pathOrigin=[round(s.x),round(s.y)];}
  if(s.type==='text')Object.assign(n,{text:s.characters,fontFamily:s.fontFamily,fontSize:Number(s.fontSize),fontWeight:s.fontWeight,lineHeight:Number(s.lineHeight),letterSpacing:Number(s.letterSpacing)||0,align:s.align});
  if(s.children)n.children=s.children.map(c=>shape(c,s)).filter(Boolean);
  return n;
}
const components=penpot.library.local.components.filter(c=>c.path==='SP'||c.name==='AntiWorkProTwerk R3').map(c=>{
  const main=c.mainInstance();return {id:c.id,name:c.name,path:c.path,mainId:main.id,shape:{...shape(main,null),x:0,y:0}};
});
return {
  source:{fileId:penpot.currentFile.id,pageId:penpot.currentPage.id,kind:'native-component-api-export'},
  components,
  colors:penpot.library.local.colors.map(c=>({id:c.id,name:c.name,path:c.path,color:c.color,opacity:c.opacity})),
  typography:penpot.library.local.typographies.map(t=>({id:t.id,name:t.name,fontFamily:t.fontFamily,fontSize:t.fontSize,fontWeight:t.fontWeight,lineHeight:t.lineHeight,letterSpacing:t.letterSpacing}))
};
