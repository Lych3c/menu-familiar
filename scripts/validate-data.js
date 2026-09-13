const fs=require('fs');const vm=require('vm');global.window=global;
['data/base.js','data/v3-init.js','data/v3-breakfasts.js','data/v3-lunches.js','data/v3-dinners.js','data/v4-library.js','data/v4-fixes.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
const D=global.MENU_APP_DATA;
function fail(m){console.error('VALIDATION ERROR:',m);process.exit(1)}
if(!D||!Array.isArray(D.recipes))fail('Dataset missing');
if(D.recipes.length!==300)fail(`Expected 300 recipes, got ${D.recipes.length}`);
const scheduled=D.recipes.filter(r=>r.day>=1&&r.day<=30),library=D.recipes.filter(r=>r.day===0);
if(scheduled.length!==90)fail(`Expected 90 scheduled recipes, got ${scheduled.length}`);
if(library.length!==210)fail(`Expected 210 library recipes, got ${library.length}`);
const totals={Desayuno:90,Almuerzo:120,Cena:90};
for(const [t,expected] of Object.entries(totals)){const n=D.recipes.filter(r=>r.type===t).length;if(n!==expected)fail(`${t}: expected ${expected}, got ${n}`);const p=scheduled.filter(r=>r.type===t).length;if(p!==30)fail(`${t}: expected 30 scheduled, got ${p}`)}
if(new Set(D.recipes.map(r=>r.id)).size!==300)fail('Duplicate recipe IDs');
const nameCount=new Map();for(const r of D.recipes)nameCount.set(r.name,(nameCount.get(r.name)||0)+1);const duplicateNames=[...nameCount.entries()].filter(([,c])=>c>1).map(([n])=>n);if(duplicateNames.length)fail(`Duplicate recipe names: ${duplicateNames.join(' | ')}`);
if(!Array.isArray(D.menu)||D.menu.length!==30)fail('Menu must have 30 days');
const carbCats=new Set(['Cereales y derivados','Tubérculos y plátanos']);
function carbFamily(name){const n=String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();if(n.includes('papa'))return'papa';if(n.includes('arroz'))return'arroz';if(n.includes('yuca'))return'yuca';if(n.includes('platano'))return'platano';if(n.includes('guineo'))return'guineo';if(n.includes('arepa'))return'arepa';if(n.includes('mazorca')||n.includes('maiz')||n.includes('tortilla')||n.includes('envuelto'))return'maiz';if(n.includes('avena'))return'avena';if(n.includes('quinua')||n.includes('quinoa'))return'quinua';if(n.includes('pasta')||n.includes('fideo'))return'pasta';if(n.includes('pan'))return'pan';if(n.includes('batata'))return'batata';return n}
function majorCarbs(r){return new Set((r.ingredients||[]).filter(i=>carbCats.has(i.category)&&(Number(i.qty)>=80||i.unit==='unidad')).map(i=>carbFamily(i.name)))}
for(const r of D.recipes){if(!r.ingredients?.length)fail(`${r.id} has no ingredients`);if(!r.steps)fail(`${r.id} has no preparation steps`);const c=majorCarbs(r);if(r.type==='Desayuno'&&c.size>1)fail(`${r.id} breakfast has ${c.size} major carb sources: ${[...c].join(', ')}`);if((r.type==='Almuerzo'||r.type==='Cena')&&c.size>2)fail(`${r.id} has ${c.size} major carb sources: ${[...c].join(', ')}`)}
for(let day=1;day<=30;day++){for(const t of ['Desayuno','Almuerzo','Cena'])if(!scheduled.find(r=>r.day===day&&r.type===t))fail(`Missing ${t} on day ${day}`)}
const lentil=D.recipes.filter(r=>String(`${r.name} ${r.protein} ${r.ingredientsText}`).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes('lentej')).length;if(lentil<20)fail(`Expected broad lentil coverage, got ${lentil}`);
const shopping=new Map();for(const r of scheduled)for(const i of r.ingredients||[]){const k=`${i.name}|${i.unit}`;shopping.set(k,(shopping.get(k)||0)+Number(i.qty||0))}if(shopping.size<40)fail('Shopping consolidation unexpectedly small');
console.log(`OK: ${D.recipes.length} unique recipes (${scheduled.length} scheduled + ${library.length} library), ${lentil} lentil recipes, ${shopping.size} scheduled shopping items, carbohydrate rules validated.`);
