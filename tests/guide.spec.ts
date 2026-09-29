import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import article from '../src/content/first-change.json' with {type:'json'};

const route='/guides/first-change/';
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
    await expect(page.locator('pre')).toContainText('sub_800C2558((int)a1, (int)aUtilityMenu, -98);');
    await expect(page.locator('.hardware-result blockquote')).toContainText('it wokred');
    expect(await page.locator('a[href*="penpot"],a[href*="design/studies"],astro-island').count()).toBe(0);
    if([390,1440].includes(width)){
      const report=await new AxeBuilder({page}).analyze();expect(report.violations).toEqual([]);
      await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();window.scrollTo(0,0);});
      await page.screenshot({path:`test-results/guide-${width}-${theme}.png`,fullPage:true});
      await page.locator('#reading-ida').screenshot({path:`test-results/guide-code-${width}-${theme}.png`});
    }
    expect(errors).toEqual([]);
  });
}

test('contents and keyboard controls',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);
  const contents=page.locator('.guide-contents');await expect(contents).not.toHaveAttribute('open','');
  await contents.locator('summary').focus();await page.keyboard.press('Enter');await expect(contents).toHaveAttribute('open','');
  await page.getByRole('link',{name:'Inside IDA',exact:true}).click();await expect(page).toHaveURL(/#reading-ida$/);await expect(contents).not.toHaveAttribute('open','');
  const highlight=page.locator('[data-highlight]');await highlight.focus();await page.keyboard.press('Space');await expect(highlight).toHaveAttribute('aria-pressed','false');await expect(highlight).toHaveText('Highlight title reference');
  await page.getByRole('button',{name:'Replay the change',exact:true}).click();await expect(page.locator('[data-character][data-changed]')).toHaveCount(12);
  await page.getByRole('button',{name:'Follow the bytes'}).click();await expect(page.locator('[data-stage][data-active]')).toHaveCount(3);
  await page.getByRole('button',{name:'Replay menu check'}).click();await expect(page.locator('[data-menu-screen]')).toContainText('CUSTOM MENU!');
  await expect(page.locator('guide-motion[data-playing="true"]')).toHaveCount(0);
});

test('animation pauses and remains reader-controlled',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(route);
  const instrument=page.locator('[data-mode="instrument"]');
  await instrument.getByRole('button',{name:'Replay menu check'}).click();
  await expect(instrument.locator('[data-menu-screen]')).toContainText('UTILITY MENU');
  await expect(instrument.locator('[data-part="SHIFT"]')).toHaveClass(/demo-active/);
  await expect(instrument.locator('[data-component="Pad - idle"]').nth(12)).toHaveClass(/demo-active/);
  await expect(instrument.locator('[data-menu-screen]')).toContainText('CUSTOM MENU!');
  await expect(instrument).toHaveAttribute('data-playing','false');
  const map=page.locator('[data-mode="memory"]');await expect(map).not.toHaveAttribute('data-playing','true');
  await map.getByRole('button',{name:'Follow the bytes'}).click();await expect(map).toHaveAttribute('data-playing','true');
  await map.getByRole('button',{name:'Pause',exact:true}).click();await expect(map).toHaveAttribute('data-playing','paused');
  const paused=await map.locator('.motion-status').textContent();await page.waitForTimeout(900);expect(await map.locator('.motion-status').textContent()).toBe(paused);
  await map.getByRole('button',{name:'Resume'}).click();await expect(map).toHaveAttribute('data-playing','true');
  await page.locator('.guide-evidence').scrollIntoViewIfNeeded();await expect(map).toHaveAttribute('data-playing','paused');
  await map.scrollIntoViewIfNeeded();await map.getByRole('button',{name:'Resume'}).click();await page.emulateMedia({reducedMotion:'reduce'});await expect(map).toHaveAttribute('data-playing','paused');
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
  await expect(page.locator('.figure-controls:visible')).toHaveCount(0);await expect(page.locator('.comparison-screen')).toHaveCount(2);
  const response=await request.get('/evidence/first-change.json');expect(response.ok()).toBe(true);const evidence=await response.json();expect(evidence.changedApp1BytePositions).toBe(12);expect(evidence.offlineChecks.menuExecutionCases).toBe(12);expect(evidence.ownerReply).toBe('it wokred');
  await context.close();
});
