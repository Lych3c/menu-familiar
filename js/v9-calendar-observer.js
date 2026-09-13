(()=>{
'use strict';
const M=window.MF;if(!M)return;
let scheduled=false;
function ensureCalendar(){
 const root=document.querySelector('#calendar'),weekly=root?.querySelector('.weekly-planner');if(!root||!weekly)return;
 const mode=localStorage.getItem('mf_planMode')||(localStorage.getItem('mf_weekPlan')?'smart':'month');
 let sw=root.querySelector('.v9-plan-switch');
 if(!sw){weekly.insertAdjacentHTML('beforebegin',`<div class="v9-plan-switch"><button class="chip" data-v9-plan="smart">✨ Semana inteligente</button><button class="chip" data-v9-plan="month">🗓️ Plan de 30 días</button></div>`);sw=root.querySelector('.v9-plan-switch')}
 root.querySelectorAll('[data-v9-plan]').forEach(b=>{b.classList.toggle('active',b.dataset.v9Plan===mode);b.onclick=()=>{localStorage.setItem('mf_planMode',b.dataset.v9Plan);ensureCalendar()}});
 const current=localStorage.getItem('mf_planMode')||mode,monthlyTitle=[...root.querySelectorAll(':scope > .section-title')][0],dayList=root.querySelector(':scope > .day-list');
 weekly.hidden=current!=='smart';if(monthlyTitle)monthlyTitle.hidden=current!=='month';if(dayList)dayList.hidden=current!=='month';
 let plan=null;try{plan=JSON.parse(localStorage.getItem('mf_weekPlan')||'null')}catch{}if(!plan)return;
 root.querySelectorAll('.weekly-planner .week-day').forEach((dayEl,di)=>dayEl.querySelectorAll('.week-meal').forEach(meal=>{
  if(meal.querySelector('[data-v9-view-recipe]'))return;const type=meal.querySelector('span')?.textContent?.trim(),id=plan.days?.[di]?.meals?.[type];if(!id)return;
  const change=meal.querySelector('[data-week-replace]'),btn=document.createElement('button');btn.className='btn small secondary';btn.textContent='Ver receta';btn.dataset.v9ViewRecipe=id;btn.onclick=()=>M.openRecipe?.(id);
  if(change){let actions=meal.querySelector('.v9-week-actions');if(!actions){actions=document.createElement('div');actions.className='v9-week-actions';change.before(actions);actions.appendChild(change)}actions.prepend(btn)}else meal.appendChild(btn)
 }));
}
function queue(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;ensureCalendar()})}
const root=document.querySelector('#calendar');if(root)new MutationObserver(queue).observe(root,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target.closest('#weekGenerate,[data-week-replace],#weekRecalc,#weekClear'))setTimeout(ensureCalendar,0)});
ensureCalendar();
})();
