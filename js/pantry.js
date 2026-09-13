(()=>{
'use strict';
const M=window.MF,{D,$,$$,state,save,norm,esc,favButton,bindFav,bindRecipeButtons}=M;
const catalog=(()=>{const map=new Map();D.recipes.forEach(r=>(r.ingredients||[]).forEach(i=>{const k=norm(i.name);if(!k)return;if(!map.has(k))map.set(k,{key:k,name:i.name,category:i.category||'Otros',units:new Set()});if(i.unit)map.get(k).units.add(i.unit)}));return [...map.values()].map(x=>({...x,units:[...x.units]})).sort((a,b)=>a.category.localeCompare(b.category,'es')||a.name.localeCompare(b.name,'es'))})();
function core(r){return (r.ingredients||[]).filter(i=>!['Condimentos','Grasas','Bebidas'].includes(i.category||''))}
function match(r){const c=core(r),have=c.filter(i=>state.pantry[norm(i.name)]),missing=c.filter(i=>!state.pantry[norm(i.name)]),priority=have.filter(i=>state.pantry[norm(i.name)]?.priority).length,score=c.length?Math.round(have.length/c.length*100):0;return{r,score,missing,have,priority}}
function top(){return D.recipes.map(match).filter(x=>x.missing.length<=state.maxMissing).sort((a,b)=>(b.score+5*b.priority)-(a.score+5*a.priority)||a.missing.length-b.missing.length||(a.r.time||999)-(b.r.time||999)).slice(0,20)}
function addCustom(name){const key=norm(name);if(key){state.pantry[key]={name:String(name).trim(),category:'Agregado por usuario',qty:'',unit:'',priority:false};save()}}
function filterPantryGrid(){
  const q=norm(state.pantryQuery);
  $$('#pantry [data-pantry-row]').forEach(row=>{row.hidden=!!q&&!row.dataset.pantrySearch.includes(q)});
}

M.renderers.pantry=()=>{
  const recs=top(),selected=Object.keys(state.pantry).length;
  $('#pantry').innerHTML=`<div class="section-title"><div><h2>Despensa inteligente</h2><p>Marca lo que tienes y descubre qué puedes cocinar.</p></div></div><div class="card ai-card"><h3>✨ ¿Qué cocino hoy?</h3><div class="sub">Primero busca localmente entre tus ${D.recipes.length} recetas. La IA puede conectarse después sin exponer claves.</div><div class="toolbar" style="margin-top:12px"><select id="maxMissing" class="field"><option value="0">Sin comprar nada</option><option value="1">Falta máximo 1</option><option value="2">Faltan máximo 2</option><option value="3">Faltan máximo 3</option><option value="5">Faltan máximo 5</option></select><button class="btn primary" id="aiCookBtn">Generar propuesta</button></div></div><div class="card" style="margin-top:12px"><div style="display:flex;gap:8px;align-items:center"><h3 class="grow">Mi despensa (${selected})</h3><button class="btn small secondary" id="clearPantry">Limpiar</button></div><div class="toolbar"><input id="pantrySearch" class="search" autocomplete="off" placeholder="Buscar ingrediente..." value="${esc(state.pantryQuery)}"><input id="customIngredient" class="field" autocomplete="off" placeholder="Añadir otro ingrediente"><button class="btn secondary" id="addIngredientBtn">Añadir</button></div><div class="sub" style="margin:8px 0">★ = consumir primero.</div><div class="pantry-grid">${catalog.map(i=>{const p=state.pantry[i.key],search=norm(i.name+' '+i.category);return `<label class="pantry-item" data-pantry-row data-pantry-search="${esc(search)}"><input type="checkbox" data-pantry="${esc(i.key)}" ${p?'checked':''}><span><div class="pantry-name">${esc(i.name)}</div><div class="pantry-cat">${esc(i.category)}</div></span><button type="button" class="star ${p?.priority?'on':''}" data-priority="${esc(i.key)}">★</button></label>`}).join('')}</div></div><div class="section-title" style="margin-top:18px"><div><h2>Recetas compatibles</h2><p>Ordenadas por coincidencia y productos prioritarios.</p></div></div><div class="result-list">${recs.length?recs.map(x=>`<article class="result-card"><div style="display:flex;gap:8px;align-items:center"><span class="score">${x.score}% compatible</span>${x.missing.length?`<span class="missing">Faltan ${x.missing.length}</span>`:'<span class="score">Lista para cocinar</span>'}<span class="grow"></span>${favButton(x.r)}</div><div class="title">${esc(x.r.name)}</div><div class="sub">${esc(x.r.type)} · ${x.r.time||'—'} min</div>${x.missing.length?`<div class="sub"><b>Falta:</b> ${x.missing.slice(0,5).map(i=>esc(i.name)).join(', ')}</div>`:''}<div class="foot"><span>${x.priority?'★ usa '+x.priority+' prioritario(s)':''}</span><button class="btn small secondary" data-recipe="${esc(x.r.id)}">Ver receta</button></div></article>`).join(''):'<div class="empty">Marca ingredientes o aumenta el máximo de faltantes.</div>'}</div>`;
  $('#maxMissing').value=String(state.maxMissing);
  $('#maxMissing').onchange=e=>{state.maxMissing=Number(e.target.value);save();M.renderers.pantry()};
  $('#pantrySearch').oninput=e=>{state.pantryQuery=e.target.value;filterPantryGrid()};
  $('#addIngredientBtn').onclick=()=>{addCustom($('#customIngredient').value);state.pantryQuery='';M.renderers.pantry()};
  $('#customIngredient').onkeydown=e=>{if(e.key==='Enter'){$('#addIngredientBtn').click();e.preventDefault()}};
  $('#clearPantry').onclick=()=>{if(confirm('¿Vaciar la despensa?')){state.pantry={};save();M.renderers.pantry()}};
  $$('[data-pantry]').forEach(c=>c.onchange=()=>{const key=c.dataset.pantry,item=catalog.find(i=>i.key===key);if(c.checked)state.pantry[key]={name:item?.name||key,category:item?.category||'Otros',qty:'',unit:item?.units?.[0]||'',priority:false};else delete state.pantry[key];save();M.renderers.pantry()});
  $$('[data-priority]').forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();const key=b.dataset.priority,item=catalog.find(i=>i.key===key);if(!state.pantry[key])state.pantry[key]={name:item?.name||key,category:item?.category||'Otros',qty:'',unit:item?.units?.[0]||'',priority:true};else state.pantry[key].priority=!state.pantry[key].priority;save();M.renderers.pantry()});
  $('#aiCookBtn').onclick=openAI;
  filterPantryGrid();bindRecipeButtons($('#pantry'));bindFav($('#pantry'));
};

function localProposal(){const x=top()[0];return x?{title:x.r.name,summary:`Mejor coincidencia actual: ${x.score}% y ${x.missing.length} ingrediente(s) faltante(s).`,recipe:x.r}:null}
function renderAI(x){const ings=(x.ingredients||x.ingredientes||[]).map(i=>`<li><span>${esc(i.name||i.nombre)}</span><b>${esc(i.qty||i.cantidad||'')} ${esc(i.unit||i.unidad||'')}</b></li>`).join(''),steps=x.steps||x.preparacion||[];return `<div class="card"><h3>${esc(x.name||x.nombre||'Receta generada')}</h3><div class="sub">${esc(x.summary||x.resumen||'')}</div><h4>Ingredientes</h4><ul class="ingredients">${ings}</ul><h4>Preparación</h4><ol>${(Array.isArray(steps)?steps:[steps]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${x.childNote||x.adaptacionNino?`<div class="notice"><b>Niño de 4 años:</b> ${esc(x.childNote||x.adaptacionNino)}</div>`:''}</div>`}
function closeAI(){
  $('#aiModal')?.classList.remove('open');
  document.body.style.overflow='';
}
function bindAIClosers(){
  $$('[data-close-ai]').forEach(el=>el.onclick=closeAI);
}
function openAI(){
  const pantry=Object.values(state.pantry),local=localProposal();
  $('#aiModalBody').innerHTML=`<div class="modal-head"><div><span class="badge">Asistente culinario</span><h2 id="aiModalTitle">Crear con mi despensa</h2></div><button class="iconbtn closebtn" type="button" data-close-ai aria-label="Cerrar asistente culinario">✕</button></div><div class="card"><div class="setting"><label>Tipo de comida</label><select id="aiMeal"><option>Cena</option><option>Almuerzo</option><option>Desayuno</option><option>Cualquiera</option></select></div><div class="setting"><label>Tiempo máximo</label><select id="aiTime"><option value="20">20 min</option><option value="30" selected>30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div><div class="setting"><label>Estilo</label><select id="aiStyle"><option>Familiar</option><option>Colombiana</option><option>Más económica</option><option>Más saludable</option><option>Gourmet</option><option>Una sola olla</option></select></div><button class="btn primary full" id="generateAi">Generar receta</button></div><div id="aiResult" style="margin-top:12px">${local?`<div class="card"><h3>Recomendación local inmediata</h3><p><b>${esc(local.title)}</b></p><div class="sub">${esc(local.summary)}</div><button class="btn secondary full" data-recipe="${esc(local.recipe.id)}" style="margin-top:10px">Abrir receta</button></div>`:'<div class="empty">Añade ingredientes a la despensa.</div>'}</div><div class="footer-note">Sin endpoint de IA, todo funciona con el motor local.</div>`;
  $('#aiModal').classList.add('open');document.body.style.overflow='hidden';
  bindAIClosers();bindRecipeButtons($('#aiModalBody'));
  $('#generateAi').onclick=async()=>{
    const payload={family:D.meta?.family||'2 adultos + niño de 4 años',country:'Colombia',budget:'Medio',meal:$('#aiMeal').value,maxTime:Number($('#aiTime').value),style:$('#aiStyle').value,pantry:pantry.map(x=>({name:x.name,qty:x.qty,unit:x.unit,priority:x.priority})),requirements:{completeMeal:true,childAge:4}};
    if(!state.aiEndpoint){const p=localProposal();$('#aiResult').innerHTML=p?`<div class="card"><h3>Propuesta local</h3><p><b>${esc(p.title)}</b></p><p class="sub">${esc(p.summary)}</p><button class="btn secondary full" data-recipe="${esc(p.recipe.id)}">Ver preparación</button></div><div class="notice">La IA todavía no está conectada; la arquitectura ya está preparada.</div>`:'<div class="notice">No hay suficientes ingredientes seleccionados.</div>';bindRecipeButtons($('#aiResult'));return;}
    $('#aiResult').innerHTML='<div class="card">Generando…</div>';
    try{const res=await fetch(state.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!res.ok)throw new Error('HTTP '+res.status);$('#aiResult').innerHTML=renderAI(await res.json())}catch(err){$('#aiResult').innerHTML=`<div class="notice"><b>No fue posible usar la IA:</b> ${esc(err.message)}. Puedes seguir usando el motor local.</div>`}
  };
}

bindAIClosers();
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAI()});
})();
