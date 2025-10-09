// ===== Utilidades DOM =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

// ===== Datos: Eventos (línea de tiempo) =====
const eventos = [
  // Orígenes (1850–1880)
  { año: 1857, titulo: "Primera locomotora: La Porteña", texto: "Ferrocarril del Oeste Buenos Aires–Floresta, ~10 km. Primer servicio ferroviario del país.", epoca: "origenes", tags: ["La Porteña","FCO","Buenos Aires"] },
  { año: 1862, titulo: "Ferrocarril Central Argentino concesión", texto: "Iniciativa de William Wheelwright para unir Rosario con Córdoba.", epoca: "origenes", tags: ["Wheelwright","Central Argentino"] },
  { año: 1870, titulo: "Rosario–Córdoba", texto: "Tramo clave que conecta el litoral con el centro productivo.", epoca: "origenes", tags: ["Rosario","Córdoba"] },
  { año: 1872, titulo: "Buenos Aires al Pacífico BAP", texto: "Red con proyección andina; luego San Martín.", epoca: "origenes", tags: ["BAP","Cuyo","Andes"] },
  { año: 1876, titulo: "Ferrocarril Andino", texto: "Integra Cuyo con el Litoral; base de futuros pasos internacionales.", epoca: "origenes", tags: ["Andino","Mendoza","San Juan"] },

  // Expansión (1880–1916)
  { año: 1884, titulo: "Ley de Ferrocarriles de la Nación", texto: "Marco para expansión con capitales británicos y estatales.", epoca: "expansion", tags: ["inversión británica","Estado"] },
  { año: 1886, titulo: "Bahía Blanca, puerto cerealero", texto: "Se afianza como nodo exportador del sur bonaerense.", epoca: "expansion", tags: ["puertos","trigo","Bahía Blanca"] },
  { año: 1891, titulo: "Ferrocarril del Sud luego Roca", texto: "Penetración a la pampa y Patagonia norte.", epoca: "expansion", tags: ["Del Sud","Roca","Patagonia"] },
  { año: 1900, titulo: "Red radial consolidada", texto: "Estructura orientada a puertos: BA, Rosario, Bahía Blanca.", epoca: "expansion", tags: ["radial","puertos"] },
  { año: 1910, titulo: "Consolidación de la red", texto: "Decenas de miles de km y nuevas localidades de estación.", epoca: "consolidacion", tags: ["pueblos de estación","migración interna"] },

  // Consolidación / entre-guerras (1916–1948)
  { año: 1921, titulo: "Electrificación suburbana temprana", texto: "Mejora de servicios metropolitanos tracción eléctrica.", epoca: "consolidacion", tags: ["suburbanos","electrificación"] },
  { año: 1930, titulo: "Crisis y proteccionismo", texto: "Giro hacia el mercado interno; auge manufacturero urbano.", epoca: "consolidacion", tags: ["ISI temprana","protección"] },
  { año: 1947, titulo: "Hacia la nacionalización", texto: "Argentina negocia compra de redes británicas; reorganización integral.", epoca: "consolidacion", tags: ["compra redes","británicas"] },

  // Nacionalización y Estado empresario (desde 1948)
  { año: 1948, titulo: "Nacionalización: Ferrocarriles Argentinos", texto: "Creación de las líneas Mitre, Sarmiento, Roca, San Martín, Belgrano y Urquiza.", epoca: "nacionalizacion", tags: ["Perón","FA","Mitre","Sarmiento","Roca","San Martín","Belgrano","Urquiza"] },
  { año: 1951, titulo: "Plan Quinquenal y talleres", texto: "Mantenimiento y modernización de material y vías.", epoca: "nacionalizacion", tags: ["talleres","planificación"] },
  { año: 1961, titulo: "Plan Larkin racionalización", texto: "Propuestas para cerrar ramales deficitarios y concentrar tráfico.", epoca: "nacionalizacion", tags: ["Plan Larkin","eficiencia"] },
  { año: 1970, titulo: "Pico de extensión operativa", texto: "La red supera los ~47–48 mil km en distintos relevamientos.", epoca: "nacionalizacion", tags: ["extensión","capilaridad"] },

  // Reformas y privatizaciones (1990s)
  { año: 1992, titulo: "Privatizaciones y concesiones", texto: "División operativa; caída de servicios de larga distancia.", epoca: "privatizaciones", tags: ["concesiones","larga distancia"] },
  { año: 1993, titulo: "Cierre de talleres y ramales", texto: "Fuerte impacto social y económico en pueblos ferroviarios.", epoca: "privatizaciones", tags: ["empleo","despoblamiento"] },

  // Siglo XXI (2003–2023)
  { año: 2008, titulo: "Reaperturas parciales", texto: "Vuelven algunos servicios regionales y obras puntuales.", epoca: "siglo21", tags: ["reaperturas","regionales"] },
  { año: 2015, titulo: "Ferrocarriles Argentinos S.E.", texto: "Marco para coordinación de operadores y planificación.", epoca: "siglo21", tags: ["FASE","organización"] },
  { año: 2019, titulo: "Renovación metropolitana", texto: "Material rodante nuevo y mejoras de señalamiento.", epoca: "siglo21", tags: ["AMBA","seguridad"] },
  { año: 2021, titulo: "Carga y logística", texto: "Competencia con camión e hidrovía; foco en eficiencia multimodal.", epoca: "siglo21", tags: ["cargas","puertos","hidrovía"] },
  { año: 2023, titulo: "Mapa actual", texto: "Red más acotada; urbanos clave en AMBA y reanudaciones puntuales.", epoca: "siglo21", tags: ["2023","servicios"] }
];

// ===== Aportes / protagonistas =====
const aportes = [
  { titulo:"William Wheelwright", subtitulo:"Impulsor del Central Argentino", cuerpo:"Conexión Rosario–Córdoba (1870) integró litoral y centro productivo.", etiqueta:"Protagonista" },
  { titulo:"Domingo F. Sarmiento", subtitulo:"Educación e infraestructura", cuerpo:"Promovió obras y pasos andinos, articulando Cuyo con el Litoral.", etiqueta:"Política pública" },
  { titulo:"Inversión británica", subtitulo:"Capital y know-how", cuerpo:"Financió y operó gran parte de la red orientada a puertos de exportación.", etiqueta:"Finanzas" },
  { titulo:"Nacionalización (1948)", subtitulo:"Ferrocarriles Argentinos", cuerpo:"Unificación estatal con líneas Mitre, Sarmiento, Roca, San Martín, Belgrano y Urquiza.", etiqueta:"Estado" },
  { titulo:"Talleres ferroviarios", subtitulo:"Sistemas de mantenimiento", cuerpo:"Formaron técnicos y sostuvieron flotas de vapor y diésel por décadas.", etiqueta:"Trabajo" },
  { titulo:"Electrificación suburbana", subtitulo:"Servicio metropolitano", cuerpo:"Mejoró frecuencias y seguridad en el AMBA desde inicios del siglo XX.", etiqueta:"Tecnología" },
  { titulo:"Plan Larkin (1961)", subtitulo:"Racionalización", cuerpo:"Propuso concentrar tráfico rentable y cerrar ramales deficitarios.", etiqueta:"Gestión" },
  { titulo:"Puertos y ferrocarril", subtitulo:"Logística exportadora", cuerpo:"Red radial a BA, Rosario, Bahía Blanca redujo costos de transporte.", etiqueta:"Territorio" },
  { titulo:"Cordón industrial", subtitulo:"ISI y tren obrero", cuerpo:"El ferrocarril sostuvo movilidad laboral y abastecimiento fabril.", etiqueta:"Industria" },
  { titulo:"Reaperturas recientes", subtitulo:"Servicios regionales", cuerpo:"Volvieron algunos corredores y se modernizó material en AMBA.", etiqueta:"Actualidad" }
];

// ===== Curiosidades =====
const curiosidades = [
  { titulo:"La Porteña", detalle:"Llegó desmontada desde Inglaterra y se armó en Buenos Aires; hoy es ícono ferroviario." },
  { titulo:"Múltiples trochas", detalle:"Ancha, media y angosta: dieron capilaridad pero generaron transbordos y costos." },
  { titulo:"Estaciones-joya", detalle:"Retiro y Constitución: terminales monumentales del cambio de siglo." },
  { titulo:"Talleres propios", detalle:"Grandes complejos (p.ej., Tafí Viejo) sostuvieron reparación y oficios." },
  { titulo:"Tracción mixta", detalle:"Vapor y diésel convivieron por décadas; la electrificación avanzó en suburbanos." },
  { titulo:"Pueblos de estación", detalle:"Muchos nacieron y crecieron alrededor del andén y el galpón de cargas." },
  { titulo:"Trenes internacionales", detalle:"Enlaces andinos y mesopotámicos buscaron salida bioceánica/regional." },
  { titulo:"Mail y encomiendas", detalle:"El tren fue clave para correo y paquetería antes del transporte automotor." },
  { titulo:"Topónimos ferroviarios", detalle:"Barrios y localidades llevan nombres de líneas, estaciones o ingenieros." },
  { titulo:"Museos y preservación", detalle:"Asociaciones y museos mantienen material histórico en circulación." }
];

// ===== Series (para futuros gráficos) =====
const seriesKmVias = [
  { anio: 1880, km: 9000 }, { anio: 1900, km: 30000 }, { anio: 1914, km: 40000 },
  { anio: 1948, km: 45000 }, { anio: 1970, km: 48000 }, { anio: 1995, km: 22000 },
  { anio: 2010, km: 19000 }, { anio: 2023, km: 20000 }
];
const seriesPasajeros = [
  { anio: 1930, idx: 70 }, { anio: 1950, idx: 100 }, { anio: 1975, idx: 120 },
  { anio: 1995, idx: 60 }, { anio: 2015, idx: 95 }, { anio: 2023, idx: 110 }
];
const seriesCargas = [
  { anio: 1950, idx: 70 }, { anio: 1970, idx: 100 }, { anio: 1990, idx: 85 },
  { anio: 2005, idx: 60 }, { anio: 2015, idx: 75 }, { anio: 2023, idx: 82 }
];
const mapasNotas = {
  "1903": [
    "Red en expansión con fuerte tracción británica.",
    "Orientación a puertos exportadores (BA, Rosario, Bahía Blanca).",
    "Capilaridad en Pampa Húmeda; rezagos relativos NOA/NEA profundo."
  ],
  "2023": [
    "Red más acotada; predominio del servicio metropolitano.",
    "Carga compite con camión e hidrovía; reaperturas puntuales.",
    "Proyectos de eficiencia logística y material renovado en AMBA."
  ]
};

// ===== Render: Timeline =====
function renderTimeline(list){
  const cont = $("#timeline");
  cont.innerHTML = "";
  list
    .slice()
    .sort((a,b)=>a.año - b.año)
    .forEach(ev=>{
      const li = document.createElement("li");
      li.className = "item reveal";
      li.innerHTML = `
        <div class="dot"></div>
        <article class="card">
          <header style="display:flex;justify-content:space-between;gap:10px;align-items:baseline">
            <h3 style="margin:0">${ev.año} — ${ev.titulo}</h3>
            <span class="tag">${ev.epoca}</span>
          </header>
          <p>${ev.texto}</p>
          <div class="tags">${(ev.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        </article>`;
      cont.appendChild(li);
    });
  observeReveal();
}

// ===== Render: Aportes =====
function renderAportes(){
  const grid = $("#aportes-grid");
  grid.innerHTML = aportes.map(a=>`
    <article class="card reveal card-link" data-title="${a.titulo}" data-body="${a.cuerpo}">
      <span class="tag">${a.etiqueta}</span>
      <h3>${a.titulo}</h3>
      <p class="muted">${a.subtitulo}</p>
      <button class="btn ghost">Ampliar</button>
    </article>
  `).join("");
  observeReveal();
  $$("#aportes-grid .card-link").forEach(card=>{
    card.addEventListener("click", ()=>{
      openModal(`<h3 style="margin-top:0">${card.dataset.title}</h3><p>${card.dataset.body}</p>`);
    });
  });
}

// ===== Render: Curiosidades =====
function renderCurios(){
  const grid = $("#curios-grid");
  grid.innerHTML = curiosidades.map(c=>`
    <article class="card reveal card-link" data-title="${c.titulo}" data-body="${c.detalle}">
      <h3>${c.titulo}</h3>
      <p>${c.detalle.substring(0,110)}…</p>
      <button class="btn ghost">Leer más</button>
    </article>
  `).join("");
  observeReveal();
  $$("#curios-grid .card-link").forEach(card=>{
    card.addEventListener("click", ()=>{
      openModal(`<h3 style="margin-top:0">${card.dataset.title}</h3><p>${card.dataset.body}</p>`);
    });
  });
}

// ===== Modal =====
const modal = $("#modal");
const modalContent = $("#modal-content");
$(".modal-close").addEventListener("click", ()=> modal.close());
function openModal(html){ modalContent.innerHTML = html; modal.showModal(); }

// ===== Reveal on scroll =====
function observeReveal(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("visible"); }
    });
  },{threshold:.2});
  $$(".reveal").forEach(el=>obs.observe(el));
}

// ===== Filtros =====
$("#buscador").addEventListener("input", filtrar);
$("#filtro-epoca").addEventListener("change", filtrar);
function filtrar(){
  const q = $("#buscador").value.toLowerCase();
  const ep = $("#filtro-epoca").value;
  const lista = eventos.filter(ev=>{
    const matchQ = [
      ev.año, ev.titulo, ev.texto, ...(ev.tags||[])
    ].join(" ").toLowerCase().includes(q);
    const matchE = (ep==="todas") || (ev.epoca===ep);
    return matchQ && matchE;
  });
  renderTimeline(lista);
}

// ===== Custom select accesible =====
function initCustomSelect(){
  const sel = $("#filtro-epoca");
  if(!sel) return;
  const wrap = document.createElement("div");
  wrap.className = "custom-select";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "custom-select__toggle";
  toggle.textContent = sel.selectedOptions[0]?.textContent || "Seleccionar…";
  const list = document.createElement("ul");
  list.className = "custom-select__list";

  Array.from(sel.options).forEach(opt=>{
    const li = document.createElement("li");
    li.className = "custom-select__option";
    li.dataset.value = opt.value;
    li.textContent = opt.text;
    if(opt.selected) li.classList.add("selected");
    li.addEventListener("click", ()=>{
      sel.value = li.dataset.value;
      sel.dispatchEvent(new Event("change",{bubbles:true}));
      toggle.textContent = li.textContent;
      $$(".custom-select__option.selected").forEach(e=>e.classList.remove("selected"));
      li.classList.add("selected");
      list.classList.remove("open");
    });
    list.appendChild(li);
  });

  toggle.addEventListener("click",(ev)=>{
    ev.stopPropagation();
    list.classList.toggle("open");
  });

  document.addEventListener("click",(e)=>{
    if(!wrap.contains(e.target)) list.classList.remove("open");
  });

  wrap.appendChild(toggle);
  wrap.appendChild(list);
  sel.parentNode.insertBefore(wrap, sel.nextSibling);
}

// ===== Quiz (10 preguntas) =====
document.getElementById("quiz-form").addEventListener("submit", (e)=>{
  e.preventDefault();
  const correctas = {
    q1:"1857", q2:"Peron", q3:"Cordoba", q4:"puertos", q5:"larkin",
    q6:"suburbanizacion", q7:"noa", q8:"camion", q9:"colorTren", q10:"bb"
  };
  let ok = 0, total = Object.keys(correctas).length;
  for (const k in correctas){
    const val = new FormData(e.target).get(k);
    if (val === correctas[k]) ok++;
  }
  const out = document.getElementById("quiz-resultado");
  out.textContent = ` ${ok}/${total} correctas`;
  out.style.color = ok===total ? "var(--ok)" : "var(--warn)";
});

// ===== Init =====
function init(){
  renderTimeline(eventos);
  renderAportes();
  renderCurios();
  initCustomSelect();
  observeReveal();
}
document.addEventListener("DOMContentLoaded", init);
