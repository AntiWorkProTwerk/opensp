import scenes from '../content/guide-scenes.json';

type Mode=keyof typeof scenes;
class GuideMotion extends HTMLElement {
  private frame=0;
  private progress=1;
  private previousTime=0;
  private phase=-1;
  private entered=false;
  private visible=false;
  private intent=false;
  private button:HTMLButtonElement|null=null;
  private seek:HTMLInputElement|null=null;
  private reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private observer:IntersectionObserver|undefined;
  private events:AbortController|undefined;
  private get scene(){return scenes[this.dataset.mode as Mode];}
  connectedCallback(){
    if(!this.scene||this.events)return;
    this.events=new AbortController();const options={signal:this.events.signal};
    this.button=this.querySelector('[data-toggle]');this.seek=this.querySelector('[data-seek]');
    if(!this.button||!this.seek)return;
    this.querySelector<HTMLElement>('[data-timeline]')!.hidden=false;
    this.dataset.ready='true';this.dataset.playing='false';
    this.button.addEventListener('click',()=>{
      this.entered=true;
      if(this.intent){this.intent=false;this.stop('paused');}
      else {if(this.progress>=1)this.progress=0;this.intent=true;this.start();}
    },options);
    this.seek.addEventListener('input',()=>{
      this.entered=true;
      this.intent=false;this.stop('paused');this.progress=Number(this.seek!.value)/1000;this.render();
    },options);
    this.reduced.addEventListener('change',this.motionChanged,options);
    document.addEventListener('visibilitychange',this.visibilityChanged,options);
    this.render();
    this.observer=new IntersectionObserver(entries=>{
      this.visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;
      if(this.visible&&!this.entered){this.entered=true;if(!this.reduced.matches){this.progress=0;this.intent=true;}}
      this.sync();
    },{threshold:[0,.2]});this.observer.observe(this);
  }
  disconnectedCallback(){this.stop('paused');this.events?.abort();this.events=undefined;this.observer?.disconnect();}
  private motionChanged=()=>{if(this.reduced.matches){this.intent=false;this.stop('paused');}};
  private visibilityChanged=()=>this.sync();
  private sync(){if(this.intent&&this.visible&&!document.hidden)this.start();else if(this.intent)this.stop('suspended');}
  private start(){
    if(!this.visible||document.hidden){this.stop('suspended');return;}
    if(this.frame)return;
    this.dataset.playing='true';this.previousTime=performance.now();this.updateButton();this.render();
    this.frame=requestAnimationFrame(this.tick);
  }
  private tick=(now:number)=>{
    this.frame=0;
    this.progress=Math.min(1,this.progress+(now-this.previousTime)/(this.scene.duration*1000));
    this.previousTime=now;this.render();
    if(this.progress>=1){this.intent=false;this.stop('false');}
    else this.frame=requestAnimationFrame(this.tick);
  };
  private stop(state:string){cancelAnimationFrame(this.frame);this.frame=0;this.dataset.playing=state;this.updateButton();}
  private updateButton(){this.dataset.intent=String(this.intent);this.button?.setAttribute('aria-label',`${this.intent?'Pause':'Play'} ${this.scene.label}`);}
  private render(){
    const phase=Math.min(this.scene.steps.length-1,Math.floor(this.progress*this.scene.steps.length));
    this.style.setProperty('--progress',String(this.progress));
    if(this.seek)this.seek.value=String(Math.round(this.progress*1000));
    const output=this.querySelector('[data-time]');
    const time=(s:number)=>`0:${String(Math.floor(s)).padStart(2,'0')}`;
    const clock=`${time(this.progress*this.scene.duration)} / ${time(this.scene.duration)}`;
    if(output?.textContent!==clock&&output)output.textContent=clock;
    if(phase===this.phase)return;this.phase=phase;
    const text=this.scene.steps[phase];const status=this.querySelector('.motion-status');if(status)status.textContent=text;
    this.seek?.setAttribute('aria-valuetext',`${phase+1} of ${this.scene.steps.length}: ${text}`);
    this.dataset.phase=String(phase);
    if(this.dataset.mode==='memory')this.querySelectorAll<HTMLElement>('[data-region]').forEach((row,i)=>{
      row.toggleAttribute('data-active',phase===i+1);row.toggleAttribute('data-complete',phase>i);
      row.querySelector('[data-destination]')!.textContent=phase>i?row.dataset.result!:'·· ·· ·· ··';
    });
    if(this.dataset.mode==='code'){
      this.querySelectorAll('[data-trace]').forEach((el,i)=>el.toggleAttribute('data-active',phase===4||i===Math.min(phase,2)));
      this.querySelectorAll('[data-line]').forEach(el=>el.classList.toggle('code-focus',phase===4?(el.getAttribute('data-line')==='3'||el.getAttribute('data-line')==='5'):el.getAttribute('data-line')===(phase>=3?'5':'3')));
    }
    if(this.dataset.mode==='comparison')this.querySelectorAll('[data-character]').forEach((el,i)=>el.toggleAttribute('data-changed',i<phase));
    if(this.dataset.mode==='verification')this.querySelectorAll('[data-case]').forEach((el,i)=>{el.textContent=i<phase?'Pass':'—';el.toggleAttribute('data-complete',i<phase);});
    if(this.dataset.mode==='instrument'){
      const title=this.querySelector('[data-menu-screen] text');if(title)title.textContent=phase>=3?'CUSTOM MENU!':'';
      this.querySelector('[data-part="SHIFT"]')?.classList.toggle('demo-active',phase===1||phase===2);
      this.querySelector('[data-part="Pad 13"]')?.classList.toggle('demo-active',phase===2);
    }
  }
}
if(!customElements.get('guide-motion'))customElements.define('guide-motion',GuideMotion);
