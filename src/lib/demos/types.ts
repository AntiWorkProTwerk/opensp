export type Values = Record<string, number>;
export type Mark = {
  id: string; type: 'rect' | 'ellipse' | 'path' | 'text';
  x: number; y: number; w: number; h: number;
  text?: string; d?: string; size?: number;
  fill?: 'Ink' | 'Paper' | 'Surface' | 'Muted' | 'Line';
  stroke?: 'Ink' | 'Muted' | 'Line'; opacity?: number;
};
export type Control = {
  id: string; label: string; kind: 'range' | 'choice' | 'action';
  min?: number; max?: number; step?: number;
  options?: {label: string; value: number}[];
};
export type Demo = {
  slug: string; title: string; prompt: string; caption: string; fallback: string;
  initial: Values; controls: Control[];
  frame: (values: Values, progress: number) => {marks: Mark[]; readout: string};
  act?: (values: Values, action: string) => Values;
  disabled?: (values: Values, action: string) => boolean;
};
export const text = (id: string, value: string, x: number, y: number, w=440, size=20): Mark =>
  ({id,type:'text',text:value,x,y,w,h:size*1.5,size,fill:'Ink'});
export const rect = (id: string,x:number,y:number,w:number,h:number,fill:Mark['fill']='Surface',stroke:Mark['stroke']='Line'):Mark =>
  ({id,type:'rect',x,y,w,h,fill,stroke});
export const line = (id:string,x:number,y:number,w:number,h=0):Mark =>
  ({id,type:'path',x:0,y:0,w:480,h:320,d:`M${x} ${y}l${w} ${h}`,stroke:'Line'});
export const path = (id:string,d:string):Mark => ({id,type:'path',x:0,y:0,w:480,h:320,d,stroke:'Ink'});
export const circle = (id:string,x:number,y:number,size:number,fill:Mark['fill']='Ink'):Mark =>
  ({id,type:'ellipse',x,y,w:size,h:size,fill});
export const choose = (id:string,label:string,labels:string[]):Control =>
  ({id,label,kind:'choice',options:labels.map((label,value)=>({label,value}))});
export const range = (id:string,label:string,min:number,max:number,step=1):Control => ({id,label,kind:'range',min,max,step});
export const action = (id:string,label:string):Control => ({id,label,kind:'action'});
