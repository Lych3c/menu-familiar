(()=>{
'use strict';
const M=window.MF,{D,$,$$,state,save,norm,esc,favButton,bindFav,bindRecipeButtons}=M;
const C=window.MF_COMPONENTS||{proteins:[],salads:[],carbs:[]};

const families={
  pollo:['pollo','pechuga de pollo','muslo de pollo','muslo pechuga de pollo sin piel','pollo sin piel'],
  res:['res','carne de res','carne molida de res','carne de res magra','carne de res para desmechar','carne molida de res magra','carne de res magra en tiras'],
  cerdo:['cerdo','lomo de cerdo'],
  pescado:['pescado','tilapia','trucha','filete de pescado','filete de pescado blanco','filete de tilapia','filete de trucha','atun','atún'],
  huevo:['huevo','huevos'],frijol:['frijol','fríjol','frijoles','fríjoles','frijol cargamanto','fríjol cargamanto','frijol blanco','fríjol blanco'],
  lenteja:['lenteja','lentejas','lenteja seca'],garbanzo:['garbanzo','garbanzos','garbanzo seco'],arveja:['arveja','arvejas','arveja seca'],
  arroz:['arroz','arroz integral','arroz cocido','arroz integral cocido'],papa:['papa','papa criolla','papa pastusa','papa sabanera'],
  yuca:['yuca'],platano:['platano','plátano','platano verde','plátano verde','platano maduro','plátano maduro'],
  arepa:['arepa','arepa de maiz','arepa de maíz','arepa integral','arepa integral de maiz','arepa integral de maíz','arepa santandereana','arepa de chocolo','arepa de maiz grande','arepa de maíz grande'],
  maiz:['maiz','maíz','mazorca','maiz tierno','maíz tierno','tortilla de maiz','tortilla de maíz','envuelto de mazorca'],
  avena:['avena','avena en hojuelas'],quinua:['quinua','quinoa'],pan:['pan','pan integral'],pasta:['pasta','pasta integral','fideos','fideos integrales'],
  guasca:['guasca','guascas'],hierbas:['hierba','hierbas','hierbas secas','perejil','cilantro']
};
const familyIndex={};Object.entries(families).forEach(([f,terms])=>terms.forEach(t=>familyIndex[norm(t)]=f));
const familyTerms=Object.entries(familyIndex).sort((a,b)=>b[0].length-a[0].length);
const hasTerm=(text,term)=>(' '+norm(text)+' ').includes(' '+norm(term)+' ');
function familyOf(v){const n=norm(v);if(familyIndex[n])return familyIndex[n];for(const [term,fam] of familyTerms){if(hasTerm(n,term))return fam}return n}
function sameIngredient(a,b){const na=norm(a),nb=norm(b);if(!na||!nb)return false;if(na===nb)return true;const fa=familyOf(na),fb=familyOf(nb);if(fa&&fa===fb)return true;return hasTerm(na,nb)||hasTerm(nb,na)}
function pantryEntries(){return Object.values(state.pantry||{})}
function isProteinName(v){return ['pollo','res','cerdo','pescado','huevo','frijol','lenteja','garbanzo','arveja'].includes(familyOf(v))}
function weight(i){const c=i.category||'';if(c==='Proteínas'||c==='Leguminosas')return 5;if(c==='Cereales y derivados'||c==='Tubérculos y plátanos')return 3.5;if(c==='Verduras/hortalizas')return 1.6;if(c==='Frutas')return 1;if(c==='Lácteos')return 1;if(c==='Grasas')return .6;return .25}
function core(r){return (r.ingredients||[]).filter(i=>!['Condimentos','Bebidas'].includes(i.category||''))}

const vocab=(()=>{
  const map=new Map();
  const add=x=>{const k=norm(x);if(k&&!map.has(k))map.set(k,String(x))};
  Object.values(families).flat().forEach(add);
  D.recipes.forEach(r=>(r.ingredients||[]).forEach(i=>add(i.name)));
  [...C.proteins,...C.salads,...C.carbs].forEach(x=>(x.ingredients||[]).forEach(add));
  return [...map.entries()].sort((a,b)=>b[0].length-a[0].length);
})();

let intent=(()=>{try{return JSON.parse(localStorage.getItem('mf_pantryIntent'))||{meal:'Cualquiera',maxTime:null}}catch{return{meal:'Cualquiera',maxTime:null}}})();
let exploreQuery='';
let builderTab='lunches';
let plate=(()=>{try{return JSON.parse(localStorage.getItem('mf_plate'))||{protein:'',salad:'',carb:''}}catch{return{protein:'',salad:'',carb:''}}})();
function saveIntent(){localStorage.setItem('mf_pantryIntent',JSON.stringify(intent));localStorage.setItem('mf_plate',JSON.stringify(plate))}

function extractNatural(text){
  const raw=String(text||''),n=norm(raw),found=[],usedFamilies=new Set(),usedNames=new Set();
  for(const [term,label] of vocab){
    if(!hasTerm(n,term))continue;
    const fam=familyOf(term),dedupeKey=['pollo','res','cerdo','pescado','huevo','frijol','lenteja','garbanzo','arveja','arroz','papa','yuca','platano','arepa','maiz','avena','quinua','pan','pasta','guasca','hierbas'].includes(fam)?fam:term;
    if(usedFamilies.has(dedupeKey)||usedNames.has(term))continue;
    found.push(label);usedFamilies.add(dedupeKey);usedNames.add(term);
  }
  let meal='Cualquiera';if(hasTerm(n,'desayuno'))meal='Desayuno';else if(hasTerm(n,'almuerzo'))meal='Almuerzo';else if(hasTerm(n,'cena'))meal='Cena';
  const tm=n.match(/(?:maximo|max|en)?\s*(\d{1,3})\s*(?:min|minuto|minutos)/);const maxTime=tm?Number(tm[1]):null;
  if(!found.length){
    raw.split(/[,;\n]+/).map(x=>x.replace(/^(tengo|hay|cuento con|dispongo de|quiero|quisiera|usar|usaré)\s+/i,'').trim()).filter(x=>x&&x.split(/\s+/).length<=4).forEach(x=>found.push(x));
  }
  return{ingredients:[...new Set(found)],meal,maxTime};
}
function addIngredients(text){const x=extractNatural(text);x.ingredients.forEach(name=>{const key=norm(name);if(key)state.pantry[key]={name,category:'Ingresado por usuario',qty:'',unit:'',priority:false}});intent={meal:x.meal,maxTime:x.maxTime};save();saveIntent();return x}
function removeIngredient(key){delete state.pantry[key];save();M.renderers.pantry()}

function recipeContains(r,q){const nq=norm(q);if(!nq)return true;const fq=familyOf(nq);if(['pollo','res','cerdo','pescado','huevo','frijol','lenteja','garbanzo','arveja','arroz','papa','yuca','platano','arepa','maiz','avena','quinua','pan','pasta'].includes(fq))return (r.ingredients||[]).some(i=>familyOf(i.name)===fq)||familyOf(r.protein)===fq||familyOf(r.carb)===fq;return norm(`${r.name} ${r.protein} ${r.carb} ${r.produce} ${(r.ingredients||[]).map(i=>i.name).join(' ')}`).includes(nq)}
function match(r){
  const entered=pantryEntries(),selectedProteins=entered.filter(x=>isProteinName(x.name)),c=core(r),matched=c.filter(i=>entered.some(p=>sameIngredient(p.name,i.name))),missing=c.filter(i=>!entered.some(p=>sameIngredient(p.name,i.name))),totalWeight=c.reduce((a,i)=>a+weight(i),0),haveWeight=matched.reduce((a,i)=>a+weight(i),0);let score=totalWeight?Math.round(haveWeight/totalWeight*100):0;
  const proteinMatch=selectedProteins.length===0||c.some(i=>selectedProteins.some(p=>sameIngredient(p.name,i.name)))||selectedProteins.some(p=>familyOf(r.protein)===familyOf(p.name));
  const selectedFamilies=new Set(entered.map(x=>familyOf(x.name))),principalHits=[familyOf(r.protein),familyOf(r.carb)].filter(f=>selectedFamilies.has(f)).length;score=Math.min(100,score+principalHits*10);
  return{r,score,missing,matched,proteinMatch};
}
function ranked(meal=intent.meal||'Cualquiera',maxTime=intent.maxTime){const count=pantryEntries().length;if(!count)return[];const minHits=count>=3?2:1;return D.recipes.map(match).filter(x=>(meal==='Cualquiera'||x.r.type===meal)).filter(x=>!maxTime||!x.r.time||x.r.time<=maxTime).filter(x=>x.proteinMatch).filter(x=>x.matched.length>=minHits).filter(x=>x.missing.length<=state.maxMissing).sort((a,b)=>b.score-a.score||b.matched.length-a.matched.length||a.missing.length-b.missing.length||(a.r.time||999)-(b.r.time||999)).slice(0,15)}
function chips(){const rows=pantryEntries();if(!rows.length)return '<div class="empty compact-empty">Aún no has registrado ingredientes.</div>';return `<div class="pantry-chips">${rows.map(x=>`<span class="pantry-chip">${esc(x.name)} <button type="button" data-remove-pantry="${esc(norm(x.name))}" aria-label="Quitar ${esc(x.name)}">×</button></span>`).join('')}</div>`}
function intentSummary(){const bits=[];if(intent.meal&&intent.meal!=='Cualquiera')bits.push(`comida: ${intent.meal}`);if(intent.maxTime)bits.push(`máximo ${intent.maxTime} min`);if(!bits.length)return '';return `<div class="intent-ok">Interpreté también: ${bits.map(esc).join(' · ')}</div>`}
function resultCards(list){if(!list.length)return `<div class="empty">No encontré una receta suficientemente compatible${intent.meal&&intent.meal!=='Cualquiera'?` para ${esc(intent.meal.toLowerCase())}`:''}. Revisa los ingredientes interpretados o permite más faltantes.</div>`;return list.map(x=>`<article class="result-card"><div style="display:flex;gap:8px;align-items:center"><span class="score">${x.score}% compatible</span><span class="missing">${x.missing.length?`Faltan ${x.missing.length}`:'Lista para cocinar'}</span><span class="grow"></span>${favButton(x.r)}</div><div class="title">${esc(x.r.name)}</div><div class="sub">${esc(x.r.type)} · ${x.r.time||'—'} min · coincide con ${x.matched.map(i=>esc(i.name)).slice(0,6).join(', ')}</div>${x.missing.length?`<div class="sub"><b>Falta:</b> ${x.missing.slice(0,6).map(i=>esc(i.name)).join(', ')}</div>`:''}<div class="foot"><span></span><button class="btn small secondary" data-recipe="${esc(x.r.id)}">Ver receta</button></div></article>`).join('')}

function componentScore(item){const entered=pantryEntries(),ings=item.ingredients||[],matched=ings.filter(i=>entered.some(p=>sameIngredient(p.name,i))),missing=ings.filter(i=>!entered.some(p=>sameIngredient(p.name,i)));return{item,matched,missing,score:ings.length?Math.round(matched.length/ings.length*100):0}}
function componentRelevant(item,q){if(!q)return true;const fq=familyOf(q);return familyOf(item.name)===fq||(item.tags||[]).some(t=>familyOf(t)===fq||norm(t).includes(norm(q)))||(item.ingredients||[]).some(i=>familyOf(i)===fq||norm(i).includes(norm(q)))||norm(item.name).includes(norm(q))}
function componentList(type,q='',limit=8){return (C[type]||[]).filter(x=>componentRelevant(x,q)).map(componentScore).sort((a,b)=>b.score-a.score||a.missing.length-b.missing.length||a.item.name.localeCompare(b.item.name,'es')).slice(0,limit)}
function componentCard(x,type){const chosen=plate[type]===x.item.id;return `<article class="component-card ${chosen?'chosen':''}"><div class="component-top"><div><b>${esc(x.item.name)}</b><div class="sub">${x.score}% con tu despensa · ${x.missing.length?`faltan ${x.missing.length}`:'completo'}</div></div><button class="btn small ${chosen?'primary':'secondary'}" data-pick-component="${type}|${esc(x.item.id)}">${chosen?'Elegido ✓':'Elegir'}</button></div><div class="component-ings">${(x.item.ingredients||[]).map(i=>`<span class="mini-chip ${x.matched.some(m=>sameIngredient(m,i))?'have':'need'}">${esc(i)}</span>`).join('')}</div></article>`}
function getComponent(type,id){return (C[type]||[]).find(x=>x.id===id)}
function plateSummary(){const p=getComponent('proteins',plate.protein),s=getComponent('salads',plate.salad),c=getComponent('carbs',plate.carb),selected=[p,s,c].filter(Boolean);if(!selected.length)return '<div class="sub">Elige una proteína, una ensalada y un carbohidrato para armar tu almuerzo.</div>';const req=[...new Set(selected.flatMap(x=>x.ingredients||[]))],missing=req.filter(i=>!pantryEntries().some(p=>sameIngredient(p.name,i)));return `<div class="plate-summary"><div><b>Proteína:</b> ${esc(p?.name||'—')}</div><div><b>Ensalada:</b> ${esc(s?.name||'—')}</div><div><b>Carbohidrato:</b> ${esc(c?.name||'—')}</div><div class="sub" style="margin-top:7px">${missing.length?`Te faltarían: ${missing.map(esc).join(', ')}.`:'Tienes en despensa todos los ingredientes base de esta combinación.'}</div></div>`}
function queryRecipes(q){if(!q)return[];return D.recipes.filter(r=>recipeContains(r,q)).sort((a,b)=>a.type.localeCompare(b.type,'es')||(a.time||999)-(b.time||999)).slice(0,12)}
function recipeSearchCards(rows){if(!rows.length)return '<div class="empty compact-empty">No encontré recetas con ese ingrediente todavía.</div>';return `<div class="recipe-list compact-list">${rows.map(r=>`<article class="recipe-card"><div class="badge">${esc(r.type)} · ${r.time||'—'} min</div><div class="title">${esc(r.name)}</div><div class="sub">Proteína: ${esc(r.protein)} · carbohidrato: ${esc(r.carb)}</div><button class="btn small secondary" data-recipe="${esc(r.id)}">Ver receta</button></article>`).join('')}</div>`}
function browseContent(){
  if(builderTab==='lunches'){
    let rows=D.recipes.filter(r=>r.type==='Almuerzo');if(exploreQuery)rows=rows.filter(r=>recipeContains(r,exploreQuery));if(pantryEntries().length)rows=rows.map(match).sort((a,b)=>b.score-a.score).map(x=>x.r);return recipeSearchCards(rows.slice(0,15));
  }
  const type=builderTab==='proteins'?'proteins':builderTab==='salads'?'salads':'carbs';const plateKey=type==='proteins'?'protein':type==='salads'?'salad':'carb';return `<div class="component-grid">${componentList(type,exploreQuery,20).map(x=>componentCard(x,plateKey)).join('')||'<div class="empty">No hay opciones con ese filtro.</div>'}</div>`
}

M.renderers.pantry=()=>{
  const list=ranked(),selected=pantryEntries().length,found=queryRecipes(exploreQuery),focusFam=familyOf(exploreQuery),legume=['lenteja','frijol','garbanzo','arveja'].includes(focusFam);
  $('#pantry').innerHTML=`<div class="section-title"><div><h2>Despensa inteligente</h2><p>Escribe una lista o háblale como a un asistente.</p></div></div>
  <div class="card"><h3>¿Qué tienes y qué quieres preparar?</h3><div class="sub">Puedes escribir una lista o una frase completa. Ejemplo: “Tengo pollo, arroz, guascas, plátano verde y tomate. Hazme una cena para tres, máximo 35 minutos”.</div><textarea id="ingredientEntry" class="search pantry-entry" rows="4" placeholder="Tengo pollo, arroz, tomate... Hazme una cena de máximo 35 minutos."></textarea><div class="toolbar" style="margin-top:10px"><button class="btn primary" id="processIngredients">Interpretar y analizar</button><button class="btn secondary" id="clearPantry">Vaciar despensa</button></div>${intentSummary()}<div style="margin-top:12px"><b>Ingredientes registrados (${selected})</b>${chips()}</div></div>
  <div class="card ai-card" style="margin-top:12px"><h3>✨ ¿Qué puedo cocinar?</h3><div class="sub">Las proteínas solicitadas son obligatorias en el ranking; arroz o una coincidencia secundaria ya no pueden desplazar al ingrediente principal.</div><div class="toolbar" style="margin-top:12px"><select id="maxMissing" class="field"><option value="0">Solo con lo que tengo</option><option value="1">Puede faltar 1</option><option value="2">Pueden faltar 2</option><option value="3">Pueden faltar 3</option><option value="5">Pueden faltar 5</option></select><button class="btn primary" id="aiCookBtn">Asistente culinario</button></div></div>
  <div class="section-title" style="margin-top:18px"><div><h2>Recetas compatibles</h2><p>Coincidencia ponderada por ingredientes principales${intent.meal&&intent.meal!=='Cualquiera'?` · ${esc(intent.meal)}`:''}.</p></div></div><div class="result-list">${resultCards(list)}</div>
  <div class="card explorer-card" style="margin-top:18px"><h3>🔎 Quiero cocinar con…</h3><div class="sub">Busca un ingrediente sin modificar tu despensa. Ejemplo: lentejas.</div><div class="toolbar" style="margin-top:10px"><input id="exploreInput" class="search" value="${esc(exploreQuery)}" placeholder="lentejas, pollo, pescado, yuca..."><button class="btn primary" id="exploreBtn">Buscar</button></div>${exploreQuery?`<div style="margin-top:14px"><h4>Recetas con “${esc(exploreQuery)}”</h4>${recipeSearchCards(found)}${legume?'<div class="notice"><b>Nota:</b> las leguminosas ya aportan proteína vegetal. Una proteína animal adicional es opcional; para completar el plato prioriza verduras y una porción moderada de cereal o tubérculo.</div>':''}<h4 style="margin-top:16px">Ensaladas recomendadas</h4><div class="component-grid">${componentList('salads','',4).map(x=>componentCard(x,'salad')).join('')}</div><h4 style="margin-top:16px">Proteínas / alternativas</h4><div class="component-grid">${componentList('proteins',legume?'':exploreQuery,4).map(x=>componentCard(x,'protein')).join('')}</div></div>`:''}</div>
  <div class="section-title" style="margin-top:20px"><div><h2>Constructor de almuerzos</h2><p>Explora listas y combínalas con lo que ya tienes.</p></div></div><div class="card"><div class="builder-tabs"><button class="chip ${builderTab==='lunches'?'active':''}" data-builder-tab="lunches">Almuerzos</button><button class="chip ${builderTab==='proteins'?'active':''}" data-builder-tab="proteins">Proteínas</button><button class="chip ${builderTab==='salads'?'active':''}" data-builder-tab="salads">Ensaladas</button><button class="chip ${builderTab==='carbs'?'active':''}" data-builder-tab="carbs">Carbohidratos</button></div><div style="margin-top:12px">${browseContent()}</div></div>
  <div class="card plate-card" style="margin-top:12px"><h3>🍽️ Mi almuerzo armado</h3>${plateSummary()}</div>`;

  $('#maxMissing').value=String(state.maxMissing);$('#maxMissing').onchange=e=>{state.maxMissing=Number(e.target.value);save();M.renderers.pantry()};
  $('#processIngredients').onclick=()=>{const input=$('#ingredientEntry'),x=addIngredients(input.value);if(x.ingredients.length){input.value='';M.renderers.pantry()}else{input.focus();alert('No pude identificar ingredientes. Prueba separándolos con comas.')}};
  $('#ingredientEntry').onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')$('#processIngredients').click()};
  $('#clearPantry').onclick=()=>{if(confirm('¿Vaciar todos los ingredientes registrados?')){state.pantry={};intent={meal:'Cualquiera',maxTime:null};save();saveIntent();M.renderers.pantry()}};
  $$('[data-remove-pantry]').forEach(b=>b.onclick=()=>removeIngredient(b.dataset.removePantry));
  $('#aiCookBtn').onclick=openAI;
  $('#exploreBtn').onclick=()=>{exploreQuery=$('#exploreInput').value.trim();M.renderers.pantry()};$('#exploreInput').onkeydown=e=>{if(e.key==='Enter'){$('#exploreBtn').click();e.preventDefault()}};
  $$('[data-builder-tab]').forEach(b=>b.onclick=()=>{builderTab=b.dataset.builderTab;M.renderers.pantry()});
  $$('[data-pick-component]').forEach(b=>b.onclick=()=>{const [type,id]=b.dataset.pickComponent.split('|');plate[type]=plate[type]===id?'':id;saveIntent();M.renderers.pantry()});
  bindRecipeButtons($('#pantry'));bindFav($('#pantry'));
};

function localProposals(meal=intent.meal||'Cualquiera',maxTime=intent.maxTime){return ranked(meal,maxTime).slice(0,3)}
function closeAI(){$('#aiModal')?.classList.remove('open');document.body.style.overflow=''}
function bindAIClosers(){$$('[data-close-ai]').forEach(el=>el.onclick=closeAI)}
function openAI(){
  const locals=localProposals();
  $('#aiModalBody').innerHTML=`<div class="modal-head"><div><span class="badge">Asistente culinario</span><h2 id="aiModalTitle">Cocinar con mi despensa</h2></div><button class="btn secondary modal-close-text" type="button" data-close-ai>Cerrar ×</button></div><div class="card"><div class="setting"><label>Tipo de comida</label><select id="aiMeal"><option>Cena</option><option>Almuerzo</option><option>Desayuno</option><option>Cualquiera</option></select></div><div class="setting"><label>Tiempo máximo (min)</label><input id="aiTime" type="number" min="10" max="180" step="5" value="${intent.maxTime||30}"></div><div class="setting"><label>Estilo</label><select id="aiStyle"><option>Familiar</option><option>Colombiana</option><option>Más económica</option><option>Más saludable</option><option>Gourmet</option><option>Una sola olla</option></select></div><button class="btn primary full" id="generateAi">Generar propuesta</button></div><div id="aiResult" style="margin-top:12px">${locals.length?`<div class="card"><h3>Mejores coincidencias locales</h3>${locals.map(x=>`<div class="assistant-option"><b>${esc(x.r.name)}</b><div class="sub">${x.score}% compatible · faltan ${x.missing.length} · ${x.r.time||'—'} min</div><button class="btn small secondary" data-recipe="${esc(x.r.id)}">Abrir</button></div>`).join('')}</div>`:'<div class="empty">Primero registra ingredientes o amplía los faltantes permitidos.</div>'}</div><div class="footer-note">Sin endpoint de IA, el asistente usa el motor local. Con IA podrá crear recetas nuevas.</div>`;
  $('#aiMeal').value=intent.meal||'Cualquiera';$('#aiModal').classList.add('open');document.body.style.overflow='hidden';bindAIClosers();bindRecipeButtons($('#aiModalBody'));
  $('#generateAi').onclick=async()=>{const meal=$('#aiMeal').value,maxTime=Number($('#aiTime').value)||null,localNow=localProposals(meal,maxTime),payload={family:D.meta?.family,country:'Colombia',budget:'Medio',meal,maxTime,style:$('#aiStyle').value,pantry:pantryEntries().map(x=>({name:x.name})),requirements:{completeMeal:true,childAge:4,maxCarbSources:2}};if(!state.aiEndpoint){$('#aiResult').innerHTML=localNow.length?`<div class="card"><h3>Propuestas locales</h3>${localNow.map(x=>`<div class="assistant-option"><b>${esc(x.r.name)}</b><div class="sub">${x.score}% compatible · faltan ${x.missing.length}</div><button class="btn small secondary" data-recipe="${esc(x.r.id)}">Ver preparación</button></div>`).join('')}</div><div class="notice">La IA todavía no está conectada; estas opciones provienen del motor local.</div>`:'<div class="notice">No hay una receta suficientemente compatible con esos filtros.</div>';bindRecipeButtons($('#aiResult'));return}$('#aiResult').innerHTML='<div class="card">Generando…</div>';try{const res=await fetch(state.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!res.ok)throw new Error('HTTP '+res.status);const x=await res.json(),ings=(x.ingredients||x.ingredientes||[]).map(i=>`<li><span>${esc(i.name||i.nombre)}</span><b>${esc(i.qty||i.cantidad||'')} ${esc(i.unit||i.unidad||'')}</b></li>`).join(''),steps=x.steps||x.preparacion||[];$('#aiResult').innerHTML=`<div class="card"><h3>${esc(x.name||x.nombre||'Receta generada')}</h3><div class="sub">${esc(x.summary||x.resumen||'')}</div><h4>Ingredientes</h4><ul class="ingredients">${ings}</ul><h4>Preparación</h4><ol>${(Array.isArray(steps)?steps:[steps]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>`}catch(err){$('#aiResult').innerHTML=`<div class="notice"><b>No fue posible usar la IA:</b> ${esc(err.message)}. Puedes seguir usando el motor local.</div>`}};
}
bindAIClosers();document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAI()});
})();
