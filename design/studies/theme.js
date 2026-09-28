(() => {
  const media=matchMedia('(prefers-color-scheme: dark)');
  let preference='system';
  try { preference=localStorage.getItem('opensp-theme')||'system'; } catch {}
  if(!['light','dark','system'].includes(preference))preference='system';
  function apply(){
    const theme=preference==='system'?(media.matches?'dark':'light'):preference;
    document.documentElement.dataset.theme=theme;
    document.querySelectorAll('[data-theme-picker]').forEach(el=>el.value=preference);
    document.querySelectorAll('img[data-light]').forEach(img=>img.src=img.dataset[theme]);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    apply();
    document.querySelectorAll('[data-theme-picker]').forEach(el=>el.addEventListener('change',()=>{
      preference=el.value;try{localStorage.setItem('opensp-theme',preference)}catch{}apply();
    }));
  });
  media.addEventListener('change',apply);
  apply();
})();
