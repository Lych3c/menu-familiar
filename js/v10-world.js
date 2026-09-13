(()=>{
'use strict';
const M=window.MF;if(!M)return;
const {D,$,$$,state,esc,norm}=M;
const countries=[
 {name:'Italia',flag:'🇮🇹',note:'Mediterránea · vegetales, tomate, leguminosas, pasta y técnicas de salsa.'},
 {name:'Japón',flag:'🇯🇵',note:'Washoku adaptado · arroz, pescado, huevo, tofu, vegetales y cocciones precisas.'},
 {name:'México',flag:'🇲🇽',note:'Maíz, fríjol, tomate, aguacate, verduras y preparaciones familiares.'}
];
function worldRecipes(){return D.recipes.filter(r=>r.world&&r.cuisine)}
function counts(){const out={};for(const c of countries)out[c.name]=worldRecipes().filter(r=>r.cuisine===c.name).length;return out}
function enhanceRecipes(){
 const root=$('#recipes');if(!root||root.querySelector('.v10-world-strip'))return;
 const search=$('#recipeSearch'),wrap=root.querySelector('.v9-search-wrap')||search;
 if(!search||!wrap)return;
 const n=counts();
 wrap.insertAdjacentHTML('afterend',`<section class="v10-world-strip" aria-label="Cocinas del mundo"><div class="v10-world-head"><div><b>🌍 Cocinas del mundo</b><span>${worldRecipes().length} recetas internacionales · 6 desayunos, 6 almuerzos y 6 cenas por país.</span></div><button class="btn small secondary" type="button" data-world-clear>Ver todo</button></div><div class="v10-country-grid">${countries.map(c=>`<button class="v10-country" type="button" data-world-country="${esc(c.name)}"><span>${c.flag}</span><b>${esc(c.name)}</b><small>${n[c.name]||0} recetas</small></button>`).join('')}</div></section>`);
 $$('[data-world-country]').forEach(b=>b.onclick=()=>{search.value=b.dataset.worldCountry;search.dispatchEvent(new Event('input',{bubbles:true}));b.scrollIntoView({block:'nearest',behavior:'smooth'})});
 root.querySelector('[data-world-clear]')?.addEventListener('click',()=>{search.value='';search.dispatchEvent(new Event('input',{bubbles:true}))});
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
