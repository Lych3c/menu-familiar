(()=>{
'use strict';
const M=window.MF,{D,$,$$,state,save,norm,esc,favButton,bindFav,bindRecipeButtons}=M;
const C=window.MF_COMPONENTS||{proteins:[],salads:[],cookedVegetables:[],carbs:[]};

const families={
  pollo:['pollo','pechuga de pollo','muslo de pollo','pollo sin piel'],
  res:['res','carne de res','carne molida de res','carne de res magra','carne de res para desmechar','carne molida de res magra','carne de res magra en tiras'],
  cerdo:['cerdo','lomo de cerdo'],
  pescado:['pescado','tilapia','trucha','filete de pescado','filete de pescado blanco','filete de tilapia','filete de trucha','atun','atún'],
  huevo:['huevo','huevos'],
  frijol:['frijol','fríjol','frijoles','fríjoles','frijol cargamanto','fríjol cargamanto','frijol blanco','fríjol blanco'],
  lenteja:['lenteja','lentejas','lenteja seca'],garbanzo:['garbanzo','garbanzos','garbanzo seco'],arveja:['arveja','arvejas','arveja seca'],
  arroz:['arroz','arroz integral','arroz cocido','arroz integral cocido'],papa:['papa','papa criolla','papa pastusa','papa sabanera'],
  yuca:['yuca'],platano:['platano','plátano','platano verde','plátano verde','platano maduro','plátano maduro'],
  arepa:['arepa','arepa de maiz','arepa de maíz','arepa integral','arepa integral de maiz','arepa integral de maíz','arepa santandereana','arepa de chocolo','arepa de maiz grande','arepa de maíz grande'],
  maiz:['maiz','maíz','mazorca','maiz tierno','maíz tierno','tortilla de maiz','tortilla de maíz','envuelto de mazorca'],
  avena:['avena','avena en hojuelas'],quinua:['quinua','quinoa'],pan:['pan','pan integral'],pasta:['pasta','pasta integral','fideos','fideos integrales'],
  champinon:['champiñon','champiñón','champinones','champiñones'],coliflor:['coliflor'],
  guasca:['guasca','guascas'],hierbas:['hierba','hierbas','hierbas secas','perejil','cilantro']
};
const familyIndex={};Object.entries(families).forEach(([f,terms])=>terms.forEach(t=>familyIndex[norm(t)]=f));
const familyTerms=Object.entries(familyIndex).sort((a,b)=>b[0].length-a[0].length);
const hasTerm=(text,term)=>(' '+norm(text)+' ').includes(' '+norm(term)+' ');
function familyOf(v){const n=norm(v);if(familyIndex[n])return familyIndex[n];for(const [term,fam] of familyTerms){if(hasTerm(n,term))return fam}return n}
function sameIngredient(a,b){const na=norm(a),nb=norm(b);if(!na||!nb)return false;if(na===nb)return true;const fa=familyOf(na),fb=familyOf(nb);if(fa&&fa===fb)return true;return hasTerm(na,nb)||hasTerm(nb,na)}
function pantryEntries(){return Object.values(state.pantry||{})}
function isProteinName(v){return ['pollo','res','cerdo','pescado','huevo','frijol','lenteja','garbanzo','arveja'].includes(familyOf(v))}
function isLegume(v){return ['frijol','lenteja','garbanzo','arveja'].includes(familyOf(v))}
function weight(i){const c=i.category||'';if(c==='Proteínas'||c==='Leguminosas')return 6;if(c==='Cereales y derivados'||c==='Tubérculos y plátanos')return 4;if(c==='Verduras/hortalizas')return 2;if(c==='Frutas')return 1;if(c==='Lácteos')return 1;if(c==='Grasas')return .8;return .3}
function core(r){return (r.ingredients||[]).filter(i=>!['Condimentos','Bebidas'].includes(i.category||''))}
function allComponents(){return [...(C.proteins||[]),...(C.salads||[]),...(C.cookedVegetables||[]),...(C.carbs||[])]}

const vocab=(()=>{
  const map=new Map();
  const add=x=>{const k=norm(x);if(k&&!map.has(k))map.set(k,String(x))};
  Object.values(families).flat().forEach(add);
  D.recipes.forEach(r=>(r.ingredients||[]).forEach(i=>add(i.name)));
  allComponents().forEach(x=>(x.ingredients||[]).forEach(add));
  return [...map.entries()].sort((a,b)=>b[0].length-a[0].length);
})();

let intent=(()=>{try{return JSON.parse(localStorage.getItem('mf_pantryIntent'))||{meal:'Cualquiera',maxTime:null}}catch{return{meal:'Cualquiera',maxTime:null}}})();
let exploreQuery='';
let builderTab='lunches';
let pantryDraft='';
let plate=(()=>{try{const p=JSON.parse(localStorage.getItem('mf_plate'))||{};return{protein:p.protein||'',vegetable:p.vegetable||p.salad||'',carb:p.carb||''}}catch{return{protein:'',vegetable:'',carb:''}}})();
function saveIntent(){localStorage.setItem('mf_pantryIntent',JSON.stringify(intent));localStorage.setItem('mf_plate',JSON.stringify(plate))}

function extractNatural(text){
  const raw=String(text||''),n=norm(raw),found=[],used=new Set();
  for(const [term,label] of vocab){
    if(!hasTerm(n,term))continue;
    const fam=familyOf(term),key=['pollo','res','cerdo','pescado','huevo','frijol','lenteja','garbanzo','arveja','arroz','papa','yuca','platano','arepa','maiz','avena','quinua','pan','pasta','guasca','hierbas','champinon','coliflor'].includes(fam)?fam:term;
    if(used.has(key))continue;
    found.push(label);used.add(key);
  }
  let meal='Cualquiera';if(hasTerm(n,'desayuno'))meal='Desayuno';else if(hasTerm(n,'almuerzo'))meal='Almuerzo';else if(hasTerm(n,'cena'))meal='Cena';
  const tm=n.match(/(?:maximo|max|en)?\s*(\d{1,3})\s*(?:min|minuto|minutos)/);const maxTime=tm?Number(tm[1]):null;
  if(!found.length){
    raw.split(/[,;\n]+/).map(x=>x.replace(/^(tengo|hay|cuento con|dispongo de|quiero|quisiera|usar|usare|usaré)\s+/i,'').trim()).filter(x=>x&&x.split(/\s+/).length<=4&&!/^(hazme|prepara|quiero una|quiero un)/i.test(x)).forEach(x=>found.push(x));
  }
  return{ingredients:[...new Set(found)],meal,maxTime};
}
function addIngredients(text){const x=extractNatural(text);x.ingredients.forEach(name=>{const key=norm(name);if(key)state.pantry[key]={name,category:'Ingresado por usuario',qty:'',unit:'',priority:false}});intent={meal:x.meal,maxTime:x.maxTime};save();saveIntent();return x}
function removeIngredient(key){delete state.pantry[key];save();M.renderers.pantry()}
function clearPantry(){state.pantry={};intent={meal:'Cualquiera',maxTime:null};save();saveIntent();M.renderers.pantry()}

function recipeContains(r,q){const nq=norm(q);if(!nq)return true;const fq=familyOf(nq);if(['pollo','res','cerdo','pescado','huevo','frijol','lenteja','garbanzo','arveja','arroz','papa','yuca','platano','arepa','maiz','avena','quinua','pan','pasta'].includes(fq))return (r.ingredients||[]).some(i=>familyOf(i.name)===fq)||familyOf(r.protein)===fq||familyOf(r.carb)===fq;return norm(`${r.name} ${r.protein} ${r.carb} ${r.produce} ${(r.ingredients||[]).map(i=>i.name).join(' ')}`).includes(nq)}
function match(r){
  const entered=pantryEntries(),selectedProteins=entered.filter(x=>isProteinName(x.name)),c=core(r);
  const matched=c.filter(i=>entered.some(p=>sameIngredient(p.name,i.name))),missing=c.filter(i=>!entered.some(p=>sameIngredient(p.name,i.name)));
  const totalWeight=c.reduce((a,i)=>a+weight(i),0),haveWeight=matched.reduce((a,i)=>a+weight(i),0);
  const pantryUsed=entered.filter(p=>c.some(i=>sameIngredient(p.name,i.name))).length;
  const completion=totalWeight?haveWeight/totalWeight:0,utilization=entered.length?pantryUsed/entered.length:0;
  let score=Math.round((completion*.62+utilization*.38)*100);
  const proteinMatch=selectedProteins.length===0||c.some(i=>selectedProteins.some(p=>sameIngredient(p.name,i.name)))||selectedProteins.some(p=>familyOf(r.protein)===familyOf(p.name));
  const selectedFamilies=new Set(entered.map(x=>familyOf(x.name))),principalHits=[familyOf(r.protein),familyOf(r.carb)].filter(f=>selectedFamilies.has(f)).length;
  score=Math.min(100,score+principalHits*7);
  return{r,score,missing,matched,proteinMatch,pantryUsed};
}
function ranked(meal=intent.meal||'Cualquiera',maxTime=intent.maxTime){
  const count=pantryEntries().length;if(!count)return[];const minHits=count>=4?2:1;
  return D.recipes.map(match).filter(x=>(meal==='Cualquiera'||x.r.type===meal)).filter(x=>!maxTime||!x.r.time||x.r.time<=maxTime).filter(x=>x.proteinMatch).filter(x=>x.matched.length>=minHits).filter(x=>x.missing.length<=state.maxMissing).sort((a,b)=>b.score-a.score||b.pantryUsed-a.pantryUsed||a.missing.length-b.missing.length||(a.r.time||999)-(b.r.time||999)).slice(0,18)
}
function chips(){const rows=pantryEntries();if(!rows.length)return '<div class="empty compact-empty">Aún no has registrado ingredientes.</div>';return `<div class="pantry-chips">${rows.map(x=>`<span class="pantry-chip">${esc(x.name)} <button type="button" data-remove-pantry="${esc(norm(x.name))}" aria-label="Quitar ${esc(x.name)}">×</button></span>`).join('')}</div>`}
function intentSummary(){const bits=[];if(intent.meal&&intent.meal!=='Cualquiera')bits.push(`comida: ${intent.meal}`);if(intent.maxTime)bits.push(`máximo ${intent.maxTime} min`);if(!bits.length)return '';return `<div class="intent-ok">Interpreté también: ${bits.map(esc).join(' · ')}</div>`}
function resultCards(list){if(!list.length)return `<div class="empty">No encontré una receta suficientemente compatible${intent.meal&&intent.meal!=='Cualquiera'?` para ${esc(intent.meal.toLowerCase())}`:''}. Revisa los ingredientes interpretados o permite más faltantes.</div>`;return list.map(x=>`<article class="result-card"><div style="display:flex;gap:8px;align-items:center"><span class="score">${x.score}% compatible</span><span class="missing">${x.missing.length?`Faltan ${x.missing.length}`:'Lista para cocinar'}</span><span class="grow"></span>${favButton(x.r)}</div><div class="title">${esc(x.r.name)}</div><div class="sub">${esc(x.r.type)} · ${x.r.time||'—'} min · usa ${x.pantryUsed}/${pantryEntries().length} de tus ingredientes registrados</div>${x.matched.length?`<div class="sub"><b>Coincide:</b> ${x.matched.slice(0,7).map(i=>esc(i.name)).join(', ')}</div>`:''}${x.missing.length?`<div class="sub"><b>Falta:</b> ${x.missing.slice(0,7).map(i=>esc(i.name)).join(', ')}</div>`:''}<div class="foot"><span></span><button class="btn small secondary" data-recipe="${esc(x.r.id)}">Ver receta</button></div></article>`).join('')}

function componentPool(type){
  if(type==='vegetables')return [...(C.salads||[]).map(x=>({...x,_kind:'Ensalada'})),...(C.cookedVegetables||[]).map(x=>({...x,_kind:'Verdura cocida'}))];
  return C[type]||[];
}
function componentScore(item){const entered=pantryEntries(),ings=item.ingredients||[],matched=ings.filter(i=>entered.some(p=>sameIngredient(p.name,i))),missing=ings.filter(i=>!entered.some(p=>sameIngredient(p.name,i)));return{item,matched,missing,score:ings.length?Math.round(matched.length/ings.length*100):0}}
function componentRelevant(item,q){if(!q)return true;const fq=familyOf(q);return familyOf(item.name)===fq||(item.tags||[]).some(t=>familyOf(t)===fq||norm(t).includes(norm(q)))||(item.ingredients||[]).some(i=>familyOf(i)===fq||norm(i).includes(norm(q)))||norm(item.name).includes(norm(q))}
function componentList(type,q='',limit=20){return componentPool(type).filter(x=>componentRelevant(x,q)).map(componentScore).sort((a,b)=>b.score-a.score||a.missing.length-b.missing.length||a.item.name.localeCompare(b.item.name,'es')).slice(0,limit)}
function plateKeyForType(type){return type==='proteins'?'protein':type==='vegetables'?'vegetable':'carb'}
function componentCard(x,type){const key=plateKeyForType(type),chosen=plate[key]===x.item.id;return `<article class="component-card ${chosen?'chosen':''}"><div class="component-top"><div><b>${esc(x.item.name)}</b>${x.item._kind?`<div class="sub">${esc(x.item._kind)}</div>`:''}<div class="sub">${x.score}% con tu despensa · ${x.missing.length?`faltan ${x.missing.length}`:'completo'}</div></div><button class="btn small ${chosen?'primary':'secondary'}" data-pick-component="${type}|${esc(x.item.id)}">${chosen?'Elegido ✓':'Elegir'}</button></div><div class="component-ings">${(x.item.ingredients||[]).map(i=>`<span class="mini-chip ${x.matched.some(m=>sameIngredient(m,i))?'have':'need'}">${esc(i)}</span>`).join('')}</div></article>`}
function getComponent(type,id){return componentPool(type).find(x=>x.id===id)}
function plateData(){const p=getComponent('proteins',plate.protein),v=getComponent('vegetables',plate.vegetable),c=getComponent('carbs',plate.carb),selected=[p,v,c].filter(Boolean),req=[...new Set(selected.flatMap(x=>x.ingredients||[]))],missing=req.filter(i=>!pantryEntries().some(p=>sameIngredient(p.name,i)));return{p,v,c,selected,req,missing}}
function plateSummary(){const {p,v,c,selected,missing}=plateData();if(!selected.length)return '<div class="sub">Elige una proteína, un componente vegetal —ensalada o verdura cocida— y un carbohidrato para armar tu almuerzo.</div>';return `<div class="plate-summary"><div><b>Proteína:</b> ${esc(p?.name||'—')}</div><div><b>Vegetal:</b> ${esc(v?.name||'—')}</div><div><b>Carbohidrato:</b> ${esc(c?.name||'—')}</div><div class="sub" style="margin-top:7px">${missing.length?`Te faltarían: ${missing.map(esc).join(', ')}.`:'Tienes en despensa todos los ingredientes base de esta combinación.'}</div>${missing.length?'<button class="btn small secondary" id="addMissingShopping" style="margin-top:10px">Añadir faltantes a compras</button>':''}</div>`}
function addMissingToShopping(){const {missing}=plateData();missing.forEach(name=>{const k=norm(name);if(k)state.extraShopping[k]={ingredient:name,category:'Añadido desde constructor',unit:'',qty:'',note:'Constructor de almuerzo'}});save();M.renderers.pantry()}

function queryRecipes(q){if(!q)return[];return D.recipes.filter(r=>recipeContains(r,q)).sort((a,b)=>a.type.localeCompare(b.type,'es')||(a.time||999)-(b.time||999)).slice(0,30)}
function recipeSearchCards(rows){if(!rows.length)return '<div class="empty compact-empty">No encontré recetas con ese ingrediente todavía.</div>';return `<div class="recipe-list compact-list">${rows.map(r=>`<article class="recipe-card"><div class="badge">${r.day?`Día ${r.day}`:'Biblioteca'} · ${esc(r.type)} · ${r.time||'—'} min</div><div class="title">${esc(r.name)}</div><div class="sub">Proteína: ${esc(r.protein)} · carbohidrato: ${esc(r.carb)}</div><button class="btn small secondary" data-recipe="${esc(r.id)}">Ver receta</button></article>`).join('')}</div>`}
function exploreRecommendations(){
  if(!exploreQuery)return '';
  const rows=queryRecipes(exploreQuery),legume=isLegume(exploreQuery);
  const veg=componentList('vegetables','',6),carbs=componentList('carbs','',5),proteins=componentList('proteins','',6).filter(x=>!componentRelevant(x.item,exploreQuery));
  return `<div class="card" style="margin-top:14px"><h3>Recetas con “${esc(exploreQuery)}”</h3>${recipeSearchCards(rows)}${legume?'<div class="notice" style="margin-top:12px"><b>Nota:</b> las leguminosas ya aportan proteína vegetal. Una proteína animal adicional es opcional; prioriza un componente vegetal y una porción moderada de cereal o tubérculo.</div>':''}<h3 style="margin-top:18px">🥬 Vegetales recomendados</h3><p class="sub">Incluye ensaladas y también verduras salteadas, al vapor, asadas o guisadas.</p><div class="component-grid">${veg.map(x=>componentCard(x,'vegetables')).join('')}</div><h3 style="margin-top:18px">🍚 Carbohidratos para completar</h3><div class="component-grid">${carbs.map(x=>componentCard(x,'carbs')).join('')}</div><h3 style="margin-top:18px">🥩 Proteína adicional ${legume?'(opcional)':''}</h3><div class="component-grid">${proteins.slice(0,5).map(x=>componentCard(x,'proteins')).join('')}</div></div>`
}
function browseContent(){
  if(builderTab==='lunches'){
    let rows=D.recipes.filter(r=>r.type==='Almuerzo');if(exploreQuery)rows=rows.filter(r=>recipeContains(r,exploreQuery));if(pantryEntries().length)rows=rows.map(match).sort((a,b)=>b.score-a.score||b.pantryUsed-a.pantryUsed).map(x=>x.r);return recipeSearchCards(rows.slice(0,20));
  }
  const type=builderTab==='proteins'?'proteins':builderTab==='vegetables'?'vegetables':'carbs';return `<div class="component-grid">${componentList(type,exploreQuery,28).map(x=>componentCard(x,type)).join('')}</div>`
}

function closeAi(){const modal=$('#aiModal');modal?.classList.remove('open');document.body.style.overflow=''}
function openAssistant(){
  const list=ranked().slice(0,7),body=$('#aiModalBody');if(!body)return;
  body.innerHTML=`<div class="modal-head"><div><span class="badge">Asistente local</span><h2 id="aiModalTitle">¿Qué puedo cocinar?</h2></div><span class="grow"></span><button class="btn secondary modal-close-text" type="button" data-close-ai>Cerrar ×</button></div><p class="sub">Estas propuestas se calculan con las ${D.recipes.length} recetas de la biblioteca y los ingredientes de tu despensa. La IA generativa todavía no está conectada.</p>${resultCards(list)}`;
  $('#aiModal').classList.add('open');document.body.style.overflow='hidden';bindAiClosers();bindRecipeButtons(body);bindFav(body)
}
function bindAiClosers(){$$('[data-close-ai]').forEach(el=>el.onclick=closeAi)}

M.renderers.pantry=()=>{
 const suggestions=ranked();
 $('#pantry').innerHTML=`
 <div class="section-title"><div><h2>Despensa inteligente</h2><p>Escribe ingredientes o una frase natural. La app extrae lo que tienes y busca combinaciones coherentes.</p></div></div>
 <div class="card"><h3>¿Qué ingredientes tienes?</h3><p class="sub">Ejemplos: <b>pollo, arroz, guascas, plátano verde, tomate</b> o “Tengo pollo y arroz; quiero una cena en 35 minutos”.</p><textarea id="pantryInput" class="search" rows="4" placeholder="Escribe aquí...">${esc(pantryDraft)}</textarea><div class="hero-actions" style="margin-top:10px"><button class="btn primary" id="analyzePantry">Interpretar y analizar</button><button class="btn secondary" id="clearPantry">Vaciar despensa</button></div>${intentSummary()}<h4 style="margin-bottom:8px">Ingredientes registrados (${pantryEntries().length})</h4>${chips()}</div>
 <div class="card" style="margin-top:12px"><h3>✨ ¿Qué puedo cocinar?</h3><p class="sub">La proteína y los ingredientes principales pesan más en el ranking. También se valora cuántos de tus ingredientes utiliza realmente cada receta.</p><div class="shopping-head"><select id="maxMissing" class="field"><option value="0" ${state.maxMissing===0?'selected':''}>Sin comprar ingredientes</option><option value="1" ${state.maxMissing===1?'selected':''}>Puede faltar 1</option><option value="2" ${state.maxMissing===2?'selected':''}>Pueden faltar 2</option><option value="3" ${state.maxMissing===3?'selected':''}>Pueden faltar 3</option><option value="5" ${state.maxMissing===5?'selected':''}>Pueden faltar 5</option></select><span class="grow"></span><button class="btn primary" id="assistantBtn">Asistente culinario</button></div></div>
 <h2 style="margin-top:20px">Recetas compatibles</h2><p class="sub">Coincidencia ponderada entre proteína, carbohidrato, verduras y aprovechamiento de la despensa.</p><div>${resultCards(suggestions)}</div>
 <div class="card" style="margin-top:18px"><h3>🔎 Quiero cocinar con...</h3><p class="sub">Busca un ingrediente sin modificar tu despensa. Ejemplo: lentejas.</p><div class="shopping-head"><input id="exploreInput" class="search" type="search" autocomplete="off" placeholder="Ej.: lentejas, pollo, yuca..." value="${esc(exploreQuery)}"><button class="btn primary" id="exploreBtn">Buscar</button></div></div>
 ${exploreRecommendations()}
 <div class="card" style="margin-top:18px"><h2>Constructor de almuerzos</h2><p class="sub">Arma un plato con proteína + componente vegetal + carbohidrato. El componente vegetal puede ser una ensalada o una preparación cocida.</p><div class="chips"><button class="chip ${builderTab==='lunches'?'active':''}" data-builder-tab="lunches">Almuerzos</button><button class="chip ${builderTab==='proteins'?'active':''}" data-builder-tab="proteins">Proteínas</button><button class="chip ${builderTab==='vegetables'?'active':''}" data-builder-tab="vegetables">Vegetales</button><button class="chip ${builderTab==='carbs'?'active':''}" data-builder-tab="carbs">Carbohidratos</button></div><div style="margin-top:12px">${browseContent()}</div><h3 style="margin-top:18px">Mi almuerzo</h3>${plateSummary()}</div>`;

 const input=$('#pantryInput');if(input)input.oninput=e=>pantryDraft=e.target.value;
 $('#analyzePantry').onclick=()=>{const x=addIngredients(input?.value||'');pantryDraft=input?.value||'';M.renderers.pantry()};
 $('#clearPantry').onclick=clearPantry;
 $('#maxMissing').onchange=e=>{state.maxMissing=Number(e.target.value);save();M.renderers.pantry()};
 $('#assistantBtn').onclick=openAssistant;
 $('#exploreBtn').onclick=()=>{exploreQuery=$('#exploreInput').value.trim();M.renderers.pantry()};
 $('#exploreInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();exploreQuery=e.target.value.trim();M.renderers.pantry()}};
 $$('[data-remove-pantry]').forEach(b=>b.onclick=()=>removeIngredient(b.dataset.removePantry));
 $$('[data-builder-tab]').forEach(b=>b.onclick=()=>{builderTab=b.dataset.builderTab;M.renderers.pantry()});
 $$('[data-pick-component]').forEach(b=>b.onclick=()=>{const [type,id]=b.dataset.pickComponent.split('|'),key=plateKeyForType(type);plate[key]=plate[key]===id?'':id;saveIntent();M.renderers.pantry()});
 $('#addMissingShopping')&&($('#addMissingShopping').onclick=addMissingToShopping);
 bindRecipeButtons($('#pantry'));bindFav($('#pantry'));bindAiClosers();
};

bindAiClosers();document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAi()});
})();
