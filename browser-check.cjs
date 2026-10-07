const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {createApp}=require('./server.cjs');
const motion=require('./motion.js');
(async()=>{
  const qa=path.join(__dirname,'qa');await fs.mkdir(qa,{recursive:true});
  const key=crypto.randomBytes(32).toString('hex');
  const server=createApp({key,dataDir:path.join(qa,'test-data-'+crypto.randomUUID())});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  let browser;
  try{
    browser=await chromium.launch({headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const errors=[];
    for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:740}]){
      const context=await browser.newContext({viewport});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
      await page.goto(base);await page.getByRole('heading',{name:"Let's keep moving, Benj."}).waitFor();
      if(viewport.width<=760){
        assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).fontSize),'16px','Mobile body text must be readable');
        assert.ok(await page.locator('#checkin label').first().evaluate(node=>parseFloat(getComputedStyle(node).fontSize)>=16),'Mobile form labels must be at least 16px');
      }
      await page.waitForFunction(()=>{const image=document.querySelector('.photo-band img');return image?.complete&&image.naturalWidth>0;});
      await page.screenshot({path:path.join(qa,`today-${viewport.width}.png`),fullPage:true});
      for(const route of ['today','food','cardio','resistance','fitness','progress','profile']){
        await page.goto(base+'/#'+route);await page.waitForFunction(route=>document.querySelector('nav a[aria-current="page"]')?.getAttribute('href')==='#'+route,route);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflows at ${viewport.width}px`);
        if(route==='fitness'){
          await page.locator('.coach-stage canvas').waitFor();
          assert.equal(await page.locator('.movement-svg').isVisible(),false,'SVG fallback must be hidden when 3D is available');
          for(const id of motion.ids){
            if(viewport.width<=760)await page.locator('#exercise-picker').selectOption(id);else await page.locator(`[data-exercise-guide="${id}"]`).click();
            await page.waitForFunction(id=>document.querySelector('.movement-guide')?.dataset.movement===id&&document.querySelector('.coach-stage canvas'),id);
            const pixels=await page.evaluate(()=>{const canvas=document.querySelector('.coach-stage canvas'),gl=canvas.getContext('webgl2');const data=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);let content=0;for(let i=0;i<data.length;i+=4)if(data[i]<170||data[i+1]<170||data[i+2]<170)content++;return content;});
            assert.ok(pixels>600,`${id} canvas is blank at ${viewport.width}px`);
            if(viewport.width===390){
              await page.locator('.movement-scrub').evaluate((node,id)=>{node.value=['birddog','carry','march'].includes(id)?'25':'50';node.dispatchEvent(new Event('input',{bubbles:true}));},id);
              await page.locator('.coach-stage').evaluate(node=>node.scrollIntoView({block:'center'}));
              await page.locator('.coach-stage').screenshot({path:path.join(qa,`movement-${id}.png`)});
            }
          }
          await page.locator('[data-camera="front"]').click();
          if(await page.locator('.movement-toggle').getAttribute('aria-pressed')==='true')await page.locator('.movement-toggle').click();
          const before=await page.locator('.coach-stage').getAttribute('data-phase');
          await page.waitForFunction(before=>document.querySelector('.coach-stage').dataset.phase!==before,before);
          await page.locator('.movement-toggle').click();
          assert.equal(await page.locator('.movement-toggle').getAttribute('aria-pressed'),'true');
          await page.locator('.movement-scrub').evaluate(node=>{node.value='50';node.dispatchEvent(new Event('input',{bubbles:true}));});
          assert.ok(Math.abs(Number(await page.locator('.coach-stage').getAttribute('data-phase'))-Math.PI)<0.001,'Scrub must preserve the requested movement position');
          await page.screenshot({path:path.join(qa,`fitness-${viewport.width}.png`),fullPage:true});
        }
      }
      await page.locator('#profile-form input[name="weight"]').fill('75');await page.locator('#profile-form button').click();
      await page.goto(base+'/#cardio');assert.ok((await page.locator('.calorie-preview').textContent()).includes('79'));
      await page.locator('#cardio-form button').click();await page.reload();await page.getByRole('heading',{name:'Make time to move.'}).waitFor();
      assert.ok((await page.locator('#main').textContent()).includes('79 kcal'));
      if(viewport.width===390){
        await page.locator('#journal-date').fill('2026-10-07');await page.locator('#journal-date').dispatchEvent('change');
        await page.goto(base+'/#resistance');
        await page.locator('[name="rdl-0-weight"]').fill('12');await page.locator('[name="rdl-0-reps"]').fill('10');await page.locator('[name="rdl-0-done"]').check();
        await page.locator('#add-exercise-picker').selectOption('carry');await page.locator('#add-exercise').click();
        assert.equal(await page.locator('[name="rdl-0-weight"]').inputValue(),'12','Adding a movement must retain entered weights');
        await page.locator('[name="carry-0-weight"]').fill('8');await page.locator('[name="carry-0-reps"]').fill('30');await page.locator('[name="carry-0-done"]').check();
        await page.locator('[data-remove-exercise="press"]').click();
        assert.equal(await page.locator('[name="carry-0-reps"]').inputValue(),'30','Removing a different movement must retain carry duration');
        assert.equal(await page.locator('[name="press-0-weight"]').count(),0);
        await page.getByRole('button',{name:'Save session',exact:true}).click();
        await page.getByRole('button',{name:'Update session',exact:true}).waitFor();await page.reload();
        await page.locator('#journal-date').fill('2026-10-07');await page.locator('#journal-date').dispatchEvent('change');
        await page.getByRole('heading',{name:'Back & shoulders',exact:true}).waitFor();
        assert.equal(await page.locator('[name="carry-0-reps"]').inputValue(),'30');
        await page.locator('[data-tutorial="carry"]').click();await page.locator('dialog .coach-stage canvas').waitFor();
        await page.locator('#close-dialog').click();
      }
      if(viewport.width===390){
        await page.goto(base+'/#profile');page.on('dialog',dialog=>dialog.accept());
        await page.locator('#cloud-connect input[name="key"]').fill(key);await page.locator('#cloud-connect button[type="submit"], #cloud-connect button:not([type])').click();
        await page.waitForFunction(()=>document.querySelector('[data-sync-status]')?.textContent==='Saved on your server');
        await page.goto(base+'/#today');await page.locator('#checkin input[name="steps"]').fill('4321');await page.locator('#checkin button').click();
        await page.waitForFunction(()=>document.querySelector('#save-status').textContent==='Saved on your server');
        const second=await browser.newContext({viewport});const other=await second.newPage();other.on('dialog',dialog=>dialog.accept());
        await other.goto(base+'/#profile');await other.locator('#cloud-connect input[name="key"]').fill(key);await other.locator('#cloud-connect button:not([type])').click();
        await other.waitForFunction(()=>document.querySelector('[data-sync-status]')?.textContent==='Connected to your server');
        await other.goto(base+'/#today');assert.equal(await other.locator('#checkin input[name="steps"]').inputValue(),'4321');await second.close();
      }
      await context.close();
    }
    assert.deepEqual(errors,[]);console.log('PASS: desktop and 390/320px mobile layouts, all 25 nonblank 3D scenes, controls, IndexedDB reload, private server sync across browsers.');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
