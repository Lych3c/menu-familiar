(()=>{
'use strict';
const M=window.MF;if(!M)return;
const {D,$,$$,state,esc,norm,mealIcon,favButton,bindFav,bindRecipeButtons}=M;
const countries=[
 {name:'Italia',flag:'🇮🇹',note:'Mediterránea · vegetales, tomate, leguminosas, pasta y técnicas de salsa.'},
 {name:'Japón',flag:'🇯🇵',note:'Washoku adaptado · arroz, pescado, huevo, tofu, vegetales y cocciones precisas.'},
 {name:'México',flag:'🇲🇽',note:'Maíz, fríjol, tomate, aguacate, verduras y preparaciones familiares.'},
 {name:'Tailandia',flag:'🇹🇭',note:'Wok, hierbas aromáticas, lima, coco, arroz y equilibrio entre ácido, salado, dulce y picante suave.'},
 {name:'Corea del Sur',flag:'🇰🇷',note:'Arroz, verduras, fermentados, tofu, huevo y salteados con contrastes de textura.'},
 {name:'Perú',flag:'🇵🇪',note:'Papa, maíz, quinua, ajíes, pescado, hierbas y técnicas de salteado, escabeche y guiso.'}
];
function worldRecipes(){return D.recipes.filter(r=>r.world&&r.cuisine)}
function counts(){const out={};for(const c of countries)out[c.name]=worldRecipes().filter(r=>r.cuisine===c.name).length;return out}
function worldCard(r){return `<article class="recipe-card"><div class="v9-card-top"><span class="badge">Biblioteca · ${mealIcon(r.type)} ${esc(r.type)}</span><span class="origin-badge">${esc(r.origin||r.cuisine)}</span><span class="grow"></span>${favButton(r)}</div><div class="title">${esc(r.name)}</div><div class="sub">${esc(r.components||`${r.protein||''} · ${r.carb||''}`)}</div><div class="foot"><span>⏱️ ${r.time||'—'} min</span><button class="btn small secondary" data-recipe="${esc(r.id)}">Ver receta</button></div></article>`}
function renderAllWorld(){
 state.recipeQuery='';
 const allBtn=$('#recipes [data-v9-library="Todos"]');
 if(allBtn&&!allBtn.classList.contains('active')){allBtn.click();requestAnimationFrame(renderAllWorld);return}
 const search=$('#recipeSearch');if(search)search.value='';
 const list=$('#v9RecipeResults'),count=$('#v9RecipeCount'),rows=worldRecipes();
 if(list){list.innerHTML=rows.map(worldCard).join('');bindRecipeButtons(list);bindFav(list)}
 if(count)count.textContent=`${rows.length} resultados internacionales`;
 const strip=$('#recipes .v10-world-strip');strip?.scrollIntoView({block:'start',behavior:'smooth'});
}
function enhanceRecipes(){
 const root=$('#recipes');if(!root||root.querySelector('.v10-world-strip'))return;
 const search=$('#recipeSearch'),wrap=root.querySelector('.v9-search-wrap')||search;
 if(!search||!wrap)return;
 const n=counts(),perCountry=countries.length?Math.round(worldRecipes().length/countries.length):0;
 wrap.insertAdjacentHTML('afterend',`<section class="v10-world-strip" aria-label="Cocinas del mundo"><div class="v10-world-head"><div><b>🌍 Cocinas del mundo</b><span>${worldRecipes().length} recetas internacionales · ${countries.length} países · 6 desayunos, 6 almuerzos y 6 cenas por país.</span></div><button class="btn small secondary" type="button" data-world-clear>Ver todo</button></div><div class="v10-country-grid">${countries.map(c=>`<button class="v10-country" type="button" data-world-country="${esc(c.name)}"><span>${c.flag}</span><b>${esc(c.name)}</b><small>${n[c.name]||0} recetas</small></button>`).join('')}</div></section>`);
 $$('[data-world-country]').forEach(b=>b.onclick=()=>{search.value=b.dataset.worldCountry;search.dispatchEvent(new Event('input',{bubbles:true}));b.scrollIntoView({block:'nearest',behavior:'smooth'})});
 root.querySelector('[data-world-clear]')?.addEventListener('click',renderAllWorld);
}
const baseRecipes=M.renderers.recipes;M.renderers.recipes=()=>{baseRecipes?.();enhanceRecipes()};

function worldModal(id){
 const r=D.recipes.find(x=>x.id===id);if(!r?.world)return;
 const body=$('#recipeModalBody');if(!body||body.querySelector('.v10-cuisine-card'))return;
 const country=countries.find(c=>c.name===r.cuisine);
 const target=body.querySelector('.v9-detailed-prep')||body.querySelector('.steps');
 if(!target)return;
 target.insertAdjacentHTML('afterend',`<section class="card v10-cuisine-card"><div class="v10-cuisine-title"><span>${country?.flag||'🌍'}</span><div><h3>${esc(r.cuisine)}</h3><p>${esc(country?.note||'Cocina internacional adaptada al contexto familiar.')}</p></div></div><div class="v10-chef-tip"><b>👨‍🍳 Técnica destacada</b><p>${esc(r.chefTip||'Trabaja temperatura, textura y presentación con precisión, sin añadir complejidad innecesaria.')}</p></div><div class="sub">Adaptación familiar inspirada en esa tradición culinaria; no pretende reproducir de forma estrictamente regional cada preparación.</div></section>`);
}
const baseOpen=M.openRecipe;if(baseOpen)M.openRecipe=id=>{baseOpen(id);requestAnimationFrame(()=>requestAnimationFrame(()=>worldModal(id)))};
document.addEventListener('click',e=>{if(e.target.closest('#recipeModalBody [data-scale], #recipeModalBody [data-adapt]')){const title=$('#modalTitle')?.textContent,r=D.recipes.find(x=>x.name===title);if(r?.world)requestAnimationFrame(()=>requestAnimationFrame(()=>worldModal(r.id)))}});

function annotatePlan(){
 const root=$('#calendar');if(!root)return;
 root.querySelectorAll('.week-meal').forEach(row=>{if(row.querySelector('.v10-origin-mini'))return;const title=row.querySelector('b')?.textContent?.trim(),r=D.recipes.find(x=>x.name===title);if(!r?.world)return;const country=countries.find(c=>c.name===r.cuisine);row.querySelector('small')?.insertAdjacentHTML('beforeend',` <span class="v10-origin-mini">· ${country?.flag||'🌍'} ${esc(r.cuisine)}</span>`)});
}
const baseCalendar=M.renderers.calendar;M.renderers.calendar=()=>{baseCalendar?.();annotatePlan()};
const observer=new MutationObserver(()=>{if($('#calendar')?.classList.contains('active'))annotatePlan()});observer.observe(document.body,{subtree:true,childList:true});
})();
