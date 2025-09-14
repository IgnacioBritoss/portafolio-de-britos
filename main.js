// ===== Datos base (bien sintéticos, curados para no depender de Internet) =====
const eventos = [
  {
    año: 1857,
    titulo: "Primera locomotora: La Porteña",
    texto: "Inicia el Ferrocarril del Oeste (Buenos Aires–Floresta, ~10 km). Marca el primer servicio ferroviario en Argentina.",
    epoca: "origenes",
    tags: ["La Porteña", "Ferrocarril del Oeste", "Buenos Aires", "Floresta"]
  },
  {
    año: 1863,
    titulo: "Concesión al Central Argentino",
    texto: "Proyecto liderado por William Wheelwright; en 1870 unirá Rosario con Córdoba.",
    epoca: "origenes",
    tags: ["Central Argentino", "Wheelwright", "Rosario", "Córdoba"]
  },
  {
    año: 1870,
    titulo: "Rosario–Córdoba",
    texto: "Se inaugura el tramo clave del Central Argentino, conectando el litoral con el centro del país.",
    epoca: "origenes",
    tags: ["Rosario", "Córdoba", "Central Argentino"]
  },
  {
    año: 1880,
    titulo: "Décadas de expansión",
    texto: "Fuerte crecimiento con capitales británicos y estatales; la red se proyecta a puertos y economías regionales.",
    epoca: "expansion",
    tags: ["inversión británica", "puertos", "expansión"]
  },
  {
    año: 1910,
    titulo: "Consolidación de la red",
    texto: "La red supera varias decenas de miles de km; el ferrocarril estructura el territorio y el comercio exterior.",
    epoca: "consolidacion",
    tags: ["consolidación", "exportaciones", "territorio"]
  },
  {
    año: 1948,
    titulo: "Nacionalización de los ferrocarriles",
    texto: "Bajo Juan D. Perón se crean Ferrocarriles Argentinos (Mitre, Sarmiento, Roca, San Martín, Belgrano y Urquiza).",
    epoca: "nacionalizacion",
    tags: ["Perón", "Ferrocarriles Argentinos", "Mitre", "Sarmiento", "Roca", "San Martín", "Belgrano", "Urquiza"]
  },
  {
    año: 1961,
    titulo: "Recomendaciones de racionalización",
    texto: "Informes técnicos (como el Plan Larkin) sugieren cierres de ramales deficitarios y modernización.",
    epoca: "consolidacion",
    tags: ["Plan Larkin", "cierres", "modernización"]
  },
  {
    año: 1992,
    titulo: "Privatizaciones y concesiones",
    texto: "Proceso de los 90: divisiones operativas, cierres de servicios y nuevas concesiones.",
    epoca: "privatizaciones",
    tags: ["concesiones", "ramales", "servicios"]
  },
  {
    año: 2015,
    titulo: "Ferrocarriles Argentinos S.E.",
    texto: "Se crea la empresa Ferrocarriles Argentinos S.E. y se reorganizan operadores y planificación.",
    epoca: "siglo21",
    tags: ["FASE", "planificación", "operadores"]
  }
];

const aportes = [
  {
    titulo: "William Wheelwright",
    subtitulo: "Impulsor del Central Argentino",
    cuerpo: "Empresario clave en la conexión Rosario–Córdoba (1870). Su trabajo integró litoral y centro productivo.",
    etiqueta: "Protagonista",
  },
  {
    titulo: "Domingo F. Sarmiento",
    subtitulo: "Promotor de educación e infraestructura",
    cuerpo: "Desde su presidencia apoyó expansión ferroviaria y obras andinas, integrando Cuyo con el Litoral.",
    etiqueta: "Política pública",
  },
  {
    titulo: "Inversión británica",
    subtitulo: "Capital y know-how",
    cuerpo: "Construyó gran parte de la red en el siglo XIX, conectando puertos (BA, Rosario, Bahía Blanca) con zonas agroindustriales.",
    etiqueta: "Finanzas",
  },
  {
    titulo: "Nacionalización (1948)",
    subtitulo: "Ferrocarriles Argentinos",
    cuerpo: "Unificación estatal de líneas y estandarización de servicios, con nombres de próceres.",
    etiqueta: "Estado",
  }
];

const curiosidades = [
  {
    titulo: "La Porteña",
    detalle: "La locomotora más famosa llegó desmontada desde Inglaterra y se armó en Buenos Aires. Aún hoy es ícono ferroviario."
  },
  {
    titulo: "Múltiples trochas",
    detalle: "La coexistencia de trocha ancha, media y angosta creó nodos de trasbordo muy particulares."
  },
  {
    titulo: "Estaciones-joya",
    detalle: "Constitución y Retiro son ejemplos de grandes terminales con arquitectura monumental del cambio de siglo."
  },
  {
    titulo: "Trenes a vapor y diésel",
    detalle: "La transición tecnológica convivió por décadas, con talleres propios que formaron técnicos especializados."
  }
];

// ===== Utilidades UI =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

function renderTimeline(list){
  const cont = $("#timeline");
  cont.innerHTML = "";
  list
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
          <div class="tags">${ev.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        </article>`;
      cont.appendChild(li);
    });
  observeReveal();
}

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
  // abrir modal
  $$("#aportes-grid .card-link").forEach(card=>{
    card.addEventListener("click", ()=>{
      openModal(`<h3 style="margin-top:0">${card.dataset.title}</h3><p>${card.dataset.body}</p>`);
    });
  });
}

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

// Modal
const modal = $("#modal");
const modalContent = $("#modal-content");
$(".modal-close").addEventListener("click", ()=> modal.close());
function openModal(html){ modalContent.innerHTML = html; modal.showModal(); }

// Reveal on scroll
function observeReveal(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add("visible"); }
    });
  },{threshold:.2});
  $$(".reveal").forEach(el=>obs.observe(el));
}

// Filtros
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

// Quiz
$("#quiz-form").addEventListener("submit", (e)=>{
  e.preventDefault();
  const r1 = new FormData(e.target).get("q1");
  const r2 = new FormData(e.target).get("q2");
  const r3 = new FormData(e.target).get("q3");
  let ok = 0;
  if(r1==="1857") ok++;
  if(r2==="Peron") ok++;
  if(r3==="Cordoba") ok++;
  $("#quiz-resultado").textContent = `✔️ ${ok}/3 correctas`;
  $("#quiz-resultado").style.color = ok===3 ? "var(--ok)" : "var(--warn)";
});

// Custom dropdown para #filtro-epoca (mantiene el select real para accesibilidad)
function initCustomSelect(){
  const sel = $("#filtro-epoca");
  if(!sel) return;
  // crear UI
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
      // setear valor en select real y disparar change
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

  // cerrar al click afuera
  document.addEventListener("click",(e)=>{
    if(!wrap.contains(e.target)) list.classList.remove("open");
  });

  wrap.appendChild(toggle);
  wrap.appendChild(list);
  sel.parentNode.insertBefore(wrap, sel.nextSibling);
}

// Init
renderTimeline(eventos);
renderAportes();
renderCurios();
initCustomSelect();
observeReveal();
