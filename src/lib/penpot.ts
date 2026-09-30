import snapshot from '../../design/penpot/production.json' with {type:'json'};

export interface Shape {
  id:string;name:string;type:string;x:number;y:number;width:number;height:number;rotation:number;
  componentId?:string;componentName?:string;
  opacity?:number|null;
  maskId?:string;
  fills?:{color?:string;opacity:number;ref?:string}[];
  strokes?:{color?:string;width:number;opacity:number;ref?:string}[];
  d?:string;pathOrigin?:number[];text?:string;fontFamily?:string;fontSize?:number;
  fontWeight?:string;lineHeight?:number;letterSpacing?:number;align?:string;children?:Shape[];
}
export const definitions=snapshot.components as {id:string;name:string;shape:Shape}[];
export function part(name:string):Shape {
  const found=definitions.find(c=>c.name===name);
  if(!found)throw new Error(`Missing Penpot component: ${name}`);
  return found.shape;
}
const aliases:Record<string,string>={Paper:'--paper',Ink:'--ink',Muted:'--muted',Line:'--line',Surface:'--soft','OLED black':'--color-oled-black','OLED pixel':'--color-oled-pixel'};
export function color(ref:string|undefined,fallback:string|undefined):string {
  const asset=snapshot.colors.find(c=>c.id===ref);
  return asset&&aliases[asset.name]?`var(${aliases[asset.name]})`:fallback||'none';
}
export function findShape(root:Shape,name:string,x=0,y=0):{shape:Shape;x:number;y:number}|undefined {
  const px=x+root.x,py=y+root.y;
  if(root.name.startsWith(name))return {shape:root,x:px,y:py};
  for(const child of root.children||[]){const found=findShape(child,name,px,py);if(found)return found;}
}
