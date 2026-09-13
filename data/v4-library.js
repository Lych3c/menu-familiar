(()=>{
'use strict';
const D=window.MENU_APP_DATA;
const CHILD='Servir una porción inicial menor para el niño de 4 años, con textura segura, trozos pequeños y sin huesos ni espinas; ofrecer más según apetito.';
const R={
 arepaI:['Arepa integral de maíz',3,'unidad','Cereales y derivados'],panI:['Pan integral',270,'g','Cereales y derivados'],avena:['Avena en hojuelas',180,'g','Cereales y derivados'],avenaB:['Avena en hojuelas',40,'g','Cereales y derivados'],papa:['Papa criolla',600,'g','Tubérculos y plátanos'],yuca:['Yuca',600,'g','Tubérculos y plátanos'],quinua:['Quinua',180,'g','Cereales y derivados'],tortilla:['Tortilla de maíz',6,'unidad','Cereales y derivados'],platano:['Plátano verde',2,'unidad','Tubérculos y plátanos'],batata:['Batata',600,'g','Tubérculos y plátanos'],arrozI:['Arroz integral',190,'g','Cereales y derivados'],leche:['Leche',650,'ml','Lácteos'],yogur:['Yogur natural',420,'g','Lácteos'],huevo:['Huevo',4,'unidad','Proteínas'],huevo6:['Huevo',6,'unidad','Proteínas'],huevo1:['Huevo',1,'unidad','Proteínas'],queso:['Queso campesino',120,'g','Lácteos'],ricota:['Queso ricota',140,'g','Lácteos'],polloD:['Pechuga de pollo',360,'g','Proteínas'],pollo:['Pechuga de pollo',450,'g','Proteínas'],res:['Carne de res magra',450,'g','Proteínas'],cerdo:['Lomo de cerdo',450,'g','Proteínas'],pescado:['Filete de pescado blanco',450,'g','Proteínas'],atun:['Atún en agua escurrido',360,'g','Proteínas'],lenteja:['Lenteja seca',240,'g','Leguminosas'],garbanzo:['Garbanzo seco',240,'g','Leguminosas'],frijol:['Fríjol seco',250,'g','Leguminosas'],tomate:['Tomate',220,'g','Verduras/hortalizas'],tomateP:['Tomate',140,'g','Verduras/hortalizas'],cebolla:['Cebolla cabezona',80,'g','Verduras/hortalizas'],cebollaL:['Cebolla larga',60,'g','Verduras/hortalizas'],espinaca:['Espinaca',220,'g','Verduras/hortalizas'],pepino:['Pepino cohombro',240,'g','Verduras/hortalizas'],lechuga:['Lechuga',240,'g','Verduras/hortalizas'],repollo:['Repollo',280,'g','Verduras/hortalizas'],zanahoria:['Zanahoria',180,'g','Verduras/hortalizas'],brocoli:['Brócoli',320,'g','Verduras/hortalizas'],remolacha:['Remolacha',280,'g','Verduras/hortalizas'],calabacin:['Calabacín',300,'g','Verduras/hortalizas'],habichuela:['Habichuela',300,'g','Verduras/hortalizas'],pimenton:['Pimentón',180,'g','Verduras/hortalizas'],ahuyama:['Ahuyama',350,'g','Verduras/hortalizas'],aguacate:['Aguacate',220,'g','Grasas'],papaya:['Papaya',450,'g','Frutas'],mango:['Mango',450,'g','Frutas'],mandarina:['Mandarina',450,'g','Frutas'],pina:['Piña',450,'g','Frutas'],naranja:['Naranja',500,'g','Frutas'],guayaba:['Guayaba',450,'g','Frutas'],mora:['Mora',350,'g','Frutas'],fresa:['Fresa',350,'g','Frutas'],banano:['Banano',400,'g','Frutas'],manzana:['Manzana',450,'g','Frutas'],maracuya:['Maracuyá',320,'g','Frutas'],canela:['Canela',3,'g','Condimentos'],cilantro:['Cilantro',15,'g','Condimentos'],limon:['Limón',100,'g','Frutas'],hierbas:['Hierbas secas',5,'g','Condimentos']
};
const ing=keys=>{const seen=new Set();return keys.filter(k=>R[k]).filter(k=>{const n=R[k][0];if(seen.has(n))return false;seen.add(n);return true}).map(k=>({name:R[k][0],qty:R[k][1],unit:R[k][2],category:R[k][3]}))};
const add=(id,type,name,protein,carb,produce,keys,steps,time)=>{const ingredients=ing(keys);D.recipes.push({id,day:0,week:0,type,name,components:`${protein} + ${carb} + ${produce}`,protein,carb,produce,ingredients,ingredientsText:ingredients.map(i=>`${i.name}: ${i.qty} ${i.unit}`).join('; '),steps,time,childNote:CHILD,library:true})};

// 60 desayunos adicionales: 30 salados + 30 dulces.
const savoryBases=[
 ['Arepa integral','Arepa integral','arepaI','Calentar la arepa'],
 ['Tostadas integrales','Pan integral','panI','Tostar el pan'],
 ['Papa criolla salteada','Papa criolla','papa','Cocinar la papa y saltearla ligeramente'],
 ['Torticas de yuca','Yuca','yuca','Cocinar la yuca, triturar y formar torticas'],
 ['Tortillas de maíz','Tortilla de maíz','tortilla','Calentar las tortillas']
];
const savoryProfiles=[
 ['huevo perico y papaya','Huevo','Tomate, cebolla, papaya',['huevo','tomateP','cebollaL','papaya'],'preparar huevo perico y acompañar con papaya'],
 ['huevo, queso y mango','Huevo y queso','Mango',['huevo','queso','mango'],'servir con huevo, queso y mango'],
 ['pollo, aguacate y mandarina','Pollo','Aguacate, mandarina',['polloD','aguacate','mandarina'],'añadir pollo desmechado y aguacate; servir con mandarina'],
 ['huevo, espinaca y piña','Huevo','Espinaca, piña',['huevo','espinaca','pina'],'preparar el huevo con espinaca y servir con piña'],
 ['atún, tomate y naranja','Atún','Tomate, naranja',['atun','tomateP','naranja'],'mezclar atún con tomate y servir con naranja'],
 ['ricota, huevo y guayaba','Huevo y ricota','Guayaba',['ricota','huevo','guayaba'],'servir con ricota, huevo y guayaba fresca']
];
let n=1;
for(const b of savoryBases)for(const p of savoryProfiles){add(`BDES${String(n++).padStart(3,'0')}`,'Desayuno',`${b[0]} con ${p[0]}`,p[1],b[1],p[2],[b[2],...p[3]],`${b[3]}; ${p[4]}.`,20)}
const sweetBases=[
 ['Avena cremosa','Avena','avena',['leche'],'Cocinar la avena en leche hasta que quede cremosa'],
 ['Quinua en leche','Quinua','quinua',['leche'],'Cocinar la quinua en leche hasta que esté tierna'],
 ['Pancakes de avena','Avena','avena',['leche','huevo1'],'Licuar avena, leche y huevo y cocinar pancakes pequeños'],
 ['Bowl de yogur con granola de avena','Avena','avena',['yogur'],'Tostar suavemente la avena y servirla sobre yogur natural'],
 ['Arroz integral en leche','Arroz integral','arrozI',['leche'],'Cocinar el arroz integral en leche hasta que esté suave']
];
const sweetProfiles=[
 ['banano y huevo cocido','Huevo','Banano',['banano','huevo'],'servir con banano y huevo cocido'],
 ['manzana, canela y queso','Queso','Manzana',['manzana','canela','queso'],'añadir manzana y canela y acompañar con queso'],
 ['mora y yogur natural','Yogur natural','Mora',['mora','yogur'],'servir con mora y yogur natural'],
 ['papaya y huevo','Huevo','Papaya',['papaya','huevo'],'servir con papaya y huevo cocido'],
 ['fresas y ricota','Ricota','Fresas',['fresa','ricota'],'terminar con fresas y ricota'],
 ['maracuyá, yogur y huevo','Huevo y yogur','Maracuyá',['maracuya','yogur','huevo'],'servir con maracuyá, yogur y huevo']
];
for(const b of sweetBases)for(const p of sweetProfiles){add(`BDES${String(n++).padStart(3,'0')}`,'Desayuno',`${b[0]} con ${p[0]}`,p[1],b[1],p[2],[b[2],...b[3],...p[3]],`${b[4]}; ${p[4]}.`,20)}

// 90 almuerzos adicionales. Cada preparación usa una sola fuente principal de carbohidrato.
const lunchProteins=[
 ['Pollo a la plancha','Pollo',['pollo'],'Asar el pollo a la plancha con condimentos suaves'],
 ['Pollo al horno con hierbas','Pollo',['pollo','hierbas'],'Hornear el pollo con hierbas hasta cocción completa'],
 ['Pollo en hogao','Pollo',['pollo','tomateP','cebolla'],'Cocinar el pollo en hogao de tomate y cebolla'],
 ['Res guisada','Res',['res','tomateP','cebolla'],'Guisar la res con tomate y cebolla hasta que esté tierna'],
 ['Res a la plancha','Res',['res'],'Asar la res a la plancha y dejar reposar antes de servir'],
 ['Cerdo al horno','Cerdo',['cerdo','hierbas'],'Hornear el lomo de cerdo con hierbas'],
 ['Pescado al limón','Pescado',['pescado','limon'],'Cocinar el pescado a la plancha u horno con limón'],
 ['Torticas de atún','Atún',['atun','huevo1','avenaB'],'Mezclar atún con huevo y avena, formar torticas y dorarlas'],
 ['Lentejas guisadas','Lentejas',['lenteja','tomateP','cebolla'],'Cocinar las lentejas con tomate y cebolla hasta que estén tiernas'],
 ['Lentejas con verduras','Lentejas',['lenteja','zanahoria','tomateP'],'Cocinar las lentejas con zanahoria y tomate'],
 ['Torticas de lenteja','Lentejas',['lenteja','huevo1','avenaB'],'Cocinar y triturar parcialmente las lentejas, formar torticas y dorarlas'],
 ['Garbanzos al curry suave','Garbanzos',['garbanzo','tomateP'],'Cocinar los garbanzos y terminarlos con tomate y curry suave'],
 ['Garbanzos guisados','Garbanzos',['garbanzo','tomateP','cebolla'],'Guisar los garbanzos con tomate y cebolla'],
 ['Fríjoles con verduras','Fríjoles',['frijol','ahuyama','tomateP'],'Cocinar los fríjoles con ahuyama y tomate'],
 ['Albóndigas de fríjol','Fríjoles',['frijol','huevo1','avenaB'],'Triturar parcialmente los fríjoles, formar albóndigas y hornear o dorar']
];
const lunchSides=[
 ['arroz integral','Arroz integral','arrozI','ensalada de pepino, tomate y aguacate','Pepino, tomate, aguacate',['pepino','tomate','aguacate'],'Cocinar el arroz integral y preparar la ensalada de pepino, tomate y aguacate'],
 ['papa criolla','Papa criolla','papa','ensalada de brócoli y zanahoria','Brócoli, zanahoria',['brocoli','zanahoria'],'Cocinar la papa y servir con brócoli y zanahoria al vapor'],
 ['yuca al vapor','Yuca','yuca','ensalada de repollo y zanahoria','Repollo, zanahoria',['repollo','zanahoria'],'Cocinar la yuca y preparar ensalada de repollo con zanahoria'],
 ['quinua','Quinua','quinua','ensalada de espinaca, tomate y aguacate','Espinaca, tomate, aguacate',['espinaca','tomate','aguacate'],'Cocinar la quinua y preparar ensalada de espinaca, tomate y aguacate'],
 ['batata asada','Batata','batata','ensalada verde de lechuga, pepino y tomate','Lechuga, pepino, tomate',['lechuga','pepino','tomate'],'Asar la batata y preparar una ensalada verde'],
 ['arepa integral','Arepa integral','arepaI','ensalada de remolacha y pepino','Remolacha, pepino',['remolacha','pepino'],'Calentar la arepa integral y servir con remolacha cocida y pepino']
];
n=1;
for(const p of lunchProteins)for(const s of lunchSides){add(`BALM${String(n++).padStart(3,'0')}`,'Almuerzo',`${p[0]} con ${s[0]} y ${s[3]}`,p[1],s[1],s[4],[...p[2],s[2],...s[5]],`${p[3]}. ${s[6]}. Servir manteniendo las verduras como la parte más abundante del plato.`,40)}

// 60 cenas adicionales, completas y con una sola fuente principal de carbohidrato.
const dinnerProteins=[
 ['Pollo desmechado con verduras','Pollo',['pollo','tomateP','zanahoria'],'Cocinar y desmechar el pollo; mezclarlo con tomate y zanahoria'],
 ['Pollo salteado al limón','Pollo',['pollo','limon'],'Saltear el pollo y terminar con limón'],
 ['Res en tiras con verduras','Res',['res','pimenton','cebolla'],'Saltear tiras de res con pimentón y cebolla'],
 ['Cerdo magro salteado','Cerdo',['cerdo','pimenton'],'Saltear el cerdo en tiras con pimentón'],
 ['Pescado al horno','Pescado',['pescado','limon'],'Hornear el pescado con limón y condimentos suaves'],
 ['Atún con tomate y cebolla','Atún',['atun','tomateP','cebolla'],'Mezclar el atún con tomate y cebolla salteados suavemente'],
 ['Lentejas cremosas con verduras','Lentejas',['lenteja','ahuyama','zanahoria'],'Cocinar lentejas con ahuyama y zanahoria hasta obtener una textura cremosa'],
 ['Garbanzos salteados con verduras','Garbanzos',['garbanzo','pimenton','calabacin'],'Saltear garbanzos cocidos con pimentón y calabacín'],
 ['Fríjoles con ahuyama','Fríjoles',['frijol','ahuyama','tomateP'],'Cocinar fríjoles con ahuyama y tomate'],
 ['Frittata de huevo y verduras','Huevo',['huevo6','espinaca','tomateP'],'Cuajar huevos con espinaca y tomate a fuego suave']
];
const dinnerSides=[
 ['arroz integral','Arroz integral','arrozI','calabacín y tomate','Calabacín, tomate',['calabacin','tomate'],'Cocinar arroz integral y saltear calabacín con tomate'],
 ['papa criolla','Papa criolla','papa','espinaca y pepino','Espinaca, pepino',['espinaca','pepino'],'Cocinar la papa y preparar espinaca con pepino'],
 ['yuca','Yuca','yuca','repollo y zanahoria','Repollo, zanahoria',['repollo','zanahoria'],'Cocinar la yuca y preparar ensalada de repollo y zanahoria'],
 ['arepa integral','Arepa integral','arepaI','tomate y aguacate','Tomate, aguacate',['tomate','aguacate'],'Calentar la arepa y preparar tomate con aguacate'],
 ['batata asada','Batata','batata','brócoli y zanahoria','Brócoli, zanahoria',['brocoli','zanahoria'],'Asar la batata y cocinar brócoli con zanahoria'],
 ['quinua','Quinua','quinua','lechuga y pepino','Lechuga, pepino',['lechuga','pepino'],'Cocinar la quinua y preparar ensalada de lechuga y pepino']
];
n=1;
for(const p of dinnerProteins)for(const s of dinnerSides){add(`BCEN${String(n++).padStart(3,'0')}`,'Cena',`${p[0]} con ${s[0]}, ${s[3]}`,p[1],s[1],s[4],[...p[2],s[2],...s[5]],`${p[3]}. ${s[6]}. Servir en una cena completa con abundantes verduras.`,35)}
D.meta.planMeals=90;D.meta.libraryRecipes=D.recipes.length;D.meta.version='4.0.0';
})();
