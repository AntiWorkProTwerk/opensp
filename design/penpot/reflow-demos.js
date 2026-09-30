// Reflow linked figure mains after native text has settled. No component is detached.
if(penpot.currentPage.name!=='Guide components')throw Error('Open Guide components');
const d=storage.demos,lib=penpot.library.local;
d.height=(value,w,size)=>{const cap=Math.max(1,Math.floor(w/(size*.52)));let lines=0;for(const para of value.split('\n')){let used=0;for(const word of para.split(' ')){if(used&&used+word.length+1>cap){lines++;used=word.length;}else used+=(used?1:0)+word.length;}lines++;}return Math.ceil(lines*size*1.5)+4;};
d.reflow=async(spec,mobile)=>{
 const c=lib.components.find(c=>c.name==='Demo figure: '+spec.slug+(mobile?' (Mobile)':' (Desktop)'));if(!c)throw Error('Missing figure main');
 const b=c.mainInstance(),w=mobile?342:992,cx=mobile?0:600,cw=mobile?w:392;
 const find=name=>{const s=b.children.find(s=>s.name===name);if(!s)throw Error('Missing '+name);return s;};
 const fit=(name,value,x,y,width,size)=>{const s=find(name);s.characters=value||' ';s.fontSize=String(size);s.lineHeight='1.5';d.put(s,b,x,y,width,d.height(value,width,size));return s.height;};
 let y=fit('Demo title',spec.title,0,0,w,mobile?28:32)+12;
 y+=fit('Demo prompt',spec.prompt,0,y,w,mobile?16:18)+24;
 const diagram=b.children.find(s=>s.component?.()?.name==='Demo: '+spec.slug);if(!diagram)throw Error('Missing linked diagram');
 d.put(diagram,b,0,y);
 // These text marks have responsive overrides, so update their scaled positions explicitly.
 const k=diagram.width/480;
 for(const m of spec.marks.filter(m=>m.type==='text')){const s=penpotUtils.findShape(s=>s.name===m.id,diagram);s.characters=m.text||' ';d.put(s,diagram,m.x*k,m.y*k,m.w*k,m.h*k);}
 let cy=mobile?y+diagram.height+24:y;
 for(const control of spec.controls){
  await new Promise(r=>setTimeout(r,25));
  if(control.kind==='action'){
   const r=find('Action / '+control.id);d.put(r,b,cx,cy,cw,44);
   const t=find('Control / '+control.id);t.applyTypography(d.types.Code);t.fontSize='14';t.lineHeight='1.4';d.put(t,b,cx+12,cy+10,cw-24,24);cy+=64;continue;
  }
  cy+=fit('Control / '+control.id,control.label,cx,cy,cw,16)+8;
  if(control.kind==='choice'){
   const labels=b.children.filter(s=>s.name==='Option / '+control.id),boxes=b.children.filter(s=>s.name==='Choice / '+control.id);
   let x=cx;
   for(const [i,option] of control.options.entries()){
    const width=Math.min(cw,Math.max(70,Math.ceil(option.label.length*8.5)+24));
    if(x+width>cx+cw){x=cx;cy+=52;}
    d.put(boxes[i],b,x,cy,width,44);const t=labels[i];t.applyTypography(d.types.Code);t.fontSize='14';t.lineHeight='1.4';d.put(t,b,x+12,cy+10,width-24,24);x+=width+8;
   }
   cy+=64;
  }else{
   d.put(find('Range / '+control.id),b,cx,cy+20,cw,1);
   const t=find('Value / '+control.id);t.applyTypography(d.types.Code);t.fontSize='14';d.put(t,b,cx+cw-64,cy-28,64,24);t.align='right';cy+=64;
  }
 }
 y=Math.max(y+diagram.height,cy-20)+24;
 y+=fit('Demo result',spec.readout,0,y,w,mobile?16:18)+16;
 const timeline=b.children.find(s=>s.component?.()?.name==='Animation timeline');d.timeline(b,timeline,y,w);const clock=penpotUtils.findShape(s=>s.name==='Playback time',timeline);clock.characters='MODEL';clock.fontSize='12';y+=60;
 y+=fit('Demo caption',spec.caption,0,y,w,14)+16;
 y+=fit('Demo fallback',spec.fallback,0,y,w,14)+24;b.resize(w,y);
 b.setPluginData('opensp-demo-layout','v2');return {id:c.id,height:y};
};
return {ready:true};
