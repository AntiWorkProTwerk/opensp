if (penpot.currentFile?.id !== '24d9d841-759d-81bc-8008-b518bc70d8b3') throw new Error('OpenSP only');
const ds=storage.ds;
// Named library typography, with registered fonts required by native Penpot text.
for (const [name,t] of Object.entries(ds.type)) {
 const mono=['Label','Display text'].includes(name);
 const f=penpot.fonts.all.find(f=>f.name===(mono?'Cousine':'Arimo'));
 t.setFont(f, f.variants.find(v=>v.fontWeight===(name==='Brand'?'700':'400')&&v.fontStyle==='normal'));
}
ds.fill=n=>[ds.colors[n].asFill()];
ds.stroke=(n,w=1)=>[{...ds.colors[n].asStroke(),strokeWidth:w,strokeStyle:'solid',strokeAlignment:'center'}];
ds.place=(s,parent,x,y)=>{if(parent)parent.appendChild(s);s.x=(parent?.x||0)+x;s.y=(parent?.y||0)+y;return s;};
ds.rect=(parent,name,x,y,w,h,fill='Paper',stroke=null,sw=1)=>{
 const s=penpot.createRectangle();s.name=name;s.resize(w,h);s.fills=fill?ds.fill(fill):[];s.strokes=stroke?ds.stroke(stroke,sw):[];return ds.place(s,parent,x,y);
};
ds.ellipse=(parent,name,x,y,w,h,fill='Paper',stroke='Ink',sw=1)=>{
 const s=penpot.createEllipse();s.name=name;s.resize(w,h);s.fills=fill?ds.fill(fill):[];s.strokes=stroke?ds.stroke(stroke,sw):[];return ds.place(s,parent,x,y);
};
ds.text=(parent,name,value,x,y,w,h,style='Body',color='Ink',align='left',size=null)=>{
 const s=penpot.createText(value);s.name=name;s.applyTypography(ds.type[style]);s.resize(w,h);s.growType='fixed';s.align=align;s.verticalAlign='top';if(size)s.fontSize=String(size);s.fills=ds.fill(color);return ds.place(s,parent,x,y);
};
ds.board=(name,x,y,w,h,fill=null)=>{const b=penpot.createBoard();b.name=name;b.resize(w,h);b.fills=fill?ds.fill(fill):[];b.x=x;b.y=y;return b;};
ds.path=(parent,name,d,fill=null,stroke='Ink',sw=1)=>{const p=penpot.createPath();p.name=name;p.d=d;p.fills=fill?ds.fill(fill):[];p.strokes=stroke?ds.stroke(stroke,sw):[];if(parent){const x=p.x,y=p.y;ds.place(p,parent,x,y);}return p;};
ds.instance=(comp,parent,x,y,name=null)=>{const s=comp.instance();if(name)s.name=name;return ds.place(s,parent,x,y);};
ds.override=(root,name,value)=>{const s=penpotUtils.findShape(s=>s.type==='text'&&s.name===name,root);if(!s)throw new Error('Missing text '+name);s.characters=value;};
ds.make=(name,x,y,w,h,draw)=>{const b=ds.board(name,x,y,w,h);draw(b);const c=penpot.library.local.createComponent([b]);c.name=name;c.path='OpenSP';ds.components[name]=c;return c;};
ds.dark=root=>{const mapping={Paper:'Dark paper',Ink:'Dark ink',Muted:'Dark muted',Line:'Dark line',Surface:'Dark surface'};for(const s of [root,...penpotUtils.findShapes(()=>true,root)]){if(s.name.startsWith('OLED'))continue; if(Array.isArray(s.fills))s.fills=s.fills.map(f=>{const n=Object.keys(mapping).find(n=>f.fillColorRefId===ds.colors[n].id);return n?{...f,...ds.colors[mapping[n]].asFill()}:f;});if(s.strokes?.length)s.strokes=s.strokes.map(f=>{const n=Object.keys(mapping).find(n=>f.strokeColorRefId===ds.colors[n].id);return n?{...f,...ds.colors[mapping[n]].asStroke(),strokeWidth:f.strokeWidth}:f;});}};
return {registered:true,typographies:Object.values(ds.type).map(t=>({name:t.name,fontId:t.fontId,family:t.fontFamily}))};
