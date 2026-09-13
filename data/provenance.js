(()=>{
'use strict';
const D=window.MENU_APP_DATA;if(!D?.recipes)return;
D.recipes.forEach(r=>{if(!r.origin)r.origin=r.day>0?'Plan mensual propio':'Biblioteca propia';if(!r.sourceType)r.sourceType='propia';});
})();
