
const btnCrear = document.getElementById('crearBlob');
const btnDescargar = document.getElementById('descargarBlob');
const btnSlice = document.getElementById('sliceBlob');
const resultado = document.getElementById('resultado');


let currentBlob = null;
let objectUrl = null;

bootstrapExtraUI();

function bootstrapExtraUI(){
 
  const bodyChildren = Array.from(document.body.children);

  const container = document.createElement('div');
  container.className = 'container';

  const card = document.createElement('div');
  card.className = 'card';

  const controls = document.createElement('div');
  controls.className = 'controls';

  
  controls.appendChild(btnCrear);
  controls.appendChild(btnDescargar);
  controls.appendChild(btnSlice);

  
  const ta = document.createElement('textarea');
  ta.id = 'fuenteTexto';
  ta.placeholder = 'Escribí el contenido para el Blob (texto plano). Si lo dejás vacío, usaré un ejemplo...';

  
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `
    <span>Tamaño: <b id="meta-size">—</b></span>
    <span>Tipo: <b id="meta-type">—</b></span>
  `;

  
  const helper = document.createElement('div');
  helper.className = 'helper';
  helper.textContent = 'Salida / vista previa:';

  
  card.appendChild(controls);
  card.appendChild(ta);
  card.appendChild(meta);
  card.appendChild(helper);

  
  card.appendChild(resultado);

  container.appendChild(card);

  
  document.body.innerHTML = '';
  document.body.appendChild(bodyChildren[0]); 
  document.body.appendChild(container);

 
  setButtonsEnabled(false);
}


function setButtonsEnabled(hasBlob){
  btnDescargar.disabled = !hasBlob;
  btnSlice.disabled = !hasBlob;
}


function revokeUrl(){
  if(objectUrl){
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}


function updateMeta(){
  const sizeEl = document.getElementById('meta-size');
  const typeEl = document.getElementById('meta-type');
  if(currentBlob){
    sizeEl.textContent = `${currentBlob.size} bytes`;
    typeEl.textContent = currentBlob.type || 'text/plain';
  }else{
    sizeEl.textContent = '—';
    typeEl.textContent = '—';
  }
}

btnCrear.addEventListener('click', () => {
  try{
    revokeUrl();

    const ta = document.getElementById('fuenteTexto');
    const contenido = (ta.value || '').trim() || [
      'Hola! Esto es un ejemplo de Blob.',
      'Podés editar este texto en el área de arriba.',
      'Luego podés descargarlo o usar slice().'
    ].join('\n');

    
    currentBlob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });

    setButtonsEnabled(true);
    updateMeta();
    resultado.textContent = '✔️ Blob de texto creado.\n\nVista previa:\n' + contenido;
  }catch(err){
    console.error(err);
    resultado.textContent = '❌ Error al crear el Blob: ' + err.message;
    currentBlob = null;
    setButtonsEnabled(false);
    updateMeta();
  }
});

btnDescargar.addEventListener('click', () => {
  if(!currentBlob){
    resultado.textContent = '⚠️ No hay un Blob creado.';
    return;
  }
  try{
    revokeUrl();
    objectUrl = URL.createObjectURL(currentBlob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `mi-blob-${Date.now()}.txt`; 
    document.body.appendChild(a);
    a.click();
    a.remove();

    resultado.textContent = '⬇️ Descarga iniciada. (Se revocará la URL al crear un blob nuevo o al salir de la página.)';
  }catch(err){
    console.error(err);
    resultado.textContent = '❌ Error al descargar el Blob: ' + err.message;
  }
});

btnSlice.addEventListener('click', async () => {
  if(!currentBlob){
    resultado.textContent = '⚠️ No hay un Blob creado.';
    return;
  }
  try{
    const start = 0;
    const end = Math.min(50, currentBlob.size);

    const sliced = currentBlob.slice(start, end, currentBlob.type);

    const text = await blobToText(sliced);

    resultado.textContent =
      `✂️ slice(${start}, ${end})\n` +
      `Tamaño del fragmento: ${sliced.size} bytes\n\n` +
      `Contenido:\n${text || '(vacío)'}`;
  }catch(err){
    console.error(err);
    resultado.textContent = '❌ Error usando slice(): ' + err.message;
  }
});

function blobToText(blob){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

window.addEventListener('beforeunload', () => {
  revokeUrl();
});
