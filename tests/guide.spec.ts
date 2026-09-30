import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import article from '../src/content/first-change.json' with {type:'json'};
import nativeLayouts from '../design/penpot/first-guide-layouts.json' with {type:'json'};

const route='/guides/first-change/';
test('all four native layouts retain shared walkthrough copy and component links',()=>{
  expect(nativeLayouts.boards).toHaveLength(4);
  for(const board of nativeLayouts.boards){
    // Five retained walkthrough figures plus the new record-comparison model.
    expect(board.linkedComponents.filter(c=>c.component==='Animation timeline')).toHaveLength(6);
    expect(board.linkedComponents.filter(c=>c.component==='Reader checkpoint')).toHaveLength(7);
    expect(board.linkedComponents.filter(c=>c.component==='Figure control')).toHaveLength(0);
    const copy=board.text.map(t=>t.text);expect(copy).toContain(article.description);
    for(const section of article.sections){expect(copy).toContain(section.title);expect(copy).toContain(section.checkpoint);for(const paragraph of section.paragraphs)expect(copy).toContain(paragraph);}
  }
});
for(const width of [320,390,600,768,900,1100,1440,1920])for(const theme of ['light','dark']){
  test(`first guide ${width}px ${theme}`,async({page})=>{
    await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(route);
    await page.getByLabel('Color theme',{exact:true}).selectOption(theme);
    await expect(page.locator('h1')).toHaveText(article.title);
    await expect(page.locator('.guide-section')).toHaveCount(7);
    for(const section of article.sections){await expect(page.locator(`#${section.id} h2`)).toHaveText(section.title);await expect(page.locator(`#${section.id} > p`)).toHaveText(section.paragraphs);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('[data-menu-screen]')).toBeVisible();
    expect(await page.locator('.guide-instrument [data-component="Pad - idle"]').count()).toBe(16);
    await expect(page.locator('.ida-excerpt pre')).toContainText('sub_800C2558((int)a1, (int)aUtilityMenu, -98);');
    await expect(page.locator('.hardware-result blockquote')).toContainText('it wokred');
    expect(await page.locator('a[href*="penpot"],a[href*="design/studies"],astro-island').count()).toBe(0);
    if([390,1440].includes(width)){
      const report=await new AxeBuilder({page}).analyze();expect(report.violations).toEqual([]);
      await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();window.scrollTo(0,0);});
      await page.screenshot({path:`test-results/guide-${width}-${theme}.png`,fullPage:true});
      await page.locator('#reading-ida').screenshot({path:`test-results/guide-code-${width}-${theme}.png`});
      await page.locator('[data-mode="memory"]').screenshot({path:`test-results/guide-memory-${width}-${theme}.png`});
      await page.locator('[data-mode="comparison"]').screenshot({path:`test-results/guide-comparison-${width}-${theme}.png`});
    }
    expect(errors).toEqual([]);
  });
}

test('contents and keyboard controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
  const contents=page.locator('.guide-contents');await expect(contents).not.toHaveAttribute('open','');
  await contents.locator('summary').focus();await page.keyboard.press('Enter');await expect(contents).toHaveAttribute('open','');
  await page.getByRole('link',{name:'Inside IDA',exact:true}).click();await expect(page).toHaveURL(/#reading-ida$/);await expect(contents).not.toHaveAttribute('open','');
  for(const mode of ['instrument','memory','code','comparison','verification']){
    const figure=page.locator(`guide-motion[data-mode="${mode}"]`),slider=figure.getByRole('slider');
    await slider.focus();await page.keyboard.press('Home');await expect(slider).toHaveValue('0');await expect(figure).toHaveAttribute('data-phase','0');
    await page.keyboard.press('ArrowRight');await expect(slider).toHaveValue('10');
    await page.keyboard.press('End');await expect(slider).toHaveValue('1000');
  }
  await expect(page.locator('[data-character][data-changed]')).toHaveCount(12);
  await expect(page.locator('[data-region][data-complete]')).toHaveCount(3);
  await expect(page.locator('[data-case][data-complete]')).toHaveCount(12);
  await expect(page.locator('guide-motion[data-playing="true"]')).toHaveCount(0);
});

test('animation pauses and remains reader-controlled',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(route);
  const instrument=page.locator('[data-mode="instrument"]');
  await instrument.scrollIntoViewIfNeeded();await expect(instrument).toHaveAttribute('data-playing','true');
  await instrument.getByRole('button',{name:'Pause menu observation'}).click();
  await instrument.getByRole('slider').fill('500');
  await expect(instrument.locator('[data-part="SHIFT"]')).toHaveClass(/demo-active/);
  await expect(instrument.locator('[data-part="Pad 13"]')).toHaveClass(/demo-active/);
  await expect(instrument.locator('[data-menu-screen] text')).toHaveText('');
  await instrument.getByRole('slider').fill('700');await expect(instrument.locator('[data-menu-screen]')).toContainText('CUSTOM MENU!');
  const map=page.locator('[data-mode="memory"]');await expect(map).not.toHaveAttribute('data-playing','true');
  await map.scrollIntoViewIfNeeded();await expect(map).toHaveAttribute('data-playing','true');
  await map.getByRole('button',{name:'Pause runtime regions'}).click();await expect(map).toHaveAttribute('data-playing','paused');
  const paused=await map.getByRole('slider').inputValue();await page.waitForTimeout(350);expect(await map.getByRole('slider').inputValue()).toBe(paused);
  await page.locator('.guide-evidence').scrollIntoViewIfNeeded();await map.scrollIntoViewIfNeeded();await expect(map).toHaveAttribute('data-playing','paused');
  await map.getByRole('button',{name:'Play runtime regions'}).click();await expect(map).toHaveAttribute('data-playing','true');
  await page.locator('.guide-evidence').scrollIntoViewIfNeeded();await expect(map).toHaveAttribute('data-playing','suspended');
  const frozen=await map.getByRole('slider').inputValue();await page.waitForTimeout(350);expect(await map.getByRole('slider').inputValue()).toBe(frozen);
  await map.scrollIntoViewIfNeeded();await expect(map).toHaveAttribute('data-playing','true');
  await page.emulateMedia({reducedMotion:'reduce'});await expect(map).toHaveAttribute('data-playing','paused');
});

test('desktop contents stays open with keyboard activation',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto(route);
  const contents=page.locator('.guide-contents');await contents.locator('summary').focus();await page.keyboard.press('Enter');
  await expect(contents).toHaveAttribute('open','');await expect(contents.getByRole('link',{name:'Inside IDA'})).toBeVisible();
});

test('mobile contents starts collapsed before deferred scripts',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.route('**/guides/first-change/',async route=>{
    const response=await route.fetch();
    const html=(await response.text()).replace(/<script\b[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g,'');
    await route.fulfill({response,body:html});
  });
  await page.goto(route);await expect(page.locator('.guide-contents')).not.toHaveAttribute('open','');
  await expect(page.locator('h1')).toBeInViewport();
});

test('complete guide without JavaScript and valid source record',async({browser,request})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();await page.goto(route);
  await expect(page.locator('h1')).toHaveText(article.title);await expect(page.locator('.guide-section')).toHaveCount(7);
  await expect(page.getByRole('link',{name:'On the SP',exact:true})).toBeVisible();await page.getByRole('link',{name:'On the SP',exact:true}).click();await expect(page.locator('#on-the-sp')).toBeInViewport();
  await expect(page.locator('[data-timeline]:visible')).toHaveCount(0);await expect(page.locator('.comparison-screen')).toHaveCount(2);
  const response=await request.get('/evidence/first-change.json');expect(response.ok()).toBe(true);const evidence=await response.json();expect(evidence.changedApp1BytePositions).toBe(12);expect(evidence.offlineChecks.menuExecutionCases).toBe(12);expect(evidence.ownerReply).toBe('it wokred');
  await context.close();
});

test('all timelines seek, complete and allow explicit reduced-motion playback',async({page,request})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
  for(const mode of ['instrument','memory','code','comparison','verification']){
    const figure=page.locator(`guide-motion[data-mode="${mode}"]`);await figure.scrollIntoViewIfNeeded();
    await expect(figure.getByRole('slider')).toHaveValue('1000');
    await figure.getByRole('slider').fill('980');await figure.getByRole('button').click();await expect(figure).toHaveAttribute('data-playing','true');
    await expect(figure.getByRole('slider')).toHaveValue('1000');await expect(figure).toHaveAttribute('data-playing','false');
    await figure.getByRole('button').click();await expect(figure).toHaveAttribute('data-playing','true');await figure.getByRole('button').click();
  }
  await expect(page.locator('.reader-checkpoint')).toHaveCount(7);
  const lesson=await request.get('/examples/menu-title-check.py');expect(lesson.ok()).toBe(true);expect(await lesson.text()).toContain('This is not an SP emulator or hardware test.');
});

test('visibility lifecycle suspends the clock without losing playback intent',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(route);
  const figure=page.locator('[data-mode="memory"]');await figure.scrollIntoViewIfNeeded();await expect(figure).toHaveAttribute('data-playing','true');
  // Drive the browser event path deterministically; no claim of a physical-phone test.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(figure).toHaveAttribute('data-playing','suspended');const value=await figure.getByRole('slider').inputValue();
  await page.waitForTimeout(250);await expect(figure.getByRole('slider')).toHaveValue(value);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(figure).toHaveAttribute('data-playing','true');
});
