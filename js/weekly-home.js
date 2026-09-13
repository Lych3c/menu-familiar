(()=>{
'use strict';
const M=window.MF;if(!M)return;const {$,esc}=M,original=M.renderers.home;
function loadPlan(){try{return JSON.parse(localStorage.getItem('mf_weekPlan')||'null')}catch{return null}}
function todayKey(){const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`}
M.renderers.home=()=>{original?.();const root=$('#home'),plan=loadPlan();if(!root||!plan)return;const row=plan.days?.find(x=>x.date===todayKey())||plan.days?.[0];if(!row)return;const meals=['Desayuno','Almuerzo','Cena'].map(type=>{const r=M.D.recipes.find(x=>x.id===row.meals?.[type]);return r?`<div class="week-home-meal"><span>${type}</span><b>${esc(r.name)}</b></div>`:''}).join('');root.insertAdjacentHTML('afterbegin',`<section class="card week-home-card"><div class="section-title"><div><h2>🗓️ Semana inteligente</h2><p>${row.date===todayKey()?'Propuesta para hoy':'Primera jornada del plan semanal generado'}.</p></div><button class="btn small secondary" id="openWeekPlanner">Ver semana</button></div><div class="week-home-grid">${meals}</div></section>`);$('#openWeekPlanner').onclick=()=>M.setTab('calendar')};
})();
