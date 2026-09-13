(()=>{
'use strict';
const D=window.MENU_APP_DATA;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const store=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const load=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
function fmtQty(q){if(q==null||q==='')return '';const n=Number(q);return Number.isNaN(n)?esc(q):(Number.isInteger(n)?String(n):n.toFixed(1).replace(/\.0$/,''))}
function buildShopping(){
 const wk=new Map(),mo=new Map();
 const scheduled=D.recipes.filter(r=>Number(r.day)>=1&&Number(r.day)<=30&&Number(r.week)>=1&&Number(r.week)<=5);
 scheduled.forEach(r=>(r.ingredients||[]).forEach(i=>{
  const key=`${norm(i.name)}|${i.unit||''}`,base={category:i.category||'Otros',ingredient:i.name,unit:i.unit||'',qty:Number(i.qty)||0};
  const wkKey=`${r.week}|${key}`,a=wk.get(wkKey)||{week:r.week,...base,qty:0,note:['Frutas','Verduras/hortalizas','Lácteos','Proteínas'].includes(base.category)?'Comprar fresco en la semana':'Puede comprarse al inicio del mes'};a.qty+=base.qty;wk.set(wkKey,a);
  const b=mo.get(key)||{...base,qty:0,note:['Frutas','Verduras/hortalizas','Lácteos','Proteínas'].includes(base.category)?'Fraccionar compra semanal':'Apto para compra mensual'};b.qty+=base.qty;mo.set(key,b);
 }));
 D.weeklyShopping=[...wk.values()].sort((a,b)=>a.week-b.week||a.category.localeCompare(b.category,'es')||a.ingredient.localeCompare(b.ingredient,'es'));
 D.monthlyShopping=[...mo.values()].sort((a,b)=>a.category.localeCompare(b.category,'es')||a.ingredient.localeCompare(b.ingredient,'es'));
}
buildShopping();
const state={startDate:localStorage.getItem('mf_startDate')||new Date().toISOString().slice(0,10),theme:localStorage.getItem('mf_theme')||'light',selectedDay:Number(localStorage.getItem('mf_selectedDay')||0),recipeFilter:'Todos',recipeQuery:'',shopMode:'week',shopWeek:Number(localStorage.getItem('mf_shopWeek')||1),checked:load('mf_checked',{}),favorites:load('mf_favorites',{}),pantry:load('mf_pantry',{}),maxMissing:Number(localStorage.getItem('mf_maxMissing')||2),pantryQuery:'',aiEndpoint:localStorage.getItem('mf_aiEndpoint')||'',deferredInstall:null};
document.documentElement.dataset.theme=state.theme;
function save(){localStorage.setItem('mf_startDate',state.startDate);localStorage.setItem('mf_theme',state.theme);localStorage.setItem('mf_selectedDay',String(state.selectedDay));localStorage.setItem('mf_shopWeek',String(state.shopWeek));localStorage.setItem('mf_maxMissing',String(state.maxMissing));localStorage.setItem('mf_aiEndpoint',state.aiEndpoint);store('mf_checked',state.checked);store('mf_favorites',state.favorites);store('mf_pantry',state.pantry)}
function parseLocalDate(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function dateLabel(day){return addDays(parseLocalDate(state.startDate),day-1).toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short'})}
function currentDay(){const t=new Date();t.setHours(0,0,0,0);const s=parseLocalDate(state.startDate);s.setHours(0,0,0,0);return Math.min(30,Math.max(1,Math.floor((t-s)/86400000)+1))}
function mealIcon(t){return t==='Desayuno'?'☀️':t==='Almuerzo'?'🍲':'🌙'}
function recipeFor(day,type){return D.recipes.find(r=>r.day===day&&r.type===type)}
function favButton(r){return `<button class="favbtn ${state.favorites[r.id]?'on':''}" data-fav="${esc(r.id)}" aria-label="Favorito">${state.favorites[r.id]?'♥':'♡'}</button>`}
function bindFav(root=document){root.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();state.favorites[b.dataset.fav]=!state.favorites[b.dataset.fav];save();const a=$('.section.active')?.id||'recipes';MF.renderers[a]?.()})}
function bindRecipeButtons(root=document){root.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>MF.openRecipe?.(b.dataset.recipe))}
function mealCard(r){return `<article class="card meal-card"><div class="meal-tag">${mealIcon(r.type)} ${esc(r.type)}</div><div style="display:flex;gap:6px"><div class="name grow">${esc(r.name)}</div>${favButton(r)}</div><div class="meta-row"><span>⏱️ ${r.time||'—'} min</span><span>🥩 ${esc(r.protein)}</span><span>🍚 ${esc(r.carb)}</span></div><button class="btn secondary" data-recipe="${esc(r.id)}">Ver receta</button></article>`}
function setTab(tab){$$('.section').forEach(x=>x.classList.toggle('active',x.id===tab));$$('.navbtn').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));window.scrollTo({top:0,behavior:'smooth'});MF.renderers[tab]?.()}
const MF=window.MF={D,$,$$,state,save,norm,esc,fmtQty,dateLabel,currentDay,mealIcon,recipeFor,favButton,bindFav,bindRecipeButtons,setTab,renderers:{}};
MF.renderers.home=()=>{const day=state.selectedDay||currentDay(),menu=D.menu.find(m=>m.day===day),recs=['Desayuno','Almuerzo','Cena'].map(t=>recipeFor(day,t)).filter(Boolean),progress=Math.round(day/30*100),pantryCount=Object.keys(state.pantry).length;$('#home').innerHTML=`<div class="hero"><div class="eyebrow">${day===currentDay()?'Menú de hoy':'Día seleccionado'}</div><h2>Día ${day} · ${esc(dateLabel(day))}</h2><p>Semana ${menu.week} · menú familiar para 3 personas.</p><div class="hero-actions"><button class="btn primary" id="todayBtn">Ir a hoy</button><button class="btn secondary" id="nextBtn">Día siguiente</button></div></div><div class="grid two"><div class="card"><div class="meta-row" style="justify-content:space-between"><b>Avance del plan</b><span>${progress}%</span></div><div class="progress" style="margin-top:9px"><span style="width:${progress}%"></span></div></div><div class="card"><b>Despensa</b><div class="sub">${pantryCount} ingredientes registrados</div><button class="btn small secondary" id="cookNowBtn" style="margin-top:8px">¿Qué puedo cocinar?</button></div></div>${menu.prep&&!String(menu.prep).startsWith('No requiere')?`<div class="notice"><b>Preparación anticipada:</b> ${esc(menu.prep)}</div>`:''}<div class="grid meal-grid">${recs.map(mealCard).join('')}</div><div class="card" style="margin-top:12px"><h3>👧 Nota para el niño de 4 años</h3><div class="sub">${esc(menu.childNote)}</div></div>`;$('#todayBtn').onclick=()=>{state.selectedDay=currentDay();save();MF.renderers.home()};$('#nextBtn').onclick=()=>{state.selectedDay=day>=30?1:day+1;save();MF.renderers.home()};$('#cookNowBtn').onclick=()=>setTab('pantry');bindRecipeButtons($('#home'));bindFav($('#home'))};
MF.renderers.calendar=()=>{$('#calendar').innerHTML=`<div class="section-title"><div><h2>Plan de 30 días</h2><p>El Día 1 comienza el ${esc(parseLocalDate(state.startDate).toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}))}.</p></div></div><div class="day-list">${D.menu.map(m=>`<article class="day-card"><div class="day-head"><div class="day-num">${m.day}</div><div><b>Semana ${m.week}</b><div class="day-date">${esc(dateLabel(m.day))}</div></div><span class="grow"></span><button class="btn small secondary" data-open-day="${m.day}">Abrir</button></div><div class="mini-meals"><div><b>Desayuno</b>${esc(m.breakfast)}</div><div><b>Almuerzo</b>${esc(m.lunch)}</div><div><b>Cena</b>${esc(m.dinner)}</div></div></article>`).join('')}</div>`;$$('[data-open-day]').forEach(b=>b.onclick=()=>{state.selectedDay=Number(b.dataset.openDay);save();setTab('home')})};
$$('.navbtn').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));$('#moreBtn').onclick=()=>setTab('settings');$('#themeBtn').onclick=()=>{state.theme=state.theme==='light'?'dark':'light';document.documentElement.dataset.theme=state.theme;save()};
})();
