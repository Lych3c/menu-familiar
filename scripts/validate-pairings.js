const fs=require('fs'),vm=require('vm');global.window=global;
['data/base.js','data/v3-init.js','data/v3-breakfasts.js','data/v3-lunches.js','data/v3-dinners.js','data/components.js','data/culinary-extensions.js','data/component-expansion-v12.js','data/v4-library.js','data/v4-fixes.js','data/international-recipes.js','data/world-expansion-2.js','data/world-expansion-3.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(f,'utf8'),{filename:f}));
const D=global.MENU_APP_DATA,C=global.MF_COMPONENTS;
function fail(m){console.error('PAIRING VALIDATION ERROR:',m);process.exit(1)}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliases={pollo:['pollo','pechuga','muslo'],res:['res','carne de res','bistec','albondiga'],cerdo:['cerdo','lomo de cerdo'],pescado:['pescado','tilapia','trucha','atun','salmon','merluza','camarón','camaron'],huevo:['huevo'],tofu:['tofu'],lenteja:['lenteja'],frijol:['frijol','frijoles'],garbanzo:['garbanzo'],arveja:['arveja'],arroz:['arroz'],papa:['papa'],yuca:['yuca'],platano:['platano'],arepa:['arepa'],maiz:['maiz','mazorca','tortilla','polenta'],pasta:['pasta','fideo','soba','udon'],avena:['avena'],quinua:['quinua','quinoa'],pan:['pan','pita','roti'],batata:['batata','camote']};
function canonical(v){const n=norm(v);for(const [k,arr] of Object.entries(aliases))if(arr.some(a=>n===norm(a)||n.includes(norm(a))||norm(a).includes(n)))return k;return n}
function soupCarbs(s){return new Set((s.ingredients||[]).map(canonical).filter(x=>['arroz','papa','yuca','platano','arepa','maiz','pasta','avena','quinua','pan','batata','lenteja','frijol','garbanzo','arveja'].includes(x)))}
if(!D?.recipes?.length)fail('recipes missing');
if(!C?.sauces?.length||!C?.soups?.length||!(C.salads?.length||C.cookedVegetables?.length))fail('component catalogs missing');
let soupChecks=0;
for(const r of D.recipes){
 if(!(C.sauces||[]).some(s=>Array.isArray(s.pairs)&&s.pairs.length&&Array.isArray(s.uses)&&s.uses.length))fail(`${r.id}: no sauce catalog metadata`);
 if(![...(C.salads||[]),...(C.cookedVegetables||[])].length)fail(`${r.id}: no vegetable options`);
 if(r.type==='Desayuno')continue;
 const carb=canonical(r.carb),protein=canonical(r.protein);
 const candidates=(C.soups||[]).filter(s=>s.mealRole!=='plato completo').filter(s=>!(carb&&soupCarbs(s).has(carb))).filter(s=>!(s.containsProtein&&protein));
 if(!candidates.length)fail(`${r.id}: no compatible soup after redundancy filters (carb=${carb})`);
 if(candidates.some(s=>carb&&soupCarbs(s).has(carb)))fail(`${r.id}: redundant soup carb leaked through filter`);
 soupChecks++;
}
console.log(`OK: contextual pairings validated for ${D.recipes.length} recipes; ${soupChecks} lunch/dinner soup compatibility checks passed; ${C.sauces.length} sauces and ${C.salads.length+C.cookedVegetables.length} vegetable sides available.`);
