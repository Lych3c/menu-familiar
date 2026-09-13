(()=>{
'use strict';
const M=window.MF;if(!M)return;
const {state,save,norm,esc}=M,C=window.MF_COMPONENTS||{};
const original=M.renderers.pantry;
const proteinFamilies=['pollo','res','cerdo','pescado','atun','huevo','lenteja','frijol','garbanzo','arveja'];
const aliases={
 pollo:['pollo','pechuga','muslo'],res:['res','carne de res','bistec'],cerdo:['cerdo','lomo de cerdo'],pescado:['pescado','tilapia','trucha'],atun:['atun','atún'],huevo:['huevo','huevos'],
 lenteja:['lenteja','lentejas'],frijol:['frijol','fríjol','frijoles','fríjoles'],garbanzo:['garbanzo','garbanzos'],arveja:['arveja','arvejas'],
 arroz:['arroz'],papa:['papa'],yuca:['yuca'],platano:['platano','plátano'],arepa:['arepa'],quinua:['quinua','quinoa'],pasta:['pasta','fideo'],batata:['batata'],maiz:['maiz','maíz','mazorca']
};
function canonical(v){const n=norm(v);for(const [k,arr] of Object.entries(aliases))if(arr.some(a=>n===norm(a)||n.includes(norm(a))||norm(a).includes(n)))return k;return n}
function same(a,b){const na=norm(a),nb=norm(b);if(!na||!nb)return false;return na===nb||canonical(na)===canonical(nb)||na.includes(nb)||nb.includes(na)}
function pantry(){return Object.values(state.pantry||{})}
function ingredients(item){return [...new Set((item.ingredients||[]).map(String))]}
function estimate(item,type){if(item.time)return Number(item.time);const t=norm(`${item.name} ${(item.tags||[]).join(' ')}`);if(t.includes('horno')||t.includes('asada'))return type==='protein'?35:25;if(t.includes('guis'))return type==='protein'?35:25;if(t.includes('vapor'))return 18;if(t.includes('salte'))return 15;if(t.includes('plancha'))return 20;if(type==='carb')return 20;if(type==='vegetable')return 15;if(type==='protein')return 25;return 10}
function compScore(item,type){const p=pantry(),req=ingredients(item),matched=req.filter(i=>p.some(x=>same(x.name,i))),missing=req.filter(i=>!p.some(x=>same(x.name,i))),coverage=req.length?matched.length/req.length:0,uses=p.filter(x=>req.some(i=>same(x.name,i))).length;return{item,type,req,matched,missing,coverage,uses,time:estimate(item,type)}}
function top(group,type,n){return (group||[]).map(x=>compScore(x,type)).sort((a,b)=>b.uses-a.uses||a.missing.length-b.missing.length||b.coverage-a.coverage||a.time-b.time).slice(0,n)}
function uniq(arr){const out=[];for(const x of arr)if(!out.some(y=>same(y,x)))out.push(x);return out}
function plateData(p,v,c){const req=uniq([...p.req,...v.req,...c.req]),pan=pantry(),matched=req.filter(i=>pan.some(x=>same(x.name,i))),missing=req.filter(i=>!pan.some(x=>same(x.name,i))),uses=pan.filter(x=>req.some(i=>same(x.name,i))).length,coverage=req.length?matched.length/req.length:0,time=Math.max(p.time,v.time,c.time)+8;return{p,v,c,req,matched,missing,uses,coverage,time,key:`${p.item.id}|${v.item.id}|${c.item.id}`}}
function combos(){
 let ps=top(C.proteins,'protein',10),vs=top([...(C.salads||[]),...(C.cookedVegetables||[])],'vegetable',12),cs=top(C.carbs,'carb',10);
 const selectedProteinFamilies=new Set(pantry().map(x=>canonical(x.name)).filter(x=>proteinFamilies.includes(x)));
 if(selectedProteinFamilies.size){const filtered=ps.filter(x=>{const names=[x.item.name,...x.req,(x.item.tags||[])];return names.some(n=>selectedProteinFamilies.has(canonical(n)))});if(filtered.length)ps=filtered}
 const out=[];for(const p of ps)for(const v of vs)for(const c of cs)out.push(plateData(p,v,c));return out;
}
function rankedPlates(){const all=combos();if(!all.length)return[];
 const byBest=[...all].sort((a,b)=>(b.uses*14-b.missing.length*9+b.coverage*45-b.time*.15)-(a.uses*14-a.missing.length*9+a.coverage*45-a.time*.15));
 const best=byBest[0];
 const fastest=[...all].filter(x=>x.uses>0&&x.missing.length<=Math.max(4,(best?.missing.length||0)+2)).sort((a,b)=>a.time-b.time||a.missing.length-b.missing.length||b.uses-a.uses)[0];
 const fewest=[...all].sort((a,b)=>a.missing.length-b.missing.length||b.uses-a.uses||b.coverage-a.coverage||a.time-b.time)[0];
 const picks=[['Mejor con tu despensa',best,'🥇'],['Más rápido',fastest,'⚡'],['Menos compras',fewest,'🛒']].filter(x=>x[1]);
 const seen=new Set();return picks.filter(x=>{if(seen.has(x[1].key))return false;seen.add(x[1].key);return true});
}
function optionalList(group,type,limit=3){return top(group,type,limit)}
function plateCard(label,x,icon,idx){const vegType=(C.salads||[]).some(v=>v.id===x.v.item.id)?'Ensalada':'Verdura cocida';return `<article class="auto-plate"><div class="auto-head"><span class="auto-icon">${icon}</span><div><b>${esc(label)}</b><div class="sub">${x.uses} ingredientes de tu despensa · ${x.missing.length?`${x.missing.length} faltantes`:'sin compras adicionales'} · ~${x.time} min</div></div></div><div class="auto-grid"><div><span>Proteína</span><b>${esc(x.p.item.name)}</b></div><div><span>${vegType}</span><b>${esc(x.v.item.name)}</b></div><div><span>Carbohidrato</span><b>${esc(x.c.item.name)}</b></div></div>${x.missing.length?`<div class="sub auto-missing"><b>Faltaría:</b> ${x.missing.map(esc).join(', ')}</div>`:'<div class="intent-ok">Tienes todos los ingredientes base.</div>'}<div class="auto-actions">${x.missing.length?`<button class="btn small secondary" data-auto-shop="${idx}">Añadir faltantes a compras</button>`:''}</div></article>`}
function miniCard(x,kind){return `<article class="mini-option"><b>${esc(x.item.name)}</b><div class="sub">${x.uses} ingredientes disponibles · ${x.missing.length?`faltan ${x.missing.length}`:'lista para preparar'} · ~${x.time} min</div><div class="component-ings">${x.req.map(i=>`<span class="mini-chip ${x.matched.some(m=>same(m,i))?'have':'need'}">${esc(i)}</span>`).join('')}</div></article>`}
let lastPlates=[];
function append(){const root=document.querySelector('#pantry');if(!root)return;const picks=rankedPlates();lastPlates=picks.map(x=>x[1]);const sauces=optionalList(C.sauces,'sauce',3),soups=optionalList(C.soups,'soup',3);
 root.insertAdjacentHTML('beforeend',`<section class="auto-builder card"><div class="section-title"><div><h2>🧠 Constructor automático</h2><p>Combina proteína, vegetal y carbohidrato usando primero lo que ya tienes. Las propuestas son locales y no consumen IA.</p></div></div>${pantry().length?`<div class="auto-plates">${picks.map((x,i)=>plateCard(x[0],x[1],x[2],i)).join('')}</div>`:'<div class="empty compact-empty">Registra algunos ingredientes para generar propuestas automáticas.</div>'}<div class="optional-grid"><div><h3>🥣 Sopas y cremas opcionales</h3>${soups.map(x=>miniCard(x,'soup')).join('')}</div><div><h3>🥗 Salsas y aderezos opcionales</h3>${sauces.map(x=>miniCard(x,'sauce')).join('')}</div></div><div class="notice" style="margin-top:12px">Las sopas, cremas y salsas son complementos opcionales: no sustituyen la porción principal de verduras ni obligan a aumentar carbohidratos.</div></section>`);
 root.querySelectorAll('[data-auto-shop]').forEach(b=>b.onclick=()=>{const x=lastPlates[Number(b.dataset.autoShop)];if(!x)return;x.missing.forEach(name=>{const k=norm(name);state.extraShopping[k]={ingredient:name,category:'Constructor automático',unit:'',qty:1}});save();b.textContent='Añadidos ✓';b.disabled=true});
}
M.renderers.pantry=()=>{original?.();append()};
})();
