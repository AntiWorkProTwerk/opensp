import {test,expect} from '@playwright/test';
import {definitions,part,findShape} from '../src/lib/penpot';

test('native SP parts retain the shared surrounds and circular viewport',()=>{
  expect(definitions.some(c=>c.name==='Knob surround')).toBe(true);
  expect(definitions.some(c=>c.name==='Effects surround')).toBe(true);
  const instrument=part('Instrument');
  const rail=findShape(instrument,'Knob surround')!;
  const effects=findShape(instrument,'Effects surround')!;
  expect([rail.x,rail.y,rail.shape.width,rail.shape.height]).toEqual([56,43,288,50]);
  expect([effects.x,effects.y,effects.shape.width,effects.shape.height]).toEqual([60,111,280,112]);
  const display=part('Display');
  const viewport=findShape(display,'OLED viewport')!.shape;
  const aperture=findShape(display,'OLED circular aperture')!;
  const slot=findShape(display,'OLED content slot')!;
  expect(viewport.maskId).toBe(aperture.shape.id);
  expect(aperture.shape.type).toBe('ellipse');
  expect([slot.x,slot.y,slot.shape.width,slot.shape.height]).toEqual([5,35.5,122,61]);
  expect([aperture.x,aperture.y,aperture.shape.width,aperture.shape.height]).toEqual([5,5,122,122]);
});

for(const route of ['/','/guides/first-change/'])for(const width of [390,1440])for(const theme of ['light','dark']){
  test(`SP geometry ${route} ${width}px ${theme}`,async({page})=>{
    await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(route);await page.getByLabel('Color theme',{exact:true}).selectOption(theme);
    const instrument=page.locator('.instrument');
    await expect(instrument.locator('[data-component="Knob surround"]')).toHaveCount(1);
    await expect(instrument.locator('[data-component="Effects surround"]')).toHaveCount(1);
    const masked=instrument.locator('[data-native-mask="OLED circular aperture"]');
    await expect(masked).toHaveCount(1);
    const link=await masked.getAttribute('clip-path');
    const id=link!.slice(5,-1);
    await expect(page.locator(`clipPath[id="${id}"] ellipse`)).toHaveCount(1);
    const screen=instrument.locator(route==='/'?'sp-display':'[data-menu-screen]');
    const outer=await instrument.boundingBox(),box=await screen.boundingBox();
    expect(box!.width/outer!.width).toBeCloseTo(122/400,3);
    expect(box!.width/box!.height).toBeCloseTo(2,3);
    const painted=route==='/'?screen.locator('.screen-poster'):screen;
    expect(await painted.evaluate(el=>getComputedStyle(el).clipPath)).toBe('ellipse(50% 100% at 50% 50%)');
    if(route==='/'){
      const button=screen.locator('button');await button.focus();
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.keyboard.press('Space');await expect(screen).toHaveAttribute('data-state','playing');
      await page.keyboard.press('Space');await expect(screen).toHaveAttribute('data-state','paused');
    }else await expect(screen).toContainText('CUSTOM MENU!');
    await instrument.screenshot({path:`test-results/sp-${route==='/'?'home':'guide'}-${width}-${theme}.png`});
  });
}
