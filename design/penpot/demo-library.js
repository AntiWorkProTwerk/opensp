if(penpot.currentFile.id!=='24d9d841-759d-81bc-8008-b518bc70d8b3'||penpot.currentPage.name!=='Guide components')throw Error('Open Guide components');
const lib=penpot.library.local;
const d=storage.demos={colors:Object.fromEntries(lib.colors.map(c=>[c.name,c])),types:Object.fromEntries(lib.typographies.map(t=>[t.name,t]))};
d.put=(s,p,x,y,w,h)=>{if(s.parent?.id!==p.id)p.appendChild(s);if(w!==undefined)s.resize(Math.max(.01,w),Math.max(.01,h));s.x=p.x+x;s.y=p.y+y;return s;};
d.board=(name,x,y,w,h)=>{const b=penpot.createBoard();b.name=name;b.x=x;b.y=y;b.resize(w,h);b.fills=[];return b;};
d.text=(p,name,value,x,y,w,size=20)=>{const s=penpot.createText(value||' ');s.name=name;s.applyTypography(d.types.Body);s.fontSize=String(size);s.lineHeight='1.5';s.growType='fixed';s.fills=[d.colors.Ink.asFill()];return d.put(s,p,x,y,w,Math.ceil((value.length*size*.52/w)+1)*size*1.5);};
d.timeline=(b,t,y,w)=>{d.put(t,b,0,y);t.resize(w,44);for(const [name,x,yy,ww,hh] of [['Timeline line',56,21.5,w-162,1],['Seek handle',w-112,16,12,12],['Playback time',w-88,14,88,22]]){const s=penpotUtils.findShape(s=>s.name===name,t);if(s)d.put(s,t,x,yy,ww,hh);}return t;};
d.make=async(spec,index)=>{
 const name='Demo: '+spec.slug;
 const existing=lib.components.find(c=>c.name===name);if(existing)return {id:existing.id,existed:true};
 if(penpot.root.children.some(s=>s.name===name))throw Error('Inspect partial main '+name);
 const b=d.board(name,11000+(index%4)*560,Math.floor(index/4)*410,480,320);
 for(const [index,m] of spec.marks.entries()){
   let s;if(m.type==='text'){s=penpot.createText(m.text||' ');s.applyTypography(d.types.Code);s.fontSize=String(m.size||20);s.lineHeight='1.5';s.growType='fixed';}
   else if(m.type==='path'){s=penpot.createPath();s.d=m.d;}
   else s=m.type==='ellipse'?penpot.createEllipse():penpot.createRectangle();
   s.name=m.id;s.fills=m.fill?[d.colors[m.fill].asFill()]:[];s.strokes=m.stroke?[{...d.colors[m.stroke].asStroke(),strokeWidth:1.5,strokeAlignment:'center',strokeStyle:'solid'}]:[];s.opacity=m.opacity??1;
   if(m.type==='path'){const x=s.x,y=s.y;d.put(s,b,x+m.x,y+m.y);}else d.put(s,b,m.x,m.y,m.w,m.h);
   if(index%6===0)await new Promise(r=>setTimeout(r,25));
 }
 b.setPluginData('opensp-demo',spec.slug);
 const c=lib.createComponent([b]);c.name=name;c.path='OpenSP / Demonstrations';return {id:c.id,mainId:b.id};
};
d.figure=async(spec,index,mobile)=>{
 const name='Demo figure: '+spec.slug+(mobile?' (Mobile)':' (Desktop)');
 const existing=lib.components.find(c=>c.name===name);if(existing){const b=existing.mainInstance(),t=penpotUtils.findShape(s=>s.component?.()?.name==='Animation timeline',b);if(t)d.timeline(b,t,t.y-b.y,b.width);return {id:existing.id,existed:true};}
 const w=mobile?342:992,b=d.board(name,14000+(mobile?1100:0),index*1350,w,1200);
 let t=d.text(b,'Demo title',spec.title,0,0,w,mobile?28:32),y=t.height+12;
 t=d.text(b,'Demo prompt',spec.prompt,0,y,w,mobile?16:18);y+=t.height+24;
 const diagram=lib.components.find(c=>c.name==='Demo: '+spec.slug).instance();
 const k=(mobile?342:552)/480;
 const nodes=[diagram,...penpotUtils.findShapes(s=>s.id!==diagram.id,diagram)].map(s=>({s,x:s.x-diagram.x,y:s.y-diagram.y,w:s.width,h:s.height,font:s.type==='text'?Number(s.fontSize):null}));
 const sx=b.x,sy=b.y+y;for(const n of nodes){n.s.resize(Math.max(.01,n.w*k),Math.max(.01,n.h*k));n.s.x=sx+n.x*k;n.s.y=sy+n.y*k;if(n.font)n.s.fontSize=String(n.font*k);}b.appendChild(diagram);diagram.x=b.x;diagram.y=sy;
 let cy=mobile?y+320*k+24:y,cx=mobile?0:600,cw=mobile?w:392;
 for(const control of spec.controls){
   await new Promise(r=>setTimeout(r,25));
   t=d.text(b,'Control / '+control.id,control.label,cx,cy,cw,16);cy+=t.height+8;
   if(control.kind==='choice'){
     let x=cx;for(const option of control.options){const width=Math.min(cw,Math.max(70,option.label.length*8+24));if(x+width>cx+cw){x=cx;cy+=52;}const r=penpot.createRectangle();r.name='Choice / '+control.id;r.fills=[d.colors[spec.initial[control.id]===option.value?'Ink':'Paper'].asFill()];r.strokes=[{...d.colors.Line.asStroke(),strokeWidth:1,strokeAlignment:'center',strokeStyle:'solid'}];d.put(r,b,x,cy,width,44);const label=d.text(b,'Option / '+control.id,option.label,x+12,cy+10,width-24,14);label.resize(width-24,24);label.fills=[d.colors[spec.initial[control.id]===option.value?'Paper':'Ink'].asFill()];x+=width+8;}cy+=60;
   }else if(control.kind==='range'){const r=penpot.createRectangle();r.name='Range / '+control.id;r.fills=[d.colors.Line.asFill()];d.put(r,b,cx,cy+20,cw,1);t=d.text(b,'Value / '+control.id,String(spec.initial[control.id]),cx,cy+28,cw,14);cy+=66;}
   else {const r=penpot.createRectangle();r.name='Action / '+control.id;r.fills=[d.colors.Paper.asFill()];r.strokes=[{...d.colors.Line.asStroke(),strokeWidth:1,strokeAlignment:'center',strokeStyle:'solid'}];d.put(r,b,cx,cy-40,cw,44);r.sendToBack();cy+=12;}
 }
 y=Math.max(y+320*k,cy)+24;t=d.text(b,'Demo result',spec.readout,0,y,w,18);y+=t.height+24;
 const timeline=lib.components.find(c=>c.name==='Animation timeline').instance();d.timeline(b,timeline,y,w);y+=60;
 t=d.text(b,'Demo caption',spec.caption,0,y,w,14);y+=t.height+16;
 t=d.text(b,'Demo fallback',spec.fallback,0,y,w,14);y+=t.height+24;b.resize(w,y);
 const c=lib.createComponent([b]);c.name=name;c.path='OpenSP / Demo figures';return {id:c.id,height:y};
};
return {ready:true};
