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
 {name:'Perú',flag:'🇵🇪',note:'Papa, maíz, quinua, ajíes, pescado, hierbas y técnicas de salteado, escabeche y guiso.'},
 {name:'India',flag:'🇮🇳',note:'Leguminosas, especias aromáticas, yogur, arroz, verduras y currys familiares de intensidad moderada.'},
 {name:'España',flag:'🇪🇸',note:'Arroz, pescado, leguminosas, verduras, sofritos, plancha y cocina mediterránea cotidiana.'},
 {name:'Grecia',flag:'🇬🇷',note:'Yogur, limón, aceite de oliva, leguminosas, verduras, pescado y hierbas mediterráneas.'}
];
const styles=[
 {key:'wok',label:'🔥 Wok / salteado'},
 {key:'curry',label:'🍛 Curry'},
 {key:'pasta',label:'🍝 Pasta / fideos'},
 {key:'soup',label:'🥣 Sopas'},
 {key:'rice',label:'🍚 Arroz'},
 {key:'vegetarian',label:'🥬 Vegetariano'},
 {key:'fast',label:'⚡ Rápido ≤30 min'},
 {key:'chef',label:'👨‍🍳 Técnica chef'}
];
let worldState=(()=>{try{return Object.assign({enabled:false,country:'',style:''},JSON.parse(localStorage.getItem('mf_worldFilters')||'{}'))}catch{return{enabled:false,country:'',style:''}}})();
function saveWorld(){localStorage.setItem('mf_worldFilters',JSON.stringify(worldState))}
function worldRecipes(){return D.recipes.filter(r=>r.world&&r.cuisine)}
function counts(){const out={};for(const c of countries)out[c.name]=worldRecipes().filter(r=>r.cuisine===c.name).length;return out}
function recipeText(r){return norm(`${r.name} ${r.cuisine||''} ${r.origin||''} ${r.type||''} ${r.protein||''} ${r.carb||''} ${r.produce||''} ${r.steps||''} ${r.chefTip||''} ${(r.ingredients||[]).map(i=>i.name).join(' ')}`)}
function isVegetarian(r){const t=norm(`${r.protein||''} ${(r.ingredients||[]).map(i=>i.name).join(' ')}`);return !/(pollo|pechuga|muslo|res|carne|cerdo|lomo|pescado|tilapia|trucha|atun|salmon|camaron|marisco|langostino|anchov|merluza)/.test(t)}
function styleMatch(r,key){const t=recipeText(r),carb=norm(r.carb||''),chef=norm(r.chefTip||'');switch(key){
 case'wok':return /(wok|saltead|pad thai|yakisoba|japchae|lomo saltado|pad kra pao|stir fry)/.test(t);
 case'curry':return /(curry|korma|masala|dal|tikka)/.test(t);
 case'pasta':return /(pasta|fideo|soba|udon|noodle|yakisoba)/.test(`${t} ${carb}`);
 case'soup':return /(sopa|caldo|minestrone|pozole|tom yum|tom kha|gazpacho|jok|khao tom)/.test(t);
 case'rice':return /(arroz|risotto|donburi|bibimbap|oyakodon|fried rice|chaufa|tacu tacu|biryani|paella|khichdi)/.test(`${t} ${carb}`);
 case'vegetarian':return isVegetarian(r);
 case'fast':return Number(r.time||999)<=30;
 case'chef':return /(sell|desglas|emulsion|reduc|glase|monta|temperatura|al dente|pocha|dora por tandas|fuego alto|textura|wok|reposo|marina)/.test(chef);
 default:return true}}
function activeLibraryTab(){return $('#recipes [data-v9-library].active')?.dataset?.v9Library||'Todos'}
function worldCompatibleTab(tab){return['Todos','Favoritos','Desayuno','Almuerzo','Cena'].includes(tab)}
function worldCard(r){return `<article class="recipe-card"><div class="v9-card-top"><span class="badge">Biblioteca · ${mealIcon(r.type)} ${esc(r.type)}</span><span class="origin-badge">${esc(r.origin||r.cuisine)}</span><span class="grow"></span>${favButton(r)}</div><div class="title">${esc(r.name)}</div><div class="sub">${esc(r.components||`${r.protein||''} · ${r.carb||''}`)}</div><div class="foot"><span>⏱️ ${r.time||'—'} min</span><button class="btn small secondary" data-recipe="${esc(r.id)}">Ver receta</button></div></article>`}
function filteredWorld(){let rows=worldRecipes(),tab=activeLibraryTab();if(worldState.country)rows=rows.filter(r=>r.cuisine===worldState.country);if(worldState.style)rows=rows.filter(r=>styleMatch(r,worldState.style));if(tab==='Favoritos')rows=rows.filter(r=>state.favorites?.[r.id]);else if(['Desayuno','Almuerzo','Cena'].includes(tab))rows=rows.filter(r=>r.type===tab);const q=norm($('#recipeSearch')?.value||state.recipeQuery||'');if(q)rows=rows.filter(r=>recipeText(r).includes(q));return rows}
function summaryText(rows){const parts=[];if(worldState.country)parts.push(worldState.country);if(worldState.style)parts.push(styles.find(x=>x.key===worldState.style)?.label.replace(/^[^\p{L}\p{N}]+/u,'')||worldState.style);const tab=activeLibraryTab();if(['Desayuno','Almuerzo','Cena','Favoritos'].includes(tab))parts.push(tab);return `${rows.length} resultado${rows.length===1?'':'s'}${parts.length?` · ${parts.join(' · ')}`:''}`}
function syncWorldUi(rows){const root=$('#recipes');if(!root)return;root.querySelectorAll('[data-world-country]').forEach(b=>b.classList.toggle('active',worldState.country===b.dataset.worldCountry));root.querySelectorAll('[data-world-style]').forEach(b=>b.classList.toggle('active',worldState.style===b.dataset.worldStyle));const info=root.querySelector('[data-world-summary]');if(info)info.textContent=worldState.enabled?summaryText(rows):'Combina país, tipo de comida y técnica.';const exit=root.querySelector('[data-world-exit]');if(exit)exit.hidden=!worldState.enabled}
function renderWorldFiltered(scroll=false){if(!worldState.enabled)return;const tab=activeLibraryTab();if(!worldCompatibleTab(tab)){const all=$('#recipes [data-v9-library="Todos"]');if(all){all.click();requestAnimationFrame(()=>renderWorldFiltered(scroll))}return}const rows=filteredWorld(),list=$('#v9RecipeResults'),count=$('#v9RecipeCount');if(list){list.innerHTML=rows.length?rows.map(worldCard).join(''):'<div class="empty">No hay recetas internacionales que coincidan con esta combinación. Prueba quitando un filtro.</div>';bindRecipeButtons(list);bindFav(list)}if(count)count.textContent=summaryText(rows);syncWorldUi(rows);if(scroll)$('#recipes .v10-world-strip')?.scrollIntoView({block:'start',behavior:'smooth'})}
function resetSearch(){state.recipeQuery='';const search=$('#recipeSearch');if(search)search.value=''}
function showAllWorld(){worldState={enabled:true,country:'',style:''};saveWorld();resetSearch();const all=$('#recipes [data-v9-library="Todos"]');if(all&&!all.classList.contains('active')){all.click();requestAnimationFrame(()=>renderWorldFiltered(true));return}renderWorldFiltered(true)}
function exitWorld(){worldState={enabled:false,country:'',style:''};saveWorld();resetSearch();M.renderers.recipes?.()}
function selectCountry(name){worldState.enabled=true;worldState.country=worldState.country===name?'':name;saveWorld();resetSearch();const tab=activeLibraryTab();if(!worldCompatibleTab(tab)){$('#recipes [data-v9-library="Todos"]')?.click();return}renderWorldFiltered(false)}
function selectStyle(key){worldState.enabled=true;worldState.style=worldState.style===key?'':key;saveWorld();const tab=activeLibraryTab();if(!worldCompatibleTab(tab)){$('#recipes [data-v9-library="Todos"]')?.click();return}renderWorldFiltered(false)}
function enhanceRecipes(){
 const root=$('#recipes');if(!root||root.querySelector('.v10-world-strip'))return;
 const search=$('#recipeSearch'),wrap=root.querySelector('.v9-search-wrap')||search;if(!search||!wrap)return;
 const n=counts();
 wrap.insertAdjacentHTML('afterend',`<section class="v10-world-strip" aria-label="Cocinas del mundo"><div class="v10-world-head"><div><b>🌍 Cocinas del mundo</b><span>${worldRecipes().length} recetas internacionales · ${countries.length} países · filtros combinables.</span></div><div class="v10-world-actions"><button class="btn small secondary" type="button" data-world-clear>Ver todo</button><button class="btn small secondary" type="button" data-world-exit hidden>Biblioteca completa</button></div></div><div class="v10-country-grid">${countries.map(c=>`<button class="v10-country" type="button" data-world-country="${esc(c.name)}"><span>${c.flag}</span><b>${esc(c.name)}</b><small>${n[c.name]||0} recetas</small></button>`).join('')}</div><div class="v10-style-block"><b>Filtrar por técnica o estilo</b><div class="v10-style-filters">${styles.map(s=>`<button class="chip" type="button" data-world-style="${s.key}">${esc(s.label)}</button>`).join('')}</div><div class="v10-world-summary" data-world-summary>Combina país, tipo de comida y técnica.</div></div></section>`);
 root.querySelectorAll('[data-world-country]').forEach(b=>b.onclick=()=>selectCountry(b.dataset.worldCountry));
 root.querySelectorAll('[data-world-style]').forEach(b=>b.onclick=()=>selectStyle(b.dataset.worldStyle));
 root.querySelector('[data-world-clear]')?.addEventListener('click',showAllWorld);
 root.querySelector('[data-world-exit]')?.addEventListener('click',exitWorld);
 const baseInput=search.oninput;search.oninput=e=>{baseInput?.call(search,e);if(worldState.enabled)requestAnimationFrame(()=>renderWorldFiltered(false))};
 if(worldState.enabled)requestAnimationFrame(()=>renderWorldFiltered(false));else syncWorldUi([]);
}
const baseRecipes=M.renderers.recipes;M.renderers.recipes=()=>{baseRecipes?.();enhanceRecipes()};
function worldModal(id){const r=D.recipes.find(x=>x.id===id);if(!r?.world)return;const body=$('#recipeModalBody');if(!body||body.querySelector('.v10-cuisine-card'))return;const country=countries.find(c=>c.name===r.cuisine),target=body.querySelector('.v9-detailed-prep')||body.querySelector('.steps');if(!target)return;target.insertAdjacentHTML('afterend',`<section class="card v10-cuisine-card"><div class="v10-cuisine-title"><span>${country?.flag||'🌍'}</span><div><h3>${esc(r.cuisine)}</h3><p>${esc(country?.note||'Cocina internacional adaptada al contexto familiar.')}</p></div></div><div class="v10-chef-tip"><b>👨‍🍳 Técnica destacada</b><p>${esc(r.chefTip||'Trabaja temperatura, textura y presentación con precisión, sin añadir complejidad innecesaria.')}</p></div><div class="sub">Adaptación familiar inspirada en esa tradición culinaria; no pretende reproducir de forma estrictamente regional cada preparación.</div></section>`)}
const baseOpen=M.openRecipe;if(baseOpen)M.openRecipe=id=>{baseOpen(id);requestAnimationFrame(()=>requestAnimationFrame(()=>worldModal(id)))};
document.addEventListener('click',e=>{if(e.target.closest('#recipeModalBody [data-scale], #recipeModalBody [data-adapt]')){const title=$('#modalTitle')?.textContent,r=D.recipes.find(x=>x.name===title);if(r?.world)requestAnimationFrame(()=>requestAnimationFrame(()=>worldModal(r.id)))}});
function annotatePlan(){const root=$('#calendar');if(!root)return;root.querySelectorAll('.week-meal').forEach(row=>{if(row.querySelector('.v10-origin-mini'))return;const title=row.querySelector('b')?.textContent?.trim(),r=D.recipes.find(x=>x.name===title);if(!r?.world)return;const country=countries.find(c=>c.name===r.cuisine);row.querySelector('small')?.insertAdjacentHTML('beforeend',` <span class="v10-origin-mini">· ${country?.flag||'🌍'} ${esc(r.cuisine)}</span>`)})}
const baseCalendar=M.renderers.calendar;M.renderers.calendar=()=>{baseCalendar?.();annotatePlan()};
const observer=new MutationObserver(()=>{if($('#calendar')?.classList.contains('active'))annotatePlan()});observer.observe(document.body,{subtree:true,childList:true});
})();
