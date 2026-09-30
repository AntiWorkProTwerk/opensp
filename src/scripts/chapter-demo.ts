import type {Demo, Values, Mark} from '../lib/demos/types';

// SSR renders every poster; the browser loads only this chapter's model group.
const earlySlugs=new Set(['pad-information','first-animation','verified-capture','original-boot','mapping-controls','named-inputs']);
const systemsSlugs=new Set(['usb-updates','keeping-the-updater','partial-update','ram-loader','bootloader-boundaries','original-sdk']);
const audioSlugs=new Set(['finding-audio','audio-stream','pitch-correction','synth-design','first-change']);
async function loadDemo(slug:string):Promise<Demo|undefined>{
  const demos=earlySlugs.has(slug)?(await import('../lib/demos/early')).earlyDemos:
    systemsSlugs.has(slug)?(await import('../lib/demos/systems')).systemsDemos:
    audioSlugs.has(slug)?(await import('../lib/demos/audio')).audioDemos:[];
  return demos.find(demo=>demo.slug===slug);
}

const colors: Record<string,string>={Ink:'var(--ink)',Paper:'var(--paper)',Surface:'var(--soft)',Muted:'var(--muted)',Line:'var(--line)'};
class ChapterDemo extends HTMLElement {
  private demo?: Demo;
  private values: Values={};
  private progress=1;
  private intent=false;
  private entered=false;
  private visible=false;
  private frame=0;
  private previous=0;
  private observer?: IntersectionObserver;
  private events?: AbortController;
  private reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private nodes=new Map<string,SVGGElement>();
  private result?: HTMLElement;
  private seek?: HTMLInputElement;
  private button?: HTMLButtonElement;
  connectedCallback(){
    if(this.events)return;
    const events=new AbortController();this.events=events;
    void this.initialize(events);
  }
  private async initialize(events:AbortController){
    try{this.demo??=await loadDemo(this.dataset.demo||'');}
    catch{
      if(this.events===events&&!events.signal.aborted){
        this.dataset.loadError='true';delete this.dataset.ready;
        this.querySelectorAll<HTMLElement>('.demo-controls,.demo-transport').forEach(el=>el.hidden=true);
        events.abort();this.events=undefined;
      }
      return;
    }
    if(events.signal.aborted||!this.isConnected||this.events!==events)return;
    if(!this.demo){events.abort();this.events=undefined;return;}
    delete this.dataset.loadError;
    if(!this.entered)this.values={...this.demo.initial};
    if(this.reduced.matches){this.intent=false;this.progress=1;}
    this.result=this.querySelector<HTMLElement>('[data-demo-result]')!;
    this.seek=this.querySelector<HTMLInputElement>('[data-demo-seek]')!;
    this.button=this.querySelector<HTMLButtonElement>('[data-demo-play]')!;
    this.querySelectorAll<SVGGElement>('[data-part]').forEach(node=>this.nodes.set(node.dataset.part!,node));
    const opts={signal:events.signal};
    this.addEventListener('input',event=>{const input=event.target as HTMLInputElement;if(input===this.seek){this.progress=+input.value/1000;this.interrupt(false);}else if(input.dataset.control){this.values[input.dataset.control]=+input.value;this.interrupt();}},opts);
    this.addEventListener('click',event=>{
      const button=(event.target as Element).closest<HTMLButtonElement>('button');if(!button)return;
      if(button===this.button){this.entered=true;this.intent=!this.intent;if(this.intent&&this.progress>=1)this.progress=0;this.sync();return;}
      if(button.dataset.action&&this.demo?.act)this.values=this.demo.act({...this.values},button.dataset.action);
      else if(button.dataset.control)this.values[button.dataset.control]=Number(button.dataset.value);
      else return;
      this.interrupt();
    },opts);
    this.reduced.addEventListener('change',()=>{if(this.reduced.matches)this.interrupt();},opts);
    document.addEventListener('visibilitychange',()=>this.sync(),opts);
    this.querySelectorAll<HTMLElement>('.demo-controls,.demo-transport').forEach(el=>el.hidden=false);
    this.dataset.ready='true';this.render();
    this.observer=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;if(this.visible&&!this.entered){this.entered=true;if(!this.reduced.matches){this.progress=0;this.intent=true;}}this.sync();},{threshold:[0,.2]});
    this.observer.observe(this);
  }
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.frame=0;this.visible=false;this.observer?.disconnect();this.events?.abort();this.events=undefined;}
  private interrupt(final=true){this.entered=true;this.intent=false;if(final)this.progress=1;this.sync();this.render();}
  private sync(){
    this.dataset.intent=String(this.intent);
    this.button?.setAttribute('aria-label',`${this.intent?'Pause':'Play'} ${this.demo?.title}`);
    const playing=this.intent&&this.visible&&!document.hidden;
    this.dataset.playing=String(playing);
    this.result?.setAttribute('aria-live',playing?'off':'polite');
    if(playing&&!this.frame){this.previous=performance.now();this.frame=requestAnimationFrame(this.tick);}
    else if(!playing){cancelAnimationFrame(this.frame);this.frame=0;}
  }
  private tick=(now:number)=>{this.frame=0;this.progress=Math.min(1,this.progress+Math.max(0,now-this.previous)/6500);this.previous=now;this.render();if(this.progress>=1){this.intent=false;this.sync();}else if(this.intent&&this.visible&&!document.hidden)this.frame=requestAnimationFrame(this.tick);};
  private render(){
    if(!this.demo)return;const frame=this.demo.frame(this.values,this.progress);
    for(const mark of frame.marks)this.paint(mark);
    if(this.result&&this.result.textContent!==frame.readout)this.result.textContent=frame.readout;
    if(this.seek)this.seek.value=String(Math.round(this.progress*1000));
    this.querySelectorAll<HTMLElement>('[data-control]').forEach(el=>{const value=this.values[el.dataset.control!];if(el instanceof HTMLInputElement)el.value=String(value);else el.setAttribute('aria-pressed',String(Number(el.dataset.value)===value));});
    this.querySelectorAll<HTMLOutputElement>('[data-control-output]').forEach(el=>el.value=String(this.values[el.dataset.controlOutput!]));
    this.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(el=>el.disabled=this.demo!.disabled?.(this.values,el.dataset.action!)??false);
  }
  private paint(mark:Mark){
    const group=this.nodes.get(mark.id);if(!group)return;
    const element=group.firstElementChild as SVGElement;if(!element)return;
    group.setAttribute('transform',`translate(${mark.x} ${mark.y})`);group.setAttribute('opacity',String(mark.opacity??1));
    element.setAttribute('fill',mark.fill?colors[mark.fill]:'none');element.setAttribute('stroke',mark.stroke?colors[mark.stroke]:'none');element.setAttribute('stroke-width','1.5');
    if(mark.type==='text'){const span=element.querySelector('tspan');if(span&&span.textContent!==mark.text)span.textContent=mark.text||'';element.setAttribute('font-size',String(mark.size||20));element.setAttribute('y',String((mark.size||20)*.92));}
    else if(mark.type==='path'){element.removeAttribute('transform');element.setAttribute('d',mark.d||'');}
    else if(mark.type==='ellipse'){for(const [k,v] of Object.entries({cx:mark.w/2,cy:mark.h/2,rx:mark.w/2,ry:mark.h/2}))element.setAttribute(k,String(v));}
    else{element.setAttribute('width',String(Math.max(0,mark.w)));element.setAttribute('height',String(Math.max(0,mark.h)));}
  }
}
if(!customElements.get('chapter-demo'))customElements.define('chapter-demo',ChapterDemo);
