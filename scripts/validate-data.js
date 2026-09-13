const fs=require('fs');const vm=require('vm');global.window=global;
['data/base.js','data/v3-init.js','data/v3-breakfasts.js','data/v3-lunches.js','data/v3-dinners.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
const D=global.MENU_APP_DATA;
function fail(m){console.error('VALIDATION ERROR:',m);process.exit(1)}
if(!D||!Array.isArray(D.recipes))fail('Dataset missing');
if(D.recipes.length!==90)fail(`Expected 90 recipes, got ${D.recipes.length}`);
for(const t of ['Desayuno','Almuerzo','Cena']){const n=D.recipes.filter(r=>r.type===t).length;if(n!==30)fail(`${t}: expected 30, got ${n}`)}
if(new Set(D.recipes.map(r=>r.id)).size!==90)fail('Duplicate recipe IDs');
if(new Set(D.recipes.map(r=>r.name)).size!==90)fail('Duplicate recipe names');
if(!Array.isArray(D.menu)||D.menu.length!==30)fail('Menu must have 30 days');
const carbCats=new Set(['Cereales y derivados','Tubérculos y plátanos']);
function carbFamily(name){const n=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(n.includes('papa'))return'papa';if(n.includes('arroz'))return'arroz';if(n.includes('yuca'))return'yuca';if(n.includes('platano'))return'platano';if(n.includes('guineo'))return'guineo';if(n.includes('arepa'))return'arepa';if(n.includes('mazorca')||n.includes('maiz')||n.includes('tortilla')||n.includes('envuelto'))return'maiz';if(n.includes('avena'))return'avena';if(n.includes('quinua')||n.includes('quinoa'))return'quinua';if(n.includes('pasta')||n.includes('fideo'))return'pasta';if(n.includes('pan'))return'pan';if(n.includes('batata'))return'batata';return n}
function majorCarbs(r){return new Set((r.ingredients||[]).filter(i=>carbCats.has(i.category)&&(Number(i.qty)>=80||i.unit==='unidad')).map(i=>carbFamily(i.name)))}
for(const r of D.recipes){if(!r.ingredients?.length)fail(`${r.id} has no ingredients`);const c=majorCarbs(r);if(r.type==='Desayuno'&&c.size>1)fail(`${r.id} breakfast has ${c.size} major carb sources: ${[...c].join(', ')}`);if((r.type==='Almuerzo'||r.type==='Cena')&&c.size>2)fail(`${r.id} has ${c.size} major carb sources: ${[...c].join(', ')}`)}
for(let day=1;day<=30;day++){for(const t of ['Desayuno','Almuerzo','Cena'])if(!D.recipes.find(r=>r.day===day&&r.type===t))fail(`Missing ${t} on day ${day}`)}
const shopping=new Map();for(const r of D.recipes)for(const i of r.ingredients||[]){const k=`${i.name}|${i.unit}`;shopping.set(k,(shopping.get(k)||0)+Number(i.qty||0))}if(shopping.size<40)fail('Shopping consolidation unexpectedly small');
console.log(`OK: ${D.recipes.length} unique recipes, 30 days, ${shopping.size} consolidated shopping items, carbohydrate rules validated.`);
