(()=>{
'use strict';
const C=window.MF_COMPONENTS=window.MF_COMPONENTS||{};
const clean=s=>String(s||'').toLowerCase();
function saladSteps(x){
 const names=x.ingredients||[],t=clean(`${x.name} ${(x.tags||[]).join(' ')}`);
 const cooked=t.includes('cocida')||t.includes('brócoli')||t.includes('habichuela')||t.includes('remolacha');
 const creamy=t.includes('yogur')||t.includes('cremosa');
 const steps=[];
 if(cooked)steps.push(`Lava los ingredientes. Cocina solo los vegetales que lo requieran hasta que estén tiernos pero conserven textura; enfríalos antes de mezclar con los ingredientes crudos.`);
 else steps.push('Lava y desinfecta los vegetales y frutas. Sécalos bien para que el aderezo se adhiera y la ensalada no quede aguada.');
 steps.push(`Corta ${names.slice(0,4).join(', ')} en tamaños cómodos y similares. Si hay hojas, córtalas con la mano o cuchillo limpio justo antes de servir.`);
 if(creamy)steps.push('Mezcla primero el yogur o componente cremoso con el ácido y las hierbas; incorpora poco a poco para cubrir sin saturar la ensalada.');
 else steps.push('Mezcla los componentes suavemente. Añade limón, vinagreta o el aderezo elegido justo antes de servir para conservar frescura y crocancia.');
 steps.push('Prueba, ajusta acidez y sazón y sirve de inmediato. Si incluye aguacate o fruta blanda, incorpóralos al final para que mantengan su forma.');
 return steps;
}
function vegSteps(x){
 const names=x.ingredients||[],t=clean(`${x.name} ${(x.tags||[]).join(' ')}`),steps=[];
 steps.push(`Lava y corta ${names.slice(0,4).join(', ')} en piezas de tamaño parecido para que se cocinen de manera uniforme.`);
 if(t.includes('vapor')){steps.push('Lleva poca agua a hervor y cocina los vegetales al vapor, sin sumergirlos, hasta que estén tiernos pero aún firmes y de color vivo.');steps.push('Retira inmediatamente del vapor, añade limón, hierbas o un toque de aceite y sirve sin recocer.');}
 else if(t.includes('horno')||t.includes('asad')){steps.push('Precalienta el horno a temperatura alta. Distribuye los vegetales en una sola capa, con poco aceite y sin amontonarlos.');steps.push('Hornea hasta que los bordes estén dorados y el interior tierno; gira una vez a mitad de cocción y sazona al final.');}
 else if(t.includes('guis')){steps.push('Sofríe primero cebolla, ajo o aromáticos a fuego medio. Añade los vegetales más firmes y después los más delicados.');steps.push('Agrega una pequeña cantidad de líquido o tomate, tapa parcialmente y cocina hasta integrar sabores sin deshacer completamente los vegetales.');}
 else {steps.push('Calienta bien una sartén amplia o wok. Añade poco aceite y cocina primero los vegetales más firmes, dejando espacio para que se doren en lugar de hervirse.');steps.push('Incorpora los vegetales más delicados al final, saltea a fuego medio-alto y retira cuando estén cocidos pero todavía con textura.');}
 steps.push('Prueba y ajusta sazón, acidez o hierbas justo antes de servir.');return steps;
}
function sauceSteps(x){
 const names=x.ingredients||[],t=clean(`${x.name} ${(x.tags||[]).join(' ')}`),steps=[];
 if(t.includes('vinagreta')){steps.push('Combina primero el ingrediente ácido con mostaza, hierbas o condimentos.');steps.push('Añade el aceite poco a poco mientras bates con tenedor o batidor hasta lograr una emulsión ligera.');steps.push('Prueba, ajusta acidez y conserva refrigerada; vuelve a agitar antes de servir.');}
 else if(t.includes('yogur')||t.includes('cremosa')){steps.push(`Prepara ${names.slice(0,4).join(', ')} y deja que los ingredientes cocidos estén fríos antes de mezclarlos con el yogur.`);steps.push('Mezcla o procesa hasta obtener una crema uniforme. Añade el limón o componente ácido al final y ajusta la textura con una cucharada de agua si hace falta.');steps.push('Refrigera 10 minutos antes de servir para que se integren los sabores.');}
 else if(t.includes('asada')){steps.push('Asa o dora el vegetal principal hasta que esté tierno y presente zonas ligeramente tostadas.');steps.push('Deja entibiar y procesa con los demás ingredientes hasta obtener la textura deseada.');steps.push('Ajusta acidez y sazón; sirve tibia o fría según el plato.');}
 else if(t.includes('caliente')||t.includes('tomate')||t.includes('hogao')){steps.push('Pica los aromáticos finamente. Cocínalos a fuego medio hasta que se ablanden sin quemarse.');steps.push('Incorpora tomate u otros vegetales y cocina lentamente hasta concentrar sabor y obtener una salsa jugosa.');steps.push('Ajusta la consistencia con poca agua si es necesario y rectifica sazón al final.');}
 else {steps.push(`Pica o prepara ${names.slice(0,4).join(', ')}.`);steps.push('Mezcla o procesa hasta integrar. Añade el componente ácido y las hierbas al final para conservar frescura.');steps.push('Prueba y ajusta la intensidad antes de servir; usa como complemento, no como base del plato.');}
 return steps;
}
(C.salads||[]).forEach(x=>{x.time=x.time||10;x.method=x.method||'Ensalada';x.steps=x.steps||saladSteps(x)});
(C.cookedVegetables||[]).forEach(x=>{x.time=x.time||15;x.method=x.method||((x.tags||[]).includes('vapor')?'Al vapor':(x.tags||[]).includes('horno')?'Horno / asado':(x.tags||[]).includes('guisadas')?'Guisado':'Salteado');x.steps=x.steps||vegSteps(x)});
(C.sauces||[]).forEach(x=>{x.method=x.method||'Salsa / aderezo';x.steps=x.steps||sauceSteps(x)});
const saladNew=[
 ['s-griega','Ensalada griega de pepino, tomate y queso','pepino cohombro|tomate|queso fresco|aceitunas|limón',['cruda','mediterranea']],
 ['s-caprese','Tomate, mozzarella y albahaca','tomate|queso mozzarella|albahaca|aceite de oliva',['cruda','italiana']],
 ['s-thai','Ensalada thai de pepino, zanahoria y maní','pepino cohombro|zanahoria|maní|limón|cilantro',['cruda','asiatica']],
 ['s-coreana','Pepino estilo coreano suave','pepino cohombro|ajonjolí|vinagre de arroz|cebolla larga',['cruda','asiatica']],
 ['s-peruana','Ensalada peruana de cebolla, tomate y limón','cebolla morada|tomate|limón|cilantro',['cruda','peruana']],
 ['s-mediterranea-garbanzo','Ensalada mediterránea de garbanzo y vegetales','garbanzo cocido|pepino cohombro|tomate|pimentón|limón',['leguminosa','mediterranea']],
 ['s-lenteja-tibia','Ensalada tibia de lentejas y zanahoria','lenteja cocida|zanahoria|tomate|perejil|limón',['tibia','leguminosa']],
 ['s-quinua','Ensalada de quinua, pepino y hierbas','quinua cocida|pepino cohombro|tomate|perejil|limón',['cereal','fresca']],
 ['s-brocoli-yogur','Brócoli frío con yogur y limón','brócoli|yogur natural|limón|perejil',['cocida','cremosa']],
 ['s-coliflor-hierbas','Coliflor fría con hierbas y limón','coliflor|perejil|limón|aceite de oliva',['cocida','fresca']],
 ['s-remolacha-naranja','Remolacha, naranja y hojas verdes','remolacha|naranja|lechuga|limón',['cocida','frutal']],
 ['s-manzana-apio','Manzana, apio y yogur','manzana|apio|yogur natural|limón',['cruda','cremosa']],
 ['s-repollo-mango','Repollo, mango y cilantro','repollo|mango|cilantro|limón',['cruda','frutal']],
 ['s-rucula-pera','Rúgula, pera y nueces','rúgula|pera|nueces|limón',['cruda','verde']],
 ['s-espinaca-fresa','Espinaca, fresa y pepino','espinaca|fresa|pepino cohombro|limón',['cruda','frutal']],
 ['s-tomate-albahaca','Tomate, pepino y albahaca','tomate|pepino cohombro|albahaca|limón',['cruda','mediterranea']],
 ['s-zanahoria-naranja','Zanahoria, naranja y ajonjolí','zanahoria|naranja|ajonjolí|limón',['cruda','frutal']],
 ['s-habichuela-limon','Habichuela fría con tomate y limón','habichuela|tomate|cebolla morada|limón',['cocida','fresca']],
 ['s-maiz-frijol','Maíz, fríjol y tomate','maíz tierno|fríjol cocido|tomate|aguacate|limón',['leguminosa','latina']],
 ['s-pepino-pina','Pepino, piña y cilantro','pepino cohombro|piña|cilantro|limón',['cruda','frutal']],
 ['s-ahuyama-hojas','Ahuyama asada sobre hojas verdes','ahuyama|lechuga|espinaca|semillas de ajonjolí',['asada','tibia']],
 ['s-berenjena-tomate','Berenjena asada, tomate y perejil','berenjena|tomate|perejil|limón',['asada','mediterranea']]
];
for(const [id,name,s,tags] of saladNew){const x={id,name,ingredients:s.split('|'),tags,time:12,method:'Ensalada'};x.steps=saladSteps(x);C.salads.push(x)}
const vegNew=[
 ['v-wok-thai','Vegetales al wok con lima','brócoli|zanahoria|pimentón|cebolla larga|limón',['salteadas','wok','asiatica']],
 ['v-wok-ajonjoli','Calabacín y champiñón al ajonjolí','calabacín|champiñón|ajonjolí|cebolla larga',['salteadas','wok']],
 ['v-brocoli-ajo','Brócoli salteado con ajo y limón','brócoli|ajo|limón',['salteadas','verde']],
 ['v-coliflor-curry','Coliflor salteada con curry suave','coliflor|curry suave|cebolla cabezona',['salteadas','curry']],
 ['v-berenjena-miso','Berenjena glaseada estilo japonés','berenjena|miso|ajonjolí|cebolla larga',['horno','asiatica']],
 ['v-pimenton-cebolla','Pimentón y cebolla caramelizados suavemente','pimentón|cebolla cabezona|hierbas secas',['salteadas']],
 ['v-zucchini-albahaca','Calabacín salteado con tomate y albahaca','calabacín|tomate|albahaca|ajo',['salteadas','mediterranea']],
 ['v-repollo-wok','Repollo y zanahoria al wok','repollo|zanahoria|cebolla larga|ajonjolí',['salteadas','wok']],
 ['v-ahuyama-curry','Ahuyama asada con curry suave','ahuyama|curry suave|limón',['horno','asadas','curry']],
 ['v-raices-horno','Zanahoria, remolacha y cebolla asadas','zanahoria|remolacha|cebolla cabezona|hierbas secas',['horno','asadas']],
 ['v-berenjena-horno','Berenjena al horno con tomate y orégano','berenjena|tomate|orégano seco',['horno','mediterranea']],
 ['v-coliflor-ajonjoli','Coliflor al horno con ajonjolí y limón','coliflor|ajonjolí|limón',['horno','asadas']],
 ['v-espinaca-ajo','Espinaca salteada con ajo y limón','espinaca|ajo|limón',['salteadas','verde']],
 ['v-acelga-tomate','Acelga guisada con tomate','acelga|tomate|cebolla cabezona',['guisadas','verde']],
 ['v-habichuela-ajonjoli','Habichuela salteada con ajonjolí','habichuela|ajonjolí|ajo',['salteadas']],
 ['v-bruselas-horno','Coles de Bruselas asadas con limón','coles de Bruselas|limón|ajo',['horno','asadas']],
 ['v-calabacin-vapor','Calabacín y brócoli al vapor con hierbas','calabacín|brócoli|hierbas secas|limón',['vapor','verde']],
 ['v-champ-tomillo','Champiñones salteados con tomillo','champiñón|tomillo|ajo',['salteadas']]
];
for(const [id,name,s,tags] of vegNew){const x={id,name,ingredients:s.split('|'),tags,time:16,method:tags.includes('vapor')?'Al vapor':tags.includes('horno')?'Horno / asado':tags.includes('guisadas')?'Guisado':'Salteado / wok'};x.steps=vegSteps(x);C.cookedVegetables.push(x)}
const sauceNew=[
 ['a-tzatziki','Tzatziki suave','yogur natural|pepino cohombro|limón|ajo',['cremosa','mediterranea'],['pollo','pescado','garbanzos','pita','verduras asadas'],['pollo','pescado','garbanzo','pan','verdura']],
 ['a-pesto-ligero','Pesto ligero de albahaca','albahaca|nueces|queso parmesano|limón',['hierbas','italiana'],['pasta','pollo','tomate','calabacín','pan'],['pasta','pollo','tomate','calabacin','pan']],
 ['a-romesco','Romesco casero ligero','pimentón asado|tomate|almendras|ajo',['asada','espanola'],['pescado','pollo','papa','coliflor','pan'],['pescado','pollo','papa','coliflor','pan']],
 ['a-soya-limon','Salsa de soya, limón y ajonjolí','salsa de soya baja en sodio|limón|ajonjolí|cebolla larga',['asiatica','fresco'],['wok de verduras','pollo','tofu','arroz','fideos'],['pollo','tofu','arroz','pasta','verdura']],
 ['a-miso-yogur','Aderezo de miso y yogur','miso|yogur natural|limón|ajonjolí',['cremosa','asiatica'],['pescado','tofu','berenjena','brócoli','arroz'],['pescado','tofu','berenjena','brocoli','arroz']],
 ['a-thai-lima','Aderezo thai de lima y cilantro','limón|cilantro|salsa de soya baja en sodio|maní',['asiatica','fresco'],['ensalada de repollo','pollo','camarón','fideos','verduras al wok'],['pollo','pescado','pasta','ensalada','verdura']],
 ['a-cacahuate','Salsa ligera de maní y lima','maní|limón|salsa de soya baja en sodio|agua',['cremosa','asiatica'],['pollo satay','tofu','fideos','pepino','verduras al wok'],['pollo','tofu','pasta','pepino','verdura']],
 ['a-gochujang-suave','Salsa coreana suave de yogur y gochujang','yogur natural|gochujang|limón|ajonjolí',['cremosa','coreana'],['pollo','tofu','arroz','brócoli','repollo'],['pollo','tofu','arroz','brocoli','verdura']],
 ['a-sesamo-jengibre','Aderezo de ajonjolí y jengibre','ajonjolí|jengibre|limón|aceite vegetal',['vinagreta','asiatica'],['ensaladas','tofu','pollo','brócoli','fideos'],['pollo','tofu','ensalada','brocoli','pasta']],
 ['a-cilantro-jalapeno','Salsa verde suave de cilantro y jalapeño','cilantro|jalapeño|limón|yogur natural',['cremosa','mexicana'],['tacos','pollo','pescado','fríjoles','maíz'],['pollo','pescado','frijol','maiz','ensalada']],
 ['a-chipotle-yogur','Salsa de chipotle y yogur','yogur natural|chipotle|limón',['cremosa','mexicana'],['pollo','tacos','papa','maíz','hamburguesas de legumbres'],['pollo','papa','maiz','garbanzo','frijol']],
 ['a-aji-amarillo-yogur','Crema suave de ají amarillo y yogur','ají amarillo|yogur natural|limón',['cremosa','peruana'],['pollo','papa','pescado','quinua','verduras'],['pollo','pescado','papa','quinua','verdura']],
 ['a-huacatay-yogur','Salsa de huacatay y yogur','huacatay|yogur natural|limón',['cremosa','peruana'],['pollo','papa','maíz','quinua','vegetales asados'],['pollo','papa','maiz','quinua','verdura']],
 ['a-raita','Raita de pepino y menta','yogur natural|pepino cohombro|menta|limón',['cremosa','india'],['curry','pollo especiado','garbanzos','arroz','verduras asadas'],['pollo','garbanzo','arroz','pepino','verdura']],
 ['a-chutney-cilantro','Chutney verde suave de cilantro','cilantro|menta|limón|yogur natural',['cremosa','india'],['pollo','garbanzos','papa','arroz','torticas de legumbres'],['pollo','garbanzo','papa','arroz','lenteja']],
 ['a-tahini-limon','Salsa de tahini y limón','tahini|limón|ajo|agua',['cremosa','mediterranea'],['garbanzos','berenjena','pollo','pescado','ensaladas'],['garbanzo','berenjena','pollo','pescado','ensalada']],
 ['a-feta-yogur','Crema de feta y yogur','queso feta|yogur natural|limón|orégano seco',['cremosa','mediterranea'],['pollo','pita','tomate','berenjena','ensaladas'],['pollo','pan','tomate','berenjena','ensalada']],
 ['a-mostaza-miel-ligera','Mostaza y miel ligera','mostaza|miel|limón|aceite vegetal',['vinagreta','agridulce'],['pollo','cerdo','repollo','zanahoria','ensaladas verdes'],['pollo','cerdo','ensalada','zanahoria','repollo']],
 ['a-limon-parmesano','Vinagreta de limón y parmesano','limón|queso parmesano|aceite de oliva|mostaza',['vinagreta','italiana'],['ensaladas verdes','pollo','brócoli','pasta fría','calabacín'],['pollo','ensalada','brocoli','pasta','calabacin']],
 ['a-tomate-seco','Crema de tomate seco y yogur','tomate seco|yogur natural|albahaca|limón',['cremosa','mediterranea'],['pollo','pasta','berenjena','pan','verduras asadas'],['pollo','pasta','berenjena','pan','verdura']]
];
for(const [id,name,s,tags,uses,pairs] of sauceNew){const x={id,name,ingredients:s.split('|'),tags,time:10,method:'Salsa / aderezo',uses,pairs};x.steps=sauceSteps(x);C.sauces.push(x)}
})();
