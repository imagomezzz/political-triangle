/**
 * EL TRIÁNGULO POLÍTICO — main.js
 * Codebook V3.2
 *
 * Módulos:
 *  1. Estado global
 *  2. Datos: vértices, índices, casos ilustrativos
 *  3. Nav: scroll, modo especialista, hamburger
 *  4. Triángulo interactivo (sliders + clic en SVG)
 *  5. Cálculo de posición y zona
 *  6. Panel de posición
 *  7. Tooltip de vértices
 *  8. Casos ilustrativos
 *  9. Tarjetas de índices (toggle individual)
 * 10. Scroll reveal
 * 11. Hero mini-triángulo
 * 12. Init
 */

'use strict';

/* ══════════════════════════════════════════════════
   1. ESTADO GLOBAL
══════════════════════════════════════════════════ */
const state = {
  expertMode: false,
  studentMode: false,
  dualView: false,
  showTrayectorias: false,
  iae: 50,
  iue: 0,
  activeCaso: null,
};

/* ══════════════════════════════════════════════════
   2. DATOS
══════════════════════════════════════════════════ */

/** Vértices del triángulo — extremos conceptuales */
const VERTICES = {
  anarquia: {
    label: 'Anarquía',
    iae: 0,
    iue: 0,
    color: '#4A90D9',
    desc: 'Ausencia de Estado. IAE = 0: no hay aparato coercitivo. El IUE no tiene sentido cuando no hay Estado que lo oriente.',
    detail: 'Ningún régimen real alcanza este vértice. Es el límite conceptual de la ausencia de coerción estatal.',
  },
  comunismo: {
    label: 'Comunismo · Homogeneidad económica',
    iae: 100,
    iue: -100,
    color: '#C0392B',
    desc: 'Estado total con orientación universalista-progresista. IAE = 100, IUE = −100: máximo alcance estatal orientado a eliminar diferencias económicas por vía coercitiva. Los regímenes históricos que se acercaron a este vértice documentan terror sistemático y crímenes de lesa humanidad.',
    detail: 'IUE_efectivo = −100. El Estado es omnipresente y su proyecto es la homogeneización económica total. Protocolo de coerción extrema aplicable: ningún régimen histórico con IAE > 85 e IUE < −70 opera sin supresión violenta documentada de la disidencia.',
    highCoercion: true,
  },
  fascismo: {
    label: 'Fascismo · Teocracia · Homogeneidad cultural',
    iae: 100,
    iue: 100,
    color: '#8B1A1A',
    desc: 'Estado total con orientación particularista. IAE = 100, IUE = +100: máximo alcance estatal orientado a imponer un orden cultural, nacional o religioso. Los regímenes históricos que se acercaron a este vértice documentan terror sistemático y crímenes de lesa humanidad.',
    detail: 'IUE_efectivo = +100. La coerción se dirige a eliminar la diversidad en nombre de una identidad particular. Protocolo de coerción extrema aplicable: ningún régimen histórico con IAE > 85 e IUE > 70 opera sin supresión violenta documentada de la disidencia.',
    highCoercion: true,
  },
};

/** Zonas del triángulo con sus rangos aproximados */
const ZONAS = [
  {
    id: 'anarquia_cercana',
    label: 'Zona de baja coerción',
    labelTech: 'IAE < 15',
    desc: 'Estados muy débiles o en proceso de colapso. Poca capacidad coercitiva real.',
    iae_max: 15,
  },
  {
    id: 'liberal',
    label: 'Liberalismo',
    labelTech: 'IAE 15–45 · IUE −30 a +30',
    desc: 'Estado presente pero limitado. Protege derechos y libertades individuales sin imponer un proyecto cultural uniforme.',
    iae_min: 15, iae_max: 45, iue_min: -30, iue_max: 30,
  },
  {
    id: 'social_democracia',
    label: 'Social democracia',
    labelTech: 'IAE 30–60 · IUE −60 a −10',
    desc: 'Estado de bienestar con orientación redistributiva. Interviene activamente en la economía para reducir desigualdades.',
    iae_min: 30, iae_max: 60, iue_min: -60, iue_max: -10,
  },
  {
    id: 'conservadurismo',
    label: 'Conservadurismo democrático',
    labelTech: 'IAE 30–60 · IUE 10 a 60',
    desc: 'Estado presente con orientación hacia el orden cultural y social establecido, pero con contrapesos democráticos.',
    iae_min: 30, iae_max: 60, iue_min: 10, iue_max: 60,
  },
  {
    id: 'intervencionismo',
    label: 'Intervencionismo',
    labelTech: 'IAE 38–58 · IUE −20 a +20',
    desc: 'Estado muy activo en la economía y la regulación, sin orientación ideológica clara. Común en economías mixtas.',
    iae_min: 38, iae_max: 58, iue_min: -20, iue_max: 20,
  },
  {
    id: 'autoritarismo_mercado',
    label: 'Autoritarismo de mercado',
    labelTech: 'IAEc alto · IAEe bajo',
    desc: 'Control político estricto combinado con economía relativamente libre. Asimetría IAEc/IAEe característica.',
  },
  {
    id: 'democratico',
    label: 'Zona de estados democráticos',
    labelTech: 'IAE 25–55, pluralismo real',
    desc: 'Espacio interior del triángulo donde coexisten proyectos políticos opuestos y el poder está distribuido.',
    iae_min: 25, iae_max: 55,
  },
];

/** Casos ilustrativos */
const CASOS = [
  {
    id: 'noruega',
    label: 'Noruega',
    periodo: 'actual',
    iae: 40,
    iue: -40,
    color: '#1B5C9E',
    zona: 'Social democracia',
    filter: 'democratico',
    desc: 'Estado de bienestar fuerte con orientación redistributiva y alta legitimidad institucional. IAEc muy bajo (libertades sólidas), IAEe elevado por gasto público y carga tributaria.',
    indices: { iaec: 32, iaee: 49 },
    iaec: 32,
    iaee_val: 49,
  },
  {
    id: 'suiza',
    label: 'Suiza',
    periodo: 'actual',
    iae: 32,
    iue: 8,
    color: '#2874A6',
    zona: 'Liberalismo moderado',
    filter: 'democratico',
    desc: 'Alcance estatal bajo-moderado con leve sesgo conservador. IAEc y IAEe casi equilibrados (~33/30). Estado mínimo en lo económico, Estado de derecho muy sólido.',
    indices: { iaec: 33, iaee: 30 },
    iaec: 33,
    iaee_val: 30,
  },
  {
    id: 'eeuu',
    label: 'EE.UU.',
    periodo: '2000s',
    iae: 34,
    iue: 20,
    color: '#1A4A7A',
    zona: 'Liberalismo conservador',
    filter: 'democratico',
    desc: 'Alcance estatal moderado-bajo con orientación conservadora en lo cultural y liberal en lo económico. CE moderado por captura corporativa.',
    indices: { iaec: 40, iaee: 27 },
    iaec: 40,
    iaee_val: 27,
  },
  {
    id: 'hungria',
    label: 'Hungría',
    periodo: '2022',
    iae: 43,
    iue: 55,
    color: '#7B3F00',
    zona: 'Autoritarismo electoral',
    filter: 'autoritario',
    desc: 'Autoritarismo electoral con proyecto nacionalista-conservador. CE alto reduce IAEe efectivo. IAEc elevado por captura informacional y debilitamiento institucional progresivo.',
    indices: { iaec: 44, iaee: 42 },
    iaec: 44,
    iaee_val: 42,
  },
  {
    id: 'singapur',
    label: 'Singapur',
    periodo: '2020',
    iae: 32,
    iue: 15,
    color: '#8B6914',
    zona: 'Autoritarismo por desempeño',
    filter: 'autoritario',
    desc: 'Autoritarismo por desempeño. Asimetría R1 marcada: IAEc (44) muy superior a IAEe (21). Control político con economía muy libre. Legitimidad basada en resultados, no en pluralismo.',
    indices: { iaec: 44, iaee: 21 },
    iaec: 44,
    iaee_val: 21,
  },
  {
    id: 'china',
    label: 'China',
    periodo: 'actual',
    iae: 51,
    iue: -15,
    color: '#C0392B',
    zona: 'Autoritarismo de mercado',
    filter: 'autoritario',
    desc: 'Alto control civil (IAEc=58) con economía parcialmente liberalizada (IAEe=44). Asimetría R1 estructural: el Estado controla la sociedad pero no la economía en igual medida.',
    indices: { iaec: 58, iaee: 44 },
    iaec: 58,
    iaee_val: 44,
    highCoercion: true,
  },
  {
    id: 'venezuela',
    label: 'Venezuela',
    periodo: '2010s',
    iae: 51,
    iue: -65,
    color: '#E07B20',
    zona: 'Autoritarismo izquierdista',
    filter: 'autoritario',
    desc: 'Expansión estatal con proyecto homogeneizador económico. CE alto por captura de élites del partido reduce el IAEe efectivo. Coerción documentada sobre disidencia.',
    indices: { iaec: 58, iaee: 43 },
    iaec: 58,
    iaee_val: 43,
    highCoercion: true,
    trayectoria: {
      label: 'Venezuela 1999',
      iae: 40,
      iue: -28,
      color: '#E07B20',
      desc: 'Inicio del gobierno de Chávez: alcance estatal moderado, orientación redistributiva incipiente.',
    },
  },
  {
    id: 'iran',
    label: 'Irán',
    periodo: 'actual',
    iae: 49,
    iue: 80,
    color: '#8B1A1A',
    zona: 'Teocracia autoritaria',
    filter: 'autoritario',
    desc: 'Estado con fuerte orientación religiosa particularista. IAEc muy alto (61) por control civil y represión. IAEe moderado (37) con CE por captura de Guardia Revolucionaria.',
    indices: { iaec: 61, iaee: 37 },
    iaec: 61,
    iaee_val: 37,
    highCoercion: true,
    trayectoria: {
      label: 'Irán 1979',
      iae: 44,
      iue: 55,
      color: '#8B1A1A',
      desc: 'Revolución Islámica: expansión inicial del aparato estatal con fuerte proyecto teocrático en construcción.',
    },
  },
  {
    id: 'somalia',
    label: 'Somalia',
    periodo: '1990s',
    iae: 9,
    iue: 0,
    color: '#888',
    zona: 'Estado fallido',
    filter: 'extremo',
    desc: 'Colapso del Estado. FTE = 0.80: el monopolio de la violencia se fragmenta entre actores armados no estatales. IAEc formal (39) colapsado a efectivo (8) por fragmentación territorial.',
    indices: { iaec: 8, iaee: 9 },
    iaec: 8,
    iaee_val: 9,
  },
  {
    id: 'suecia_80',
    label: 'Suecia',
    periodo: '1980s',
    iae: 45,
    iue: -55,
    color: '#0F6E5A',
    zona: 'Social democracia plena',
    filter: 'democratico',
    desc: 'Modelo de Estado de bienestar en su punto de mayor expansión. IAEc muy bajo (33), IAEe elevado (57) por gasto público ~62% del PIB, alta carga tributaria y regulación laboral.',
    indices: { iaec: 33, iaee: 57 },
    iaec: 33,
    iaee_val: 57,
    trayectoria: {
      label: 'Suecia 2020s',
      iae: 40,
      iue: -28,
      color: '#0F6E5A',
      desc: 'Retroceso moderado del Estado de bienestar: gasto/PIB cae a ~49%, regulación laboral más flexible.',
    },
  },
  {
    id: 'chile_pinochet',
    label: 'Chile',
    periodo: 'Pinochet tardío ~1985',
    iae: 40,
    iue: 50,
    color: '#5C4A1A',
    zona: 'Autoritarismo moderado de derecha',
    filter: 'autoritario',
    desc: 'Autoritarismo de derecha con liberalización económica. IAEc elevado (53) por represión política y control de FF.AA. IAEe bajo (27) por desregulación y apertura de mercados.',
    indices: { iaec: 53, iaee: 27 },
    iaec: 53,
    iaee_val: 27,
    highCoercion: true,
  },
  {
    id: 'urss_stalin',
    label: 'URSS',
    periodo: 'estalinista ~1950',
    iae: 73,
    iue: -90,
    color: '#7A0000',
    zona: 'Totalitarismo de izquierda',
    filter: 'extremo',
    desc: 'Estado totalitario con proyecto de homogeneización económica absoluta. IAEc máximo (69) por terror sistemático y control total. IAEe muy alto (76) por economía planificada centralmente.',
    indices: { iaec: 69, iaee: 76 },
    iaec: 69,
    iaee_val: 76,
    highCoercion: true,
  },
  {
    id: 'alemania_nazi',
    label: 'Alemania Nazi',
    periodo: '1938',
    iae: 60,
    iue: 85,
    color: '#4A1A1A',
    zona: 'Fascismo histórico',
    filter: 'extremo',
    desc: 'Expansión total del aparato estatal con proyecto homogeneizador cultural de carácter genocida. IAEc máximo (68) por terror de Estado. IAEe elevado (52) por economía de guerra dirigida.',
    indices: { iaec: 68, iaee: 52 },
    iaec: 68,
    iaee_val: 52,
    highCoercion: true,
    trayectoria: {
      label: 'Alemania 1933',
      iae: 46,
      iue: 50,
      color: '#4A1A1A',
      desc: 'Toma del poder: alcance estatal moderado en expansión, uso del Estado virando hacia la homogeneización cultural.',
    },
  },
];

/* ══════════════════════════════════════════════════
   3. NAV
══════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('modeToggle');
  const modeLabel = document.getElementById('modeLabel');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  // Scroll shadow
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // Modo progresivo: público → estudiante → especialista → público
  // El botón muestra el estado ACTUAL (no el siguiente)
  const MODES = [
    { key: 'public',   label: 'Público',       bodyClass: '',            title: 'Modo público — clic para ver más detalle' },
    { key: 'student',  label: 'Estudiante',    bodyClass: 'student-mode', title: 'Modo estudiante — clic para ver notas técnicas' },
    { key: 'expert',   label: 'Especialista',  bodyClass: 'expert-mode',  title: 'Modo especialista — clic para volver al modo público' },
  ];
  let modeIndex = 0;

  function applyMode(idx) {
    document.body.classList.remove('student-mode', 'expert-mode');
    const mode = MODES[idx];
    if (mode.bodyClass) document.body.classList.add(mode.bodyClass);
    modeLabel.textContent = mode.label;
    toggle.setAttribute('title', mode.title);
    toggle.setAttribute('aria-label', mode.title);
    state.expertMode = mode.key === 'expert';
    state.studentMode = mode.key === 'student';

    // Indicador de color
    const indicator = document.getElementById('modeIndicator');
    if (indicator) {
      indicator.style.color = mode.key === 'expert' ? '#fff'
                            : mode.key === 'student' ? 'var(--teal)'
                            : 'var(--ink-4)';
    }

    updateIndexCards();
    updateContextReading();
    document.querySelectorAll('.card-student').forEach(el => {
      el.hidden = !state.studentMode && !state.expertMode;
    });
    document.querySelectorAll('.card-technical').forEach(el => {
      if (state.expertMode) el.hidden = false;
      else if (!state.studentMode) el.hidden = true;
    });
  }

  toggle.addEventListener('click', () => {
    modeIndex = (modeIndex + 1) % MODES.length;
    applyMode(modeIndex);
  });

  applyMode(0); // estado inicial

  // Hamburger
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });

  // Cerrar menú al navegar
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });

  // Active link en scroll
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const observerCb = (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  };

  const sectionObserver = new IntersectionObserver(observerCb, {
    rootMargin: '-40% 0px -55% 0px',
  });
  sections.forEach(s => sectionObserver.observe(s));
}

/* ══════════════════════════════════════════════════
   4. TRIÁNGULO INTERACTIVO
══════════════════════════════════════════════════ */

/**
 * Coordenadas del triángulo SVG:
 *  Vértice anarquía  = (300, 40)
 *  Vértice comunismo = (80, 490)
 *  Vértice fascismo  = (520, 490)
 *
 * Mapeamos IAE e IUE a coordenadas usando coordenadas baricéntricas.
 */

const TRI = {
  // Vértice superior (Anarquía)
  A: { x: 320, y: 36,  iae: 0,   iue: 0 },
  // Vértice inferior izquierdo (Comunismo)
  C: { x: 100,  y: 466, iae: 100, iue: -100 },
  // Vértice inferior derecho (Fascismo)
  F: { x: 540, y: 466, iae: 100, iue: 100 },
};

/**
 * De índices (iae 0–100, iue −100 a +100) a coordenadas SVG.
 * Usamos pesos baricéntricos:
 *  w_A = 1 - iae/100
 *  w_C = (iae/100) * (1 - iue_norm)     // iue_norm = (iue+100)/200
 *  w_F = (iae/100) * iue_norm
 */
function indicesToXY(iae, iue) {
  const iaeN = Math.max(0, Math.min(100, iae)) / 100;
  const iueN = (Math.max(-100, Math.min(100, iue)) + 100) / 200;
  const wA = 1 - iaeN;
  const wC = iaeN * (1 - iueN);
  const wF = iaeN * iueN;
  return {
    x: wA * TRI.A.x + wC * TRI.C.x + wF * TRI.F.x,
    y: wA * TRI.A.y + wC * TRI.C.y + wF * TRI.F.y,
  };
}

/**
 * De coordenadas SVG a índices (clic en el triángulo).
 */
function xyToIndices(x, y, svgEl) {
  // Obtener bounding box del SVG
  const vb = svgEl.viewBox.baseVal;
  const rect = svgEl.getBoundingClientRect();
  const scaleX = vb.width / rect.width;
  const scaleY = vb.height / rect.height;
  const svgX = x * scaleX;
  const svgY = y * scaleY;

  // Resolver sistema baricéntrico inverso
  // P = wA*A + wC*C + wF*F, wA+wC+wF=1
  // Resolver via Cramer
  const denom = (TRI.C.y - TRI.F.y) * (TRI.A.x - TRI.F.x) + (TRI.F.x - TRI.C.x) * (TRI.A.y - TRI.F.y);
  if (Math.abs(denom) < 1e-10) return null;

  const wA = ((TRI.C.y - TRI.F.y) * (svgX - TRI.F.x) + (TRI.F.x - TRI.C.x) * (svgY - TRI.F.y)) / denom;
  const wC = ((TRI.F.y - TRI.A.y) * (svgX - TRI.F.x) + (TRI.A.x - TRI.F.x) * (svgY - TRI.F.y)) / denom;
  const wF = 1 - wA - wC;

  // Fuera del triángulo
  if (wA < -0.01 || wC < -0.01 || wF < -0.01) return null;

  // Calcular índices
  const iaeN = wC + wF; // 1 - wA
  const iueN = wF / (wC + wF + 1e-10);

  return {
    iae: Math.round(Math.max(0, Math.min(100, iaeN * 100))),
    iue: Math.round(Math.max(-100, Math.min(100, (iueN * 200) - 100))),
  };
}

function initTriangle() {
  const svg = document.getElementById('mainTriangle');
  const iaeSlider = document.getElementById('iaeSlider');
  const iueSlider = document.getElementById('iueSlider');
  const iaeValEl = document.getElementById('iaeVal');
  const iueValEl = document.getElementById('iueVal');

  if (!svg) return;

  // Dual-view toggle
  const dualToggle = document.getElementById('dualViewToggle');
  if (dualToggle) {
    dualToggle.addEventListener('change', () => {
      state.dualView = dualToggle.checked;
      renderUserPoint();
    });
  }

  // Actualizar punto desde sliders
  function updateFromSliders() {
    state.iae = parseInt(iaeSlider.value, 10);
    state.iue = parseInt(iueSlider.value, 10);
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;
    renderUserPoint();
    updatePositionPanel();
    updateContextReading();
    updateIUEAxis();
  }

  iaeSlider.addEventListener('input', updateFromSliders);
  iueSlider.addEventListener('input', updateFromSliders);

  // Clic en SVG
  svg.addEventListener('click', (e) => {
    const svgRect = svg.getBoundingClientRect();
    const localX = e.clientX - svgRect.left;
    const localY = e.clientY - svgRect.top;
    const result = xyToIndices(localX, localY, svg);
    if (!result) {
      // Feedback visual: parpadeo del borde del triángulo
      const poly = document.getElementById('triPolygon');
      if (poly) {
        poly.style.transition = 'stroke 0.15s, stroke-width 0.15s';
        poly.style.stroke = 'var(--amber)';
        poly.style.strokeWidth = '3';
        setTimeout(() => {
          poly.style.stroke = 'var(--border-main)';
          poly.style.strokeWidth = '1.5';
        }, 400);
      }
      return;
    }

    state.iae = result.iae;
    state.iue = result.iue;

    iaeSlider.value = state.iae;
    iueSlider.value = state.iue;
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;

    renderUserPoint();
    updatePositionPanel();
    updateContextReading();
    updateIUEAxis();
  });

  // Touch drag en SVG
  svg.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const svgRect = svg.getBoundingClientRect();
    const localX = touch.clientX - svgRect.left;
    const localY = touch.clientY - svgRect.top;
    const result = xyToIndices(localX, localY, svg);
    if (!result) return;
    state.iae = result.iae;
    state.iue = result.iue;
    iaeSlider.value = state.iae;
    iueSlider.value = state.iue;
    iaeValEl.textContent = state.iae;
    iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;
    renderUserPoint();
    updatePositionPanel();
    updateContextReading();
    updateIUEAxis();
  }, { passive: false });

  // Vértices clicables
  Object.keys(VERTICES).forEach(key => {
    const el = document.getElementById(`v-${key}`);
    if (!el) return;
    el.addEventListener('click', () => showVertexTooltip(key, el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showVertexTooltip(key, el);
      }
    });
  });

  // Clic fuera cierra tooltip
  document.addEventListener('click', (e) => {
    const tooltip = document.getElementById('triangleTooltip');
    if (!tooltip.hidden && !e.target.closest('.vertex')) {
      tooltip.hidden = true;
    }
  });

  // Render inicial
  updateFromSliders();
}

function renderUserPoint() {
  const svg = document.getElementById('mainTriangle');
  if (!svg) return;
  const dot = document.getElementById('userDot');
  const pulse = document.getElementById('userPulse');
  if (!dot || !pulse) return;

  const { x, y } = indicesToXY(state.iae, state.iue);

  dot.setAttribute('cx', x);
  dot.setAttribute('cy', y);
  dot.setAttribute('opacity', '1');

  pulse.setAttribute('cx', x);
  pulse.setAttribute('cy', y);
  pulse.setAttribute('opacity', '1');

  // Vista dual IAEc / IAEe
  const dualDotC = document.getElementById('dualDotC');
  const dualLabelC = document.getElementById('dualLabelC');
  const dualLine = document.getElementById('dualLine');
  const dualGroup = document.getElementById('dualPointC');

  if (dualDotC && dualLine && dualGroup) {
    if (state.dualView) {
      // La asimetría IAEc/IAEe solo es significativa en regímenes con IAE alto.
      // Por debajo de 40 el toggle muestra una advertencia en lugar de datos engañosos.
      const hintEl = document.getElementById('dualViewHint');

      if (state.iae < 40) {
        // Ocultar puntos extra, mostrar aviso
        dualGroup.setAttribute('opacity', '0');
        dualLine.setAttribute('opacity', '0');
        const iaeeLbl = document.getElementById('dualLabelE');
        if (iaeeLbl) iaeeLbl.setAttribute('opacity', '0');
        if (hintEl) {
          hintEl.textContent = 'La asimetría IAEc/IAEe es relevante cuando el IAE supera 40. Con alcance estatal bajo, ambos sub-índices convergen.';
          hintEl.hidden = false;
        }
      } else {
        if (hintEl) hintEl.hidden = true;
        // Asimetría plausible para IAE medio-alto:
        // IAEc tiende a crecer más rápido que IAEe en autoritarismos de mercado.
        // Rango de asimetría: hasta ±20% según posición IUE.
        // IUE muy positivo → IAEc mucho mayor (control civil fuerte, economía semi-libre)
        // IUE muy negativo → IAEe mayor (colectivización económica, control civil menor)
        const iueNorm = state.iue / 100; // -1 a +1
        const asymmetry = iueNorm * 0.15; // ±15%
        const iaecVal = Math.max(0, Math.min(100, Math.round(state.iae * (1 + asymmetry + 0.05))));
        const iaeeVal = Math.max(0, Math.min(100, Math.round(state.iae * (1 - asymmetry - 0.05))));
        const { x: cx, y: cy } = indicesToXY(iaecVal, state.iue);

        dualDotC.setAttribute('cx', cx);
        dualDotC.setAttribute('cy', cy);
        if (dualLabelC) {
          dualLabelC.setAttribute('x', cx);
          dualLabelC.setAttribute('y', cy - 14);
          dualLabelC.textContent = `IAEc≈${iaecVal}`;
        }
        dualGroup.setAttribute('opacity', '1');
        dualLine.setAttribute('x1', x);
        dualLine.setAttribute('y1', y);
        dualLine.setAttribute('x2', cx);
        dualLine.setAttribute('y2', cy);
        dualLine.setAttribute('opacity', '0.7');

        // Etiqueta IAEe al punto principal
        let iaeeLbl = document.getElementById('dualLabelE');
        if (!iaeeLbl) {
          iaeeLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          iaeeLbl.setAttribute('id', 'dualLabelE');
          iaeeLbl.setAttribute('text-anchor', 'middle');
          iaeeLbl.setAttribute('font-family', 'DM Sans, sans-serif');
          iaeeLbl.setAttribute('font-size', '9');
          iaeeLbl.setAttribute('fill', 'var(--c-iaee-bg)');
          svg.appendChild(iaeeLbl);
        }
        iaeeLbl.setAttribute('x', x);
        iaeeLbl.setAttribute('y', y - 14);
        iaeeLbl.textContent = `IAEe≈${iaeeVal}`;
        iaeeLbl.setAttribute('opacity', '1');
      }
    } else {
      dualGroup.setAttribute('opacity', '0');
      dualLine.setAttribute('opacity', '0');
      const iaeeLbl = document.getElementById('dualLabelE');
      if (iaeeLbl) iaeeLbl.setAttribute('opacity', '0');
      const hintEl = document.getElementById('dualViewHint');
      if (hintEl) hintEl.hidden = true;
    }
  }
}

/* ══════════════════════════════════════════════════
   5. CÁLCULO DE ZONA
══════════════════════════════════════════════════ */
function calcZone(iae, iue) {
  if (iae < 12) return 'Estado mínimo / Colapso';
  if (iae < 35) {
    if (iue < -30)      return 'Liberalismo de izquierda';
    if (iue > 30)       return 'Liberalismo conservador';
    return 'Liberalismo';
  }
  if (iae < 58) {
    if (iue < -50)      return 'Social democracia';
    if (iue < -20)      return 'Centro-izquierda';
    if (iue > 50)       return 'Conservadurismo';
    if (iue > 20)       return 'Centro-derecha';
    return 'Centro democrático';
  }
  // IAE >= 58
  if (iue < -60)        return 'Autoritarismo de izquierda';
  if (iue > 60)         return 'Autoritarismo de derecha';
  return 'Autoritarismo pragmático';
}

function calcIUEe(iae, iue) {
  return ((iue / 100) * iae).toFixed(1);
}

/* ══════════════════════════════════════════════════
   5b. LECTURA CONTEXTUAL VIVA
══════════════════════════════════════════════════ */

const CONTEXT_DB = [
  // Estado mínimo / colapso
  {
    test: (iae) => iae < 12,
    public: 'El Estado tiene una presencia muy débil o inexistente. No hay monopolio real de la fuerza: la coerción está fragmentada entre actores no estatales.',
    student: 'Ojo: un IAE bajo no significa libertad. Puede indicar colapso institucional, donde la violencia la ejercen grupos armados, milicias o señores de la guerra en lugar del Estado.',
    expert: 'IAE < 12: zona de colapso estatal. FTE elevada. El modelo opera en modo degradado: los índices formales no capturan la distribución real de la coerción.',
  },
  // Liberalismo clásico
  {
    test: (iae, iue) => iae >= 12 && iae < 35 && iue >= -30 && iue <= 30,
    public: 'Estado presente pero limitado, sin orientación ideológica fuerte. Protege derechos individuales sin imponer un proyecto cultural uniforme.',
    student: 'Esta zona es la que los pensadores liberales clásicos consideraban óptima: Estado como árbitro, no como actor transformador. El bajo IAE implica que el Estado tiene capacidad limitada para imponer cualquier agenda, sea de izquierda o de derecha.',
    expert: 'Zona liberal clásica: IAE 12–35, IUE ±30. IUEe bajo en valor absoluto. Alta sensibilidad al IC2 negativo (crisis puede empujar hacia autoritarismo con IAE bajo).',
  },
  // Liberalismo de izquierda
  {
    test: (iae, iue) => iae >= 12 && iae < 38 && iue < -30,
    public: 'Estado relativamente pequeño con orientación progresista: protege libertades individuales y promueve derechos civiles universales, pero con capacidad limitada para redistribuir recursos.',
    student: 'El bajo IAE es la restricción clave: aunque el Estado quiere redistribuir (IUE negativo), tiene poca capacidad real para hacerlo. La intención universalista no se traduce necesariamente en impacto efectivo.',
    expert: 'IUEe negativo moderado. Asimetría intención/capacidad. Vulnerable a captura por élites si IAEc < IAEe.',
  },
  // Liberalismo conservador
  {
    test: (iae, iue) => iae >= 12 && iae < 38 && iue > 30,
    public: 'Estado pequeño con orientación conservadora: defiende el orden cultural y social establecido, pero con capacidad limitada de intervención.',
    student: 'Un Estado liberal-conservador puede ser culturalmente restrictivo (IUE alto) pero sin los instrumentos para imponerlo masivamente. Es la diferencia entre una sociedad conservadora y un régimen autoritario conservador.',
    expert: 'IUEe positivo bajo. Baja capacidad coercitiva limita el alcance del proyecto particularista. II1 relativamente alto contiene el IVR.',
  },
  // Social democracia
  {
    test: (iae, iue) => iae >= 35 && iae < 58 && iue < -20,
    public: 'Estado de bienestar con orientación redistributiva. Interviene activamente para reducir desigualdades económicas y garantizar derechos sociales universales.',
    student: 'La combinación de IAE moderado con IUE negativo define el espacio socialdemócrata: el Estado tiene capacidad real de redistribuir y elige usarla hacia la igualdad. Es la zona donde se ubican los países nórdicos actuales.',
    expert: 'Zona de equilibrio estable. IAEc bajo preserva pluralismo político. IAEe elevado financia redistribución. II1 alto actúa como freno al IVR. Riesgo de desplazamiento si IC2 negativo sostenido.',
  },
  // Centro democrático
  {
    test: (iae, iue) => iae >= 35 && iae < 58 && iue >= -20 && iue <= 20,
    public: 'Estado activo en la economía y la regulación, sin orientación ideológica fuerte hacia ningún polo. Zona de alta negociación política y pluralismo.',
    student: 'El centro no es ausencia de política: es la zona donde las fuerzas opuestas se neutralizan mutuamente. Un Estado puede llegar aquí por pragmatismo o porque las coaliciones políticas bloquean movimientos en cualquier dirección.',
    expert: 'IUEe próximo a cero. Equilibrio dinámico, no estático. Sensible a polarización: IC1 elevado puede desplazar rápidamente hacia los extremos del IUE.',
  },
  // Conservadurismo democrático
  {
    test: (iae, iue) => iae >= 35 && iae < 58 && iue > 20,
    public: 'Estado con capacidad real de intervención, orientado a preservar el orden cultural y social establecido. Tiene contrapesos democráticos que limitan el proyecto particularista.',
    student: 'A diferencia del autoritarismo conservador, aquí existen instituciones que moderan el uso del poder. El Estado puede favorecer a grupos particulares, pero no puede eliminar la competencia política.',
    expert: 'Zona de conservadurismo institucionalizado. IAEc moderado preserva mecanismos de accountability. Riesgo de captura si IAEc sube sin aumento de II1.',
  },
  // Autoritarismo izquierdista
  {
    test: (iae, iue) => iae >= 58 && iue < -40,
    public: 'Estado muy poderoso orientado a un proyecto de homogeneización económica. El aparato estatal tiene alcance real sobre la economía y la vida civil, y lo usa para eliminar diferencias de clase o propiedad. A esta escala de coerción, la supresión violenta de la disidencia es estructural, no excepcional.',
    student: 'Alta coerción + orientación universalista: el Estado puede realmente redistribuir, pero también suprime disidencia por medios violentos. Los regímenes históricos en esta zona —URSS estalinista, Camboya bajo los Jemeres Rojos, Corea del Norte— documentan terror sistemático como instrumento de homogeneización. El modelo describe la estructura de poder; no captura la distinción moral entre tipos de coerción.',
    expert: 'IUEe negativo elevado. Protocolo de coerción extrema obligatorio si hay evidencia documentada de crímenes de lesa humanidad. IC2 negativo (crisis económica) típicamente invierte el IVR en estos regímenes. CE elevado si las élites del partido capturan el aparato redistribuidor.',
  },
  // Autoritarismo pragmático
  {
    test: (iae, iue) => iae >= 58 && iue >= -40 && iue <= 40,
    public: 'Estado muy poderoso sin proyecto ideológico claro. El control es el objetivo en sí mismo. Característico de regímenes que priorizan la supervivencia sobre la ideología.',
    student: 'El "autoritarismo pragmático" es inestable por definición: sin legitimidad ideológica, depende casi exclusivamente de la coerción y del IC1 (liderazgo personal). Cuando el liderazgo falla, estos regímenes colapsan o se transforman rápidamente.',
    expert: 'IUEe bajo en valor absoluto pese a IAE alto. Alta dependencia del IC1. II1 mínimo. Vulnerable a IC2 negativo sin recursos redistributivos ni identitarios para compensar.',
  },
  // Autoritarismo de derecha / teocracia
  {
    test: (iae, iue) => iae >= 58 && iue > 40,
    public: 'Estado muy poderoso orientado a imponer un orden cultural, nacional o religioso particular. La coerción se dirige a eliminar la diversidad en nombre de una identidad o fe. A esta escala de coerción, la supresión violenta de la disidencia es estructural, no excepcional.',
    student: 'La distinción entre fascismo, teocracia y nacionalismo extremo no es el nivel de coerción (todos tienen IAE muy alto), sino el contenido del proyecto particularista (nación, raza, religión). Los regímenes históricos en esta zona —Alemania Nazi, Irán teocrático, regímenes de apartheid— documentan terror sistemático como instrumento de homogeneización cultural. El modelo describe la estructura de poder; no captura la distinción moral entre tipos de coerción.',
    expert: 'IUEe positivo elevado. Protocolo de coerción extrema obligatorio si hay evidencia documentada de crímenes de lesa humanidad. Máxima presión homogeneizadora. IAEc dominante sobre IAEe en la mayoría de los casos históricos de esta zona.',
  },
];

function getContextForPosition(iae, iue) {
  for (const entry of CONTEXT_DB) {
    if (entry.test(iae, iue)) return entry;
  }
  return {
    public: 'Posición fuera de los rangos definidos. Ajusta los sliders para explorar el espacio del modelo.',
    student: '',
    expert: '',
  };
}

function updateContextReading() {
  const contextText = document.getElementById('contextText');
  const contextStudent = document.getElementById('contextStudent');
  const contextStudentText = document.getElementById('contextStudentText');
  const contextExpert = document.getElementById('contextExpert');
  const contextExpertText = document.getElementById('contextExpertText');
  if (!contextText) return;

  const ctx = getContextForPosition(state.iae, state.iue);

  contextText.style.opacity = '0';
  setTimeout(() => {
    contextText.textContent = ctx.public;
    contextText.style.opacity = '1';
  }, 150);

  if (contextStudentText) contextStudentText.textContent = ctx.student || '';
  if (contextExpertText) contextExpertText.textContent = ctx.expert || '';

  if (contextStudent) {
    contextStudent.hidden = !ctx.student || (!state.studentMode && !state.expertMode);
  }
  if (contextExpert) {
    contextExpert.hidden = !ctx.expert || !state.expertMode;
  }
}

/* ══════════════════════════════════════════════════
   5c. ACTUALIZADOR EJE IUE
══════════════════════════════════════════════════ */
function updateIUEAxis() {
  const marker = document.getElementById('iueAxisMarker');
  if (!marker) return;
  // IUE va de -100 a +100, mapeamos a 0%-100% del eje
  const pct = (state.iue + 100) / 200 * 100;
  marker.style.left = pct + '%';
}

/* ══════════════════════════════════════════════════
   6. PANEL DE POSICIÓN
══════════════════════════════════════════════════ */
function updatePositionPanel() {
  const iaeEl  = document.getElementById('posIAE');
  const iueEl  = document.getElementById('posIUE');
  const iueeEl = document.getElementById('posIUEe');
  const zoneEl = document.getElementById('posZone');
  if (!iaeEl) return;

  const iuee = calcIUEe(state.iae, state.iue);
  iaeEl.textContent  = state.iae;
  iueEl.textContent  = state.iue >= 0 ? '+' + state.iue : state.iue;
  iueeEl.textContent = iuee;
  zoneEl.textContent = calcZone(state.iae, state.iue);

  // Nota de zona democrática (alta heterogeneidad interna)
  let zonaNoteEl = document.getElementById('posZoneNote');
  if (!zonaNoteEl) {
    zonaNoteEl = document.createElement('p');
    zonaNoteEl.id = 'posZoneNote';
    zonaNoteEl.className = 'pos-zone-note';
    zoneEl.parentElement.insertAdjacentElement('afterend', zonaNoteEl);
  }
  if (state.iae >= 25 && state.iae <= 55) {
    zonaNoteEl.textContent = 'Zona de alta heterogeneidad: dos regímenes próximos aquí pueden diferir en mecanismo de sostenimiento, IUE_tipo y trayectoria futura. Complementar con el IVR.';
    zonaNoteEl.hidden = false;
  } else {
    zonaNoteEl.hidden = true;
  }

  // Expert panel: fórmulas, sensibilidad, confianza
  const expertPanel = document.getElementById('posExpertPanel');
  if (expertPanel) {
    expertPanel.hidden = !state.expertMode;
    if (state.expertMode) {
      // Fórmulas vivas
      const formIUEe = document.getElementById('posFormIUEe');
      if (formIUEe) formIUEe.textContent = `(${state.iue}/100) × ${state.iae} = ${iuee}`;

      // Asimetría IAEc/IAEe estimada
      const formAsym = document.getElementById('posFormAsym');
      if (formAsym) {
        const iueNorm = state.iue / 100;
        const asymmetry = iueNorm * 0.15;
        const iaecV = Math.max(0, Math.min(100, Math.round(state.iae * (1 + asymmetry + 0.05))));
        const iaeeV = Math.max(0, Math.min(100, Math.round(state.iae * (1 - asymmetry - 0.05))));
        formAsym.textContent = `IAEc≈${iaecV}, IAEe≈${iaeeV}`;
      }

      // Sensibilidad ±5 IAE
      const zoneMinus = document.getElementById('posSensZoneMinus');
      const zonePlus  = document.getElementById('posSensZonePlus');
      const zoneSens  = document.getElementById('posZoneSens');
      if (zoneMinus) zoneMinus.textContent = calcZone(Math.max(0, state.iae - 5), state.iue);
      if (zonePlus)  zonePlus.textContent  = calcZone(Math.min(100, state.iae + 5), state.iue);
      if (zoneSens)  zoneSens.textContent  = calcZone(state.iae, state.iue);

      // Confianza metodológica
      const confBar  = document.getElementById('posConfBar');
      const confText = document.getElementById('posConfText');
      let confPct, confLabel, confColor;
      if (state.iae < 10 || state.iae > 90 || Math.abs(state.iue) > 90) {
        confPct = 40; confLabel = 'Baja — zona extrema, pocos casos históricos'; confColor = 'var(--amber)';
      } else if (state.iae < 25 || state.iae > 75 || Math.abs(state.iue) > 70) {
        confPct = 65; confLabel = 'Media — zona con casos limitados'; confColor = 'var(--teal)';
      } else {
        confPct = 90; confLabel = 'Alta — zona con abundante evidencia comparada'; confColor = 'var(--teal)';
      }
      if (confBar)  { confBar.style.width = confPct + '%'; confBar.style.background = confColor; }
      if (confText) confText.textContent = confLabel;
    }
  }

  // ARIA: actualizar aria-valuetext de los sliders
  const iaeSlider = document.getElementById('iaeSlider');
  const iueSlider = document.getElementById('iueSlider');
  if (iaeSlider) {
    iaeSlider.setAttribute('aria-valuenow', state.iae);
    iaeSlider.setAttribute('aria-valuetext', `IAE ${state.iae} — ${calcIAELabel(state.iae)}`);
  }
  if (iueSlider) {
    iueSlider.setAttribute('aria-valuenow', state.iue);
    iueSlider.setAttribute('aria-valuetext', `IUE ${state.iue} — ${calcIUELabel(state.iue)}`);
  }
}

function calcIAELabel(iae) {
  if (iae < 12) return 'Estado mínimo o colapso';
  if (iae < 35) return 'alcance limitado';
  if (iae < 58) return 'alcance moderado';
  if (iae < 80) return 'alcance alto';
  return 'alcance máximo';
}

function calcIUELabel(iue) {
  if (iue < -60) return 'muy universalista-progresista';
  if (iue < -20) return 'universalista';
  if (iue < 20)  return 'centro pragmático';
  if (iue < 60)  return 'particularista';
  return 'muy particularista-conservador';
}

/* ══════════════════════════════════════════════════
   7. TOOLTIP DE VÉRTICES
══════════════════════════════════════════════════ */
function showVertexTooltip(key, el) {
  const v = VERTICES[key];
  if (!v) return;

  const tooltip = document.getElementById('triangleTooltip');
  const ttName = tooltip.querySelector('.tt-name');
  const ttDesc = tooltip.querySelector('.tt-desc');
  const ttIndices = tooltip.querySelector('.tt-indices');

  ttName.textContent = v.label;
  ttDesc.textContent = state.expertMode ? v.detail : v.desc;

  // Nota de coerción extrema para vértices con highCoercion
  let ttCoercion = tooltip.querySelector('.tt-coercion');
  if (v.highCoercion) {
    if (!ttCoercion) {
      ttCoercion = document.createElement('p');
      ttCoercion.className = 'tt-coercion';
      ttIndices.insertAdjacentElement('beforebegin', ttCoercion);
    }
    ttCoercion.innerHTML = `<strong>⚑ Nota:</strong> Los regímenes históricos próximos a este vértice involucran evidencia documentada de coerción extrema y crímenes de lesa humanidad.`;
  } else {
    if (ttCoercion) ttCoercion.remove();
  }

  ttIndices.innerHTML = `
    <span class="tt-index-pill">IAE=${v.iae}</span>
    <span class="tt-index-pill">IUE=${v.iue}</span>
  `;

  // Posicionar tooltip relativo al contenedor
  const container = document.querySelector('.triangle-container');
  const containerRect = container.getBoundingClientRect();
  const svgEl = document.getElementById('mainTriangle');
  const svgRect = svgEl.getBoundingClientRect();
  const { x: vx, y: vy } = indicesToXY(v.iae, v.iue);
  const scaleX = svgRect.width / 620;
  const scaleY = svgRect.height / 530;

  let left = (vx * scaleX) + svgRect.left - containerRect.left + 16;
  let top  = (vy * scaleY) + svgRect.top  - containerRect.top  - 16;

  // Evitar que salga del contenedor
  left = Math.min(left, containerRect.width - 260);
  top  = Math.max(top, 0);

  tooltip.style.left = left + 'px';
  tooltip.style.top  = top + 'px';
  tooltip.hidden = false;
}

/* ══════════════════════════════════════════════════
   8. IDEOLOGÍAS EN EL TRIÁNGULO
══════════════════════════════════════════════════ */

const IDEOLOGIAS = [
  {
    id: 'anarquismo',
    label: 'Anarquismo',
    color: '#4A90D9',
    desc: 'Rechazo de toda autoridad estatal coercitiva. Ocupa la zona superior del triángulo (IAE bajo), abarcando desde el anarcocomunismo (IUE negativo) hasta el anarcocapitalismo (IUE positivo). Ningún régimen histórico real ha llegado a este extremo.',
    zone: '350,40 285,112 350,112 415,112',
    iaeRange: '0–15', iueRange: '−100 a +100',
    filter: 'libertario',
  },
  {
    id: 'libertarianismo',
    label: 'Libertarianismo',
    color: '#2874A6',
    desc: 'Estado mínimo con orientación conservadora o neutral. Baja carga tributaria, libre mercado, libertades civiles amplias pero sin redistribución activa. Ejemplos: Hong Kong económico, propuestas del Partido Libertario de EE.UU.',
    zone: '388,78 415,112 405,180 367,180',
    iaeRange: '8–25', iueRange: '0 a +40',
    filter: 'libertario',
  },
  {
    id: 'liberalismo',
    label: 'Liberalismo clásico',
    color: '#1B5C9E',
    desc: 'Estado limitado como árbitro neutral. Protege derechos individuales sin imponer un proyecto cultural uniforme. Incluye democracias anglosajonas de bajo gasto estatal como Australia o Nueva Zelanda post-1984.',
    zone: '350,112 285,112 310,180 390,180',
    iaeRange: '15–30', iueRange: '−25 a +25',
    filter: 'democratico',
  },
  {
    id: 'socialdemocracia',
    label: 'Socialdemocracia',
    color: '#0F6E5A',
    desc: 'Estado de bienestar con orientación redistributiva. Interviene activamente para reducir desigualdades y garantizar derechos sociales universales. Ejemplos: países nórdicos, Alemania occidental post-guerra.',
    zone: '285,112 216,248 282,248 350,112',
    iaeRange: '30–50', iueRange: '−55 a −15',
    filter: 'democratico',
  },
  {
    id: 'liberalismo_social',
    label: 'Liberalismo social',
    color: '#3B6FA0',
    desc: 'Estado moderado con orientación progresista: protege libertades civiles y promueve derechos universales, con redistribución moderada. Ejemplos: Canadá, gran parte de Europa occidental.',
    zone: '310,180 350,112 390,180 350,248',
    iaeRange: '28–45', iueRange: '−20 a +20',
    filter: 'democratico',
  },
  {
    id: 'conservadurismo',
    label: 'Conservadurismo democrático',
    color: '#7B4F00',
    desc: 'Estado moderado con orientación hacia el orden cultural y social establecido. Tiene contrapesos democráticos reales. Ejemplos: democristianos europeos, conservadores británicos históricos.',
    zone: '350,112 390,180 418,248 484,248',
    iaeRange: '30–50', iueRange: '+15 a +55',
    filter: 'democratico',
  },
  {
    id: 'socialismo_autoritario',
    label: 'Socialismo autoritario',
    color: '#C0392B',
    desc: 'Estado poderoso con proyecto redistributivo y homogeneizador económico. Incluye desde el socialismo real soviético hasta variantes latinoamericanas como Venezuela o Cuba. IAE alto, IUE negativo.',
    zone: '216,248 134,400 254,400 282,248',
    iaeRange: '55–90', iueRange: '−90 a −40',
    filter: 'autoritario',
  },
  {
    id: 'autoritarismo_pragmatico',
    label: 'Autoritarismo pragmático',
    color: '#5C5C5C',
    desc: 'Estado poderoso sin proyecto ideológico claro. El control como fin en sí mismo. Incluye regímenes militares latinoamericanos de los 70, Bielorrusia, Kazajistán.',
    zone: '282,248 418,248 446,400 254,400',
    iaeRange: '55–85', iueRange: '−35 a +35',
    filter: 'autoritario',
  },
  {
    id: 'nacionalismo_autoritario',
    label: 'Nacionalismo autoritario',
    color: '#8B3A1A',
    desc: 'Estado poderoso con proyecto identitario-nacionalista. Incluye el fascismo histórico, teocracias, y variantes contemporáneas como Irán o la Rusia de Putin. IAE alto, IUE positivo.',
    zone: '418,248 484,248 566,400 446,400',
    iaeRange: '50–90', iueRange: '+35 a +90',
    filter: 'autoritario',
  },
];

function initIdeologias() {
  const list = document.getElementById('ideologiasList');
  const zonesGroup = document.getElementById('ideologiasZones');
  if (!list || !zonesGroup) return;

  // Triángulo de ideologías usa viewBox 700x600
  // Vértices: A(350,40) C(80,520) F(620,520)
  function toXY_id(iae, iue) {
    const iaeN = iae / 100;
    const iueN = (iue + 100) / 200;
    const wA = 1 - iaeN, wC = iaeN * (1 - iueN), wF = iaeN * iueN;
    return {
      x: wA * 350 + wC * 80 + wF * 620,
      y: wA * 40  + wC * 520 + wF * 520,
    };
  }

  let activeId = null;

  IDEOLOGIAS.forEach(ideo => {
    // Card
    const item = document.createElement('div');
    item.className = 'caso-item reveal';
    item.dataset.id = ideo.id;
    item.innerHTML = `
      <span class="caso-dot" style="background:${ideo.color}"></span>
      <div class="caso-info">
        <div class="caso-name">${ideo.label}</div>
        <div class="caso-desc">${ideo.desc}</div>
      </div>
      <div class="caso-indices">
        <span class="caso-pill">IAE ${ideo.iaeRange}</span>
        <span class="caso-pill">IUE ${ideo.iueRange}</span>
      </div>`;
    item.addEventListener('click', () => {
      activeId = activeId === ideo.id ? null : ideo.id;
      document.querySelectorAll('#ideologiasList .caso-item').forEach(el =>
        el.classList.toggle('active', el.dataset.id === activeId));
      document.querySelectorAll('#ideologiasZones .ideo-zone').forEach(el =>
        el.setAttribute('opacity', el.dataset.id === activeId ? '1' : '0.5'));
    });
    list.appendChild(item);

    // Zona en SVG
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'ideo-zone');
    g.setAttribute('data-id', ideo.id);
    g.style.cursor = 'pointer';

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', ideo.zone);
    poly.setAttribute('fill', ideo.color);
    poly.setAttribute('fill-opacity', '0.18');
    poly.setAttribute('stroke', ideo.color);
    poly.setAttribute('stroke-width', '1.5');
    poly.setAttribute('stroke-opacity', '0.5');

    // Label centrado en el polígono
    const pts = ideo.zone.split(' ').map(p => p.split(',').map(Number));
    const cx = Math.round(pts.reduce((s, p) => s + p[0], 0) / pts.length);
    const cy = Math.round(pts.reduce((s, p) => s + p[1], 0) / pts.length);
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', cx); lbl.setAttribute('y', cy);
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('dominant-baseline', 'central');
    lbl.setAttribute('font-family', 'DM Sans, sans-serif');
    lbl.setAttribute('font-size', '10');
    lbl.setAttribute('fill', ideo.color);
    lbl.setAttribute('font-weight', '500');
    lbl.textContent = ideo.label;

    g.appendChild(poly);
    g.appendChild(lbl);
    g.addEventListener('click', () => {
      activeId = activeId === ideo.id ? null : ideo.id;
      document.querySelectorAll('#ideologiasList .caso-item').forEach(el =>
        el.classList.toggle('active', el.dataset.id === activeId));
      document.querySelectorAll('#ideologiasZones .ideo-zone').forEach(el =>
        el.setAttribute('opacity', activeId === null || el.dataset.id === activeId ? '1' : '0.4'));
    });
    zonesGroup.appendChild(g);
  });
}

/* ══════════════════════════════════════════════════
   8b. CASOS ILUSTRATIVOS
══════════════════════════════════════════════════ */
function initCasos() {
  const list = document.getElementById('casosList');
  const pointsGroup = document.getElementById('casosPoints');
  const casosSvg = document.getElementById('casosTriangle');
  if (!list || !pointsGroup) return;

  // El triángulo de casos usa viewBox 700x600
  const TRI2 = {
    A: { x: 350, y: 40  },   // Anarquía  (arriba, centro)
    C: { x: 80,  y: 520 },   // Comunismo (abajo-izq)
    F: { x: 620, y: 520 },   // Fascismo  (abajo-der)
  };

  function toXY2(iae, iue) {
    const iaeN = Math.max(0, Math.min(100, iae)) / 100;
    const iueN = (Math.max(-100, Math.min(100, iue)) + 100) / 200;
    const wA = 1 - iaeN;
    const wC = iaeN * (1 - iueN);
    const wF = iaeN * iueN;
    return {
      x: wA * TRI2.A.x + wC * TRI2.C.x + wF * TRI2.F.x,
      y: wA * TRI2.A.y + wC * TRI2.C.y + wF * TRI2.F.y,
    };
  }

  // Renderizar lista
  CASOS.forEach(caso => {
    const item = document.createElement('div');
    item.className = 'caso-item reveal';
    item.dataset.id = caso.id;
    item.dataset.filter = caso.filter || 'all';
    item.innerHTML = `
      <span class="caso-dot" style="background:${caso.color}"></span>
      <div class="caso-info">
        <div class="caso-name">
          ${caso.label}
          <span class="caso-period">${caso.periodo}</span>
          ${caso.highCoercion ? '<span class="caso-coercion-badge">⚑ alta coerción</span>' : ''}
        </div>
        <div class="caso-desc">${caso.desc}</div>
      </div>
      <div class="caso-indices">
        <span class="caso-pill">IAE=${caso.iae}</span>
        <span class="caso-pill">IUE=${caso.iue >= 0 ? '+' : ''}${caso.iue}</span>
      </div>
    `;
    item.addEventListener('click', () => {
      if (state.activeCaso === caso.id) {
        // Segundo clic: añadir a comparación
        addToCompare(caso.id);
      } else {
        activateCaso(caso.id);
      }
    });
    list.appendChild(item);
  });

  // Renderizar puntos en SVG
  CASOS.forEach(caso => {
    const { x, y } = toXY2(caso.iae, caso.iue);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'caso-point');
    g.setAttribute('data-id', caso.id);
    g.setAttribute('data-filter', caso.filter || 'all');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', caso.label);

    g.innerHTML = `
      <circle cx="${x}" cy="${y}" r="7"
        fill="${caso.color}" fill-opacity="0.85"
        stroke="white" stroke-width="1.5"/>
      <text x="${x + 10}" y="${y + 4}"
        class="caso-point-label"
        font-family="DM Sans, sans-serif"
        font-size="10"
        fill="var(--ink-2)">${caso.label}</text>
    `;
    g.addEventListener('click', () => activateCaso(caso.id));
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateCaso(caso.id);
      }
    });
    pointsGroup.appendChild(g);

    // Renderizar trayectoria si existe (oculta por defecto)
    if (caso.trayectoria) {
      const { x: x0, y: y0 } = toXY2(caso.trayectoria.iae, caso.trayectoria.iue);
      const tg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tg.setAttribute('class', 'trayectoria-group');
      tg.setAttribute('data-caso', caso.id);
      tg.setAttribute('opacity', '0');
      tg.style.transition = 'opacity 0.3s';

      // Línea de trayectoria con flecha
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x0); line.setAttribute('y1', y0);
      line.setAttribute('x2', x); line.setAttribute('y2', y);
      line.setAttribute('stroke', caso.color);
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '5 3');
      line.setAttribute('marker-end', 'url(#arrowTray)');
      line.setAttribute('opacity', '0.7');

      // Punto origen
      const dot0 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot0.setAttribute('cx', x0); dot0.setAttribute('cy', y0); dot0.setAttribute('r', '5');
      dot0.setAttribute('fill', caso.color); dot0.setAttribute('fill-opacity', '0.4');
      dot0.setAttribute('stroke', caso.color); dot0.setAttribute('stroke-width', '1');

      // Etiqueta origen
      const lbl0 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl0.setAttribute('x', x0 + 8); lbl0.setAttribute('y', y0 + 4);
      lbl0.setAttribute('font-family', 'DM Sans, sans-serif');
      lbl0.setAttribute('font-size', '9');
      lbl0.setAttribute('fill', caso.color);
      lbl0.textContent = caso.trayectoria.label;

      tg.appendChild(line);
      tg.appendChild(dot0);
      tg.appendChild(lbl0);
      pointsGroup.insertBefore(tg, pointsGroup.firstChild); // detrás de los puntos actuales
    }
  });

  // Añadir marcador de flecha para trayectorias
  if (casosSvg) {
    const defs = casosSvg.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML += `<marker id="arrowTray" viewBox="0 0 10 10" refX="8" refY="5"
      markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"/>
    </marker>`;
    if (!casosSvg.querySelector('defs')) casosSvg.insertBefore(defs, casosSvg.firstChild);
  }

  // Filtros
  document.querySelectorAll('.caso-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.caso-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.caso-item').forEach(item => {
        const show = filter === 'all' || item.dataset.filter === filter;
        item.classList.toggle('hidden', !show);
      });
      document.querySelectorAll('.caso-point').forEach(pt => {
        const show = filter === 'all' || pt.dataset.filter === filter;
        pt.setAttribute('opacity', show ? '1' : '0.15');
      });
      refreshEpistemicNote();
    });
  });

  // Toggle trayectorias
  const trayToggle = document.getElementById('trayectoriaToggle');
  if (trayToggle) {
    trayToggle.addEventListener('change', () => {
      state.showTrayectorias = trayToggle.checked;
      document.querySelectorAll('.trayectoria-group').forEach(g => {
        g.setAttribute('opacity', state.showTrayectorias ? '1' : '0');
      });
    });
  }

  function activateCaso(id) {
    state.activeCaso = id;
    document.querySelectorAll('.caso-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });
    document.querySelectorAll('.caso-point').forEach(el => {
      el.classList.toggle('active', el.dataset.id === id);
    });

    // Mostrar valores reales del caso en el panel de posición (si existe)
    const caso = CASOS.find(c => c.id === id);
    if (caso) {
      const posIAE  = document.getElementById('posIAE');
      const posIUE  = document.getElementById('posIUE');
      const posIUEe = document.getElementById('posIUEe');
      const posZone = document.getElementById('posZone');
      if (posIAE)  posIAE.textContent  = caso.iae;
      if (posIUE)  posIUE.textContent  = caso.iue >= 0 ? '+' + caso.iue : caso.iue;
      if (posIUEe) posIUEe.textContent = calcIUEe(caso.iae, caso.iue);
      if (posZone) posZone.textContent = caso.zona;
    }

    // Nota epistémica
    document.querySelectorAll('.epistemic-note').forEach(n => n.remove());

    if (caso && caso.highCoercion) {
      const activeItem = document.querySelector(`.caso-item[data-id="${id}"]`);
      if (activeItem && !activeItem.classList.contains('hidden')) {
        const note = document.createElement('div');
        note.className = 'epistemic-note visible';
        note.dataset.casoId = id;
        note.innerHTML = `<strong>⚑ Nota metodológica:</strong> Este caso involucra evidencia documentada de coerción extrema. El modelo describe la <em>estructura del poder</em>, no evalúa normativamente. La descripción cuantitativa no sustituye el análisis histórico y jurídico de los hechos.`;
        activeItem.insertAdjacentElement('afterend', note);
      }
    }
  }

  function refreshEpistemicNote() {
    if (!state.activeCaso) return;
    const caso = CASOS.find(c => c.id === state.activeCaso);
    if (!caso || !caso.highCoercion) return;
    if (document.querySelector('.epistemic-note')) return;
    const activeItem = document.querySelector(`.caso-item[data-id="${state.activeCaso}"]`);
    if (activeItem && !activeItem.classList.contains('hidden')) {
      const note = document.createElement('div');
      note.className = 'epistemic-note visible';
      note.innerHTML = `<strong>⚑ Nota metodológica:</strong> Este caso involucra evidencia documentada de coerción extrema. El modelo describe la <em>estructura del poder</em>, no evalúa normativamente. La descripción cuantitativa no sustituye el análisis histórico y jurídico de los hechos.`;
      activeItem.insertAdjacentElement('afterend', note);
    }
  }
}

/* ══════════════════════════════════════════════════
   9. TARJETAS DE ÍNDICES — toggle individual
══════════════════════════════════════════════════ */
function initIndexCards() {
  document.querySelectorAll('.index-card').forEach(card => {
    const toggle = card.querySelector('.card-toggle');
    const technical = card.querySelector('.card-technical');
    const student = card.querySelector('.card-student');
    if (!toggle) return;

    // Estado propio de la tarjeta
    card._expanded = false;

    toggle.addEventListener('click', () => {
      if (state.expertMode) return; // en experto todo está siempre visible

      card._expanded = !card._expanded;

      if (state.studentMode) {
        // Modo estudiante: el bloque estudiante ya está visible por CSS.
        // El toggle muestra/oculta la fórmula técnica.
        if (technical) technical.hidden = !card._expanded;
        toggle.textContent = card._expanded ? 'Ocultar fórmula ↑' : 'Ver fórmula ↓';
      } else {
        // Modo público: primero aparece el bloque estudiante, luego el técnico.
        if (student)   student.hidden   = !card._expanded;
        if (technical) technical.hidden = true; // el técnico nunca en modo público
        toggle.textContent = card._expanded ? 'Ocultar ↑' : 'Ver más ↓';
      }
    });
  });
}

function updateIndexCards() {
  document.querySelectorAll('.index-card').forEach(card => {
    const btn = card.querySelector('.card-toggle');
    const technical = card.querySelector('.card-technical');
    const student   = card.querySelector('.card-student');

    // Resetear estado de expansión al cambiar modo
    card._expanded = false;

    if (state.expertMode) {
      if (btn) btn.textContent = '';
      // Expert: todo visible, gestionado por CSS
    } else if (state.studentMode) {
      if (btn) btn.textContent = 'Ver fórmula ↓';
      if (technical) technical.hidden = true;
      // student ya visible por CSS
    } else {
      if (btn) btn.textContent = 'Ver más ↓';
      if (student)   student.hidden   = true;
      if (technical) technical.hidden = true;
    }
  });
}

/* ══════════════════════════════════════════════════
   10. SCROLL REVEAL
══════════════════════════════════════════════════ */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════
   11. HERO MINI-TRIÁNGULO
══════════════════════════════════════════════════ */
function initHeroTriangle() {
  const container = document.getElementById('heroVisual');
  if (!container) return;

  container.innerHTML = `
  <svg viewBox="0 0 520 465" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="hGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4A90D9" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="#4A90D9" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="hGradRight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8B1A1A" stop-opacity="0"/>
        <stop offset="100%" stop-color="#8B1A1A" stop-opacity="0.22"/>
      </linearGradient>
      <linearGradient id="iueBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#A8A7A2"/>
        <stop offset="50%" stop-color="#E8E5DF"/>
        <stop offset="100%" stop-color="#C0392B"/>
      </linearGradient>
      <linearGradient id="iaeBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A90D9"/>
        <stop offset="100%" stop-color="#5E3FA0"/>
      </linearGradient>
    </defs>

    <!-- Triángulo base -->
    <polygon points="270,34 80,388 460,388" fill="#F0EDE6" stroke="#C8C5BC" stroke-width="1.5"/>
    <!-- Gradientes izquierda/derecha -->
    <polygon points="270,34 80,388 460,388" fill="url(#hGradLeft)"/>
    <polygon points="270,34 80,388 460,388" fill="url(#hGradRight)"/>

    <!-- Zona democrática — diamante con vértices lat. en perímetro -->
    <polygon points="270,120 175,210 270,300 365,210"
      fill="rgba(74,144,217,0.07)" stroke="rgba(74,144,217,0.40)"
      stroke-width="1" stroke-dasharray="5 3"/>

    <!-- Labels internos -->
    <text x="270" y="114" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.07em">LIBERALISMO</text>
    <text x="270" y="326" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.07em">INTERVENCIONISMO</text>
    <text x="270" y="214" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(74,144,217,0.75)">Zona de Estados Democráticos</text>

    <!-- Izquierda / Derecha labels -->
    <text x="165" y="214" text-anchor="end" font-family="DM Sans,sans-serif" font-size="9" fill="#6B6A65">Izquierda</text>
    <text x="375" y="214" text-anchor="start" font-family="DM Sans,sans-serif" font-size="9" fill="#6B6A65">Derecha</text>

    <!-- Puntos de muestra -->
    <circle cx="255" cy="137" r="5" fill="#1B5C9E" fill-opacity="0.9"/>
    <text x="263" y="141" font-family="DM Sans,sans-serif" font-size="8.5" fill="#3D3C38">Noruega</text>
    <circle cx="272" cy="160" r="5" fill="#2874A6" fill-opacity="0.9"/>
    <text x="280" y="164" font-family="DM Sans,sans-serif" font-size="8.5" fill="#3D3C38">EE.UU.</text>
    <circle cx="253" cy="234" r="5" fill="#C0392B" fill-opacity="0.9"/>
    <text x="261" y="238" font-family="DM Sans,sans-serif" font-size="8.5" fill="#3D3C38">China</text>
    <circle cx="196" cy="268" r="5" fill="#E07B20" fill-opacity="0.9"/>
    <text x="204" y="272" font-family="DM Sans,sans-serif" font-size="8.5" fill="#3D3C38">Venezuela</text>

    <!-- Vértices -->
    <circle cx="270" cy="34"  r="6" fill="#4A90D9"/>
    <circle cx="80"  cy="388" r="6" fill="#888"/>
    <circle cx="460" cy="388" r="6" fill="#8B1A1A"/>

    <!-- Caja Anarquía -->
    <rect x="228" y="7" width="88" height="20" rx="5" fill="#4A90D9"/>
    <text x="270" y="20" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="white" font-weight="600">Anarquía</text>

    <!-- Caja Comunismo -->
    <rect x="34" y="396" width="88" height="20" rx="5" fill="#888"/>
    <text x="78" y="408" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8.5" fill="white" font-weight="600">Comunismo</text>

    <!-- Caja Fascismo -->
    <rect x="414" y="396" width="88" height="20" rx="5" fill="#8B1A1A"/>
    <text x="458" y="408" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8.5" fill="white" font-weight="600">Fascismo</text>

  </svg>`;
}

/* ══════════════════════════════════════════════════
   11b. EXPLAINER ANIMADO 1D → 2D
══════════════════════════════════════════════════ */
function initHeroExplainer() {
  const animContainer = document.getElementById('heroExpAnim');
  if (!animContainer) return;

  const steps = [
    // Step 0: eje horizontal 1D con label IUE
    () => `<svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="100" x2="340" y2="100" stroke="#C8C5BC" stroke-width="1.5"/>
      <circle cx="40" cy="100" r="6" fill="#1B5C9E"/>
      <circle cx="340" cy="100" r="6" fill="#8B1A1A"/>
      <text x="40" y="122" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#6B6A65">IUE = −100</text>
      <text x="340" y="122" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="11" fill="#6B6A65">IUE = +100</text>
      <text x="190" y="82" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2">IUE = 0</text>
      <line x1="190" y1="88" x2="190" y2="94" stroke="#C8C5BC" stroke-width="1"/>
      <circle cx="240" cy="100" r="8" fill="#E07B20" stroke="white" stroke-width="2"/>
      <line x1="240" y1="90" x2="258" y2="72" stroke="#A8A7A2" stroke-width="0.8"/>
      <text x="266" y="62" text-anchor="start" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">régimen X</text>
      <text x="266" y="74" text-anchor="start" font-family="DM Sans,sans-serif" font-size="9" fill="#A8A7A2">¿pero cuánto poder tiene?</text>
      <text x="190" y="160" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">EJE IUE — dirección del Estado</text>
    </svg>`,

    // Step 1: añadir eje vertical IAE con escala
    () => `<svg viewBox="0 0 380 240" xmlns="http://www.w3.org/2000/svg">
      <line x1="40" y1="190" x2="340" y2="190" stroke="#C8C5BC" stroke-width="1.5"/>
      <line x1="190" y1="20" x2="190" y2="190" stroke="#1B5C9E" stroke-width="1.5" stroke-dasharray="4 3"/>
      <circle cx="40" cy="190" r="5" fill="#1B5C9E"/>
      <circle cx="340" cy="190" r="5" fill="#8B1A1A"/>
      <text x="40" y="208" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">IUE=−100</text>
      <text x="340" y="208" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">IUE=+100</text>
      <text x="174" y="26" text-anchor="end" font-family="DM Sans,sans-serif" font-size="10" fill="#1B5C9E">IAE=0</text>
      <text x="174" y="194" text-anchor="end" font-family="DM Sans,sans-serif" font-size="10" fill="#1B5C9E">IAE=100</text>
      <line x1="183" y1="107" x2="190" y2="107" stroke="#1B5C9E" stroke-width="0.8"/>
      <text x="172" y="111" text-anchor="end" font-family="DM Sans,sans-serif" font-size="9" fill="#1B5C9E">IAE=50</text>
      <circle cx="240" cy="110" r="8" fill="#E07B20" stroke="white" stroke-width="2"/>
      <text x="252" y="107" font-family="DM Sans,sans-serif" font-size="10" fill="#6B6A65">régimen X</text>
      <text x="190" y="228" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">IAE (alcance) + IUE (dirección)</text>
    </svg>`,

    // Step 2: triángulo completo con ejemplos reales
    () => `<svg viewBox="0 0 380 280" xmlns="http://www.w3.org/2000/svg">
      <polygon points="190,20 40,250 340,250" fill="#F0EDE6" stroke="#C8C5BC" stroke-width="1.5"/>
      <polygon points="190,20 40,250 115,250 145,145" fill="#4A90D9" fill-opacity="0.07"/>
      <polygon points="190,20 340,250 265,250 235,145" fill="#8B1A1A" fill-opacity="0.07"/>
      <circle cx="190" cy="20" r="5" fill="#4A90D9"/>
      <circle cx="40" cy="250" r="5" fill="#C0392B"/>
      <circle cx="340" cy="250" r="5" fill="#8B1A1A"/>
      <text x="190" y="13" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#4A90D9">Anarquía IAE=0</text>
      <text x="22" y="264" font-family="DM Sans,sans-serif" font-size="9" fill="#C0392B">Comunismo</text>
      <text x="358" y="264" text-anchor="end" font-family="DM Sans,sans-serif" font-size="9" fill="#8B1A1A">Fascismo</text>
      <circle cx="178" cy="108" r="5" fill="#1B5C9E" fill-opacity="0.9"/>
      <text x="187" y="111" font-family="DM Sans,sans-serif" font-size="9" fill="#3D3C38">Noruega IAE=40</text>
      <circle cx="196" cy="132" r="5" fill="#2874A6" fill-opacity="0.9"/>
      <text x="205" y="135" font-family="DM Sans,sans-serif" font-size="9" fill="#3D3C38">EE.UU. IAE=34</text>
      <circle cx="185" cy="172" r="5" fill="#C0392B" fill-opacity="0.9"/>
      <text x="194" y="175" font-family="DM Sans,sans-serif" font-size="9" fill="#3D3C38">China IAE=51</text>
      <text x="190" y="272" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" fill="#A8A7A2" letter-spacing="0.06em">EL TRIÁNGULO POLÍTICO</text>
    </svg>`,
  ];

  let currentStep = 0;

  function renderStep(idx) {
    // Fade out → swap → fade in
    animContainer.style.transition = 'opacity 0.2s ease';
    animContainer.style.opacity = '0';
    setTimeout(() => {
      animContainer.innerHTML = steps[idx]();
      animContainer.style.opacity = '1';
    }, 200);

    // Actualizar textos con animación
    document.querySelectorAll('.hero-exp-step').forEach(p => {
      p.classList.toggle('active', parseInt(p.dataset.step) === idx);
    });
    // Actualizar dots
    document.querySelectorAll('.exp-dot').forEach(dot => {
      dot.classList.toggle('active', parseInt(dot.dataset.step) === idx);
    });
    // Botones
    const prev = document.getElementById('expPrev');
    const next = document.getElementById('expNext');
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === steps.length - 1;
    if (next) next.textContent = idx === steps.length - 2 ? 'Ver el modelo →' : 'Siguiente →';
  }

  const prevBtn = document.getElementById('expPrev');
  const nextBtn = document.getElementById('expNext');

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentStep > 0) { currentStep--; renderStep(currentStep); }
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) { currentStep++; renderStep(currentStep); }
    else { document.getElementById('triangulo')?.scrollIntoView({ behavior: 'smooth' }); }
  });

  document.querySelectorAll('.exp-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      currentStep = parseInt(dot.dataset.step);
      renderStep(currentStep);
    });
  });

  renderStep(0);
}

/* ══════════════════════════════════════════════════
   12. QUIZ NATIVO INTEGRADO
══════════════════════════════════════════════════ */

const QUIZ_QUESTIONS = [
  // subaxis: 'IAEc' = alcance civil (libertades, prensa, seguridad)
  //          'IAEe' = alcance económico (gasto, empresas, mercado)
  { text: "El Estado debería garantizar educación gratuita y de calidad para toda la población.", axis: "IAE", subaxis: "IAEe", dir: 1 },
  { text: "Las empresas estratégicas (energía, agua, transporte) deberían estar en manos del Estado.", axis: "IAE", subaxis: "IAEe", dir: 1 },
  { text: "El Estado tiene derecho a limitar la libre circulación de personas en situaciones de emergencia.", axis: "IAE", subaxis: "IAEc", dir: 1 },
  { text: "El Estado debería regular el acceso a las redes sociales y los medios de comunicación.", axis: "IAE", subaxis: "IAEc", dir: 1 },
  { text: "El Estado debería redistribuir activamente la riqueza a través de impuestos progresivos.", axis: "IUE", dir: -1 },
  { text: "Las leyes deberían reflejar los valores y tradiciones culturales de la mayoría.", axis: "IUE", dir: 1 },
  { text: "El Estado debería financiar y promover activamente la igualdad de género y derechos LGBTQ+.", axis: "IUE", dir: -1 },
  { text: "La inmigración debería limitarse para preservar la identidad cultural nacional.", axis: "IUE", dir: 1 },
  { text: "El Estado debería proveer un seguro de desempleo universal y generoso.", axis: "IAE", subaxis: "IAEe", dir: 1 },
  { text: "Las instituciones religiosas deberían tener influencia en las decisiones del Estado.", axis: "IUE", dir: 1 },
  { text: "La propiedad privada es un derecho fundamental que el Estado no debe restringir.", axis: "IAE", subaxis: "IAEe", dir: -1 },
  { text: "El Estado debería garantizar un salario mínimo que permita vivir dignamente.", axis: "IUE", dir: -1 },
  { text: "Las fuerzas de seguridad necesitan más recursos y autonomía para combatir el crimen.", axis: "IAE", subaxis: "IAEc", dir: 1 },
  { text: "El Estado debería subsidiar las artes, la cultura y los medios públicos.", axis: "IUE", dir: -1 },
  { text: "El aborto debería estar prohibido o fuertemente restringido por ley.", axis: "IUE", dir: 1 },
  { text: "La libre competencia del mercado es el mejor mecanismo para asignar recursos.", axis: "IAE", subaxis: "IAEe", dir: -1 },
  { text: "El Estado debería tener un sistema de salud pública universal.", axis: "IAE", subaxis: "IAEe", dir: 1 },
  { text: "La tradición y los valores familiares deben ser protegidos activamente por el Estado.", axis: "IUE", dir: 1 },
  { text: "El Estado debería reducir las desigualdades regionales mediante transferencias y subsidios.", axis: "IUE", dir: -1 },
  { text: "Los ciudadanos deberían poder armarse para su propia defensa sin necesidad de permiso estatal.", axis: "IAE", subaxis: "IAEc", dir: -1 },
];

const QUIZ_LABELS = [
  "Totalmente en desacuerdo",
  "En desacuerdo",
  "Neutro / No sé",
  "De acuerdo",
  "Totalmente de acuerdo"
];

const QUIZ_REGIMES = [
  [55,-40,"Noruega","#1B5C9E"],[40,20,"EE.UU. 2000s","#2874A6"],
  [80,-15,"China actual","#C0392B"],[72,-65,"Venezuela 2010s","#E07B20"],
  [75,80,"Irán actual","#8B1A1A"],[8,0,"Somalia 1990s","#888"],
  [62,-55,"Suecia 1980s","#0F6E5A"],[88,85,"Alemania Nazi","#4A1A1A"],
  [48,-25,"Francia actual","#1A5276"],[42,-10,"Alemania 2024","#1A5276"],
];

const quizState = {
  step: 0,
  answers: Array(QUIZ_QUESTIONS.length).fill(null),
  phase: 'quiz',
};

const QUIZ_TRI = {
  A: { x: 130, y: 14 },
  C: { x: 12,  y: 244 },
  F: { x: 248, y: 244 },
};

function quizToXY(iae, iue) {
  const iaeN = Math.max(0, Math.min(100, iae)) / 100;
  const iueN = (Math.max(-100, Math.min(100, iue)) + 100) / 200;
  const wA = 1 - iaeN, wC = iaeN * (1 - iueN), wF = iaeN * iueN;
  return {
    x: wA * QUIZ_TRI.A.x + wC * QUIZ_TRI.C.x + wF * QUIZ_TRI.F.x,
    y: wA * QUIZ_TRI.A.y + wC * QUIZ_TRI.C.y + wF * QUIZ_TRI.F.y,
  };
}

function quizCalcScores() {
  let iaeSum = 0, iaeN = 0, iueSum = 0, iueN = 0;
  // Sub-tracking para desglose en resultado
  let iaecSum = 0, iaecN = 0, iaeeSum = 0, iaeeN = 0;

  QUIZ_QUESTIONS.forEach((q, i) => {
    if (quizState.answers[i] === null) return;
    const norm = quizState.answers[i] - 3;
    const score = norm * q.dir * 25;
    if (q.axis === "IAE") {
      iaeSum += score; iaeN++;
      // Las preguntas de IAE civil (libertades, seguridad) vs económico (empresas, impuestos)
      if (q.subaxis === 'IAEc') { iaecSum += score; iaecN++; }
      else                      { iaeeSum += score; iaeeN++; }
    } else {
      iueSum += score; iueN++;
    }
  });

  const iae  = Math.max(0,    Math.min(100, Math.round(50 + (iaeN ? iaeSum / iaeN : 0))));
  const iue  = Math.max(-100, Math.min(100, Math.round(iueN ? iueSum / iueN * 2 : 0)));
  const iuee = Math.round((iue / 100) * iae);

  // Valores desagregados para el desglose del resultado
  const iaec = iaecN ? Math.max(0, Math.min(100, Math.round(50 + iaecSum / iaecN))) : iae;
  const iaee = iaeeN ? Math.max(0, Math.min(100, Math.round(50 + iaeeSum / iaeeN))) : iae;

  return { iae, iue, iuee, iaec, iaee };
}

function quizGetZone(iae, iue) {
  const iuee = (iue/100)*iae;
  if (iae < 20) return { name:"Zona semi-libertaria", desc:"Alcance estatal muy reducido. Predomina la autonomía individual." };
  if (iae > 80 && iue < -50) return { name:"Polo comunista", desc:"Estado de alcance máximo orientado a homogeneizar la vida económica." };
  if (iae > 80 && iue > 50)  return { name:"Polo fascista / teocrático", desc:"Estado de alcance máximo orientado a imponer una identidad dominante." };
  if (iae > 60 && Math.abs(iue) < 30) return { name:"Autocracia pragmática", desc:"Alto alcance estatal sin proyecto ideológico fuerte." };
  if (iae > 55 && iue > 20)  return { name:"Autoritarismo electoral", desc:"Instituciones formales con erosión de libertades civiles." };
  if (iae > 55 && iue < -20) return { name:"Intervencionismo de izquierda", desc:"Estado de alcance alto con orientación redistributiva." };
  if (iae > 25 && iae < 55 && Math.abs(iuee) < 20) return { name:"Zona democrática", desc:"Coexistencia de proyectos políticos distintos con poder distribuido." };
  if (iae > 25 && iae < 55 && iue > 15) return { name:"Derecha democrática", desc:"Estado moderado con orientación conservadora-particularista." };
  if (iae > 25 && iae < 55 && iue < -15) return { name:"Izquierda democrática", desc:"Estado moderado con orientación universalista-igualitarista." };
  if (iae <= 35 && iue > 15) return { name:"Liberalismo conservador", desc:"Estado pequeño con orientación cultural particularista." };
  if (iae <= 35 && iue < -15) return { name:"Liberalismo progresista", desc:"Estado pequeño con orientación universalista." };
  return { name:"Zona central", desc:"Posición central: alcance moderado y orientación pragmática." };
}

function quizNearest(iae, iue, n = 3) {
  return QUIZ_REGIMES
    .map(([ri, ru, name, color]) => ({ name, color, d: Math.round(Math.sqrt((iae-ri)**2 + ((iue-ru)*0.7)**2)) }))
    .sort((a, b) => a.d - b.d).slice(0, n);
}

function quizUpdateLiveTriangle() {
  const answeredCount = quizState.answers.filter(a => a !== null).length;
  if (answeredCount === 0) return;

  const { iae, iue } = quizCalcScores();
  const { x, y } = quizToXY(iae, iue);

  const dot   = document.getElementById('quizDot');
  const pulse = document.getElementById('quizDotPulse');
  if (dot)   { dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); dot.setAttribute('opacity', '1'); }
  if (pulse) { pulse.setAttribute('cx', x.toFixed(1)); pulse.setAttribute('cy', y.toFixed(1)); pulse.setAttribute('opacity', '0.5'); }

  const liveIAE = document.getElementById('quizLiveIAE');
  const liveIUE = document.getElementById('quizLiveIUE');
  if (liveIAE) liveIAE.textContent = iae;
  if (liveIUE) liveIUE.textContent = (iue >= 0 ? '+' : '') + iue;

  const pct = Math.round((answeredCount / QUIZ_QUESTIONS.length) * 100);
  const bar = document.getElementById('quizProgressBar');
  const lbl = document.getElementById('quizProgressLabel');
  if (bar) bar.style.width = pct + '%';
  if (lbl) lbl.textContent = `${answeredCount} / ${QUIZ_QUESTIONS.length}`;
}

function quizRenderQuiz() {
  const q = QUIZ_QUESTIONS[quizState.step];
  const ans = quizState.answers[quizState.step];
  const hasAns = ans !== null;
  const pct = Math.round((quizState.step / QUIZ_QUESTIONS.length) * 100);

  return `
    <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
    <div class="quiz-q-meta">
      <span class="quiz-counter">Pregunta ${quizState.step + 1} de ${QUIZ_QUESTIONS.length}</span>
      <span class="quiz-badge quiz-badge-${q.axis.toLowerCase()}">${q.axis}</span>
    </div>
    <p class="quiz-q-text">${q.text}</p>
    <div class="quiz-options">
      ${QUIZ_LABELS.map((l, i) => {
        const v = i + 1;
        return `<div class="quiz-option${ans === v ? ' selected' : ''}" role="radio" aria-checked="${ans === v}" tabindex="0" onclick="quizPick(${v})" onkeydown="if(event.key==='Enter'||event.key===' ')quizPick(${v})">
          <div class="quiz-radio"><div class="quiz-radio-dot"></div></div>
          <span class="quiz-option-label">${l}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="quiz-nav">
      ${quizState.step > 0 ? `<button class="quiz-btn" onclick="quizPrev()">← Anterior</button>` : ''}
      <button class="quiz-btn${hasAns ? ' primary' : ''}" onclick="quizNext()" ${hasAns ? '' : 'disabled'}>
        ${quizState.step === QUIZ_QUESTIONS.length - 1 ? 'Ver resultado →' : 'Siguiente →'}
      </button>
    </div>`;
}

function quizRenderResult() {
  const { iae, iue, iuee, iaec, iaee } = quizCalcScores();
  const zone = quizGetZone(iae, iue);
  const near = quizNearest(iae, iue);
  const iueLbl = iue < -60 ? "Muy universalista" : iue < -20 ? "Universalista" : iue < 20 ? "Centro pragmático" : iue < 60 ? "Particularista" : "Muy particularista";
  const iaeLbl = iae < 20 ? "Muy reducido" : iae < 40 ? "Limitado" : iae < 60 ? "Moderado" : iae < 80 ? "Alto" : "Máximo";

  // Nota de zona democrática
  const zonaDemNote = (iae >= 25 && iae <= 55)
    ? `<div class="quiz-zone-hetero-note">
        <strong>Zona de alta heterogeneidad:</strong> Esta región concentra regímenes muy distintos entre sí.
        La posición en el triángulo describe tu orientación declarada, no una trayectoria ni un tipo de régimen único.
        Dos personas con índices similares pueden preferir mecanismos institucionales muy diferentes.
       </div>`
    : '';

  // Desglose IAEc / IAEe
  const asymNote = Math.abs(iaec - iaee) >= 10
    ? `<div class="quiz-asym-note">
        Tus respuestas sugieren una asimetría entre alcance civil (IAEc ≈ ${iaec}) y económico (IAEe ≈ ${iaee}):
        ${iaec > iaee
          ? 'preferís más regulación sobre comportamientos que sobre la economía.'
          : 'preferís más intervención económica que control sobre libertades civiles.'}
       </div>`
    : '';

  return `
    <div class="quiz-result">
      <div class="quiz-result-title">Tu posición en el triángulo</div>
      <div class="quiz-result-sub">Basada en ${QUIZ_QUESTIONS.length} respuestas. Aproximación orientativa.</div>
      <div class="quiz-scores">
        <div class="quiz-score-card">
          <div class="quiz-score-label">IAE — Alcance</div>
          <div class="quiz-score-val c-blue">${iae}</div>
          <div class="quiz-score-desc">${iaeLbl}</div>
        </div>
        <div class="quiz-score-card">
          <div class="quiz-score-label">IUE — Orientación</div>
          <div class="quiz-score-val c-amber">${iue > 0 ? '+' : ''}${iue}</div>
          <div class="quiz-score-desc">${iueLbl}</div>
        </div>
        <div class="quiz-score-card">
          <div class="quiz-score-label">IUEe — Imposición</div>
          <div class="quiz-score-val c-teal">${iuee > 0 ? '+' : ''}${iuee}</div>
          <div class="quiz-score-desc">IUE × IAE / 100</div>
        </div>
      </div>

      <!-- Desglose IAEc / IAEe -->
      <div class="quiz-breakdown">
        <div class="quiz-breakdown-title">Desglose del alcance estatal</div>
        <div class="quiz-breakdown-row">
          <span class="quiz-breakdown-label">IAEc (alcance civil)</span>
          <div class="quiz-breakdown-bar-wrap">
            <div class="quiz-breakdown-bar quiz-breakdown-bar-c" style="width:${iaec}%"></div>
          </div>
          <span class="quiz-breakdown-val">${iaec}</span>
        </div>
        <div class="quiz-breakdown-row">
          <span class="quiz-breakdown-label">IAEe (alcance económico)</span>
          <div class="quiz-breakdown-bar-wrap">
            <div class="quiz-breakdown-bar quiz-breakdown-bar-e" style="width:${iaee}%"></div>
          </div>
          <span class="quiz-breakdown-val">${iaee}</span>
        </div>
        <div class="quiz-breakdown-caption">Basado en preguntas de libertades civiles vs. intervención económica. El IAE final es el promedio ponderado.</div>
        ${asymNote}
      </div>

      <div class="quiz-zone-card">
        <div class="quiz-zone-tag">Zona identificada</div>
        <div class="quiz-zone-name">${zone.name}</div>
        <div class="quiz-zone-desc">${zone.desc}</div>
        ${zonaDemNote}
      </div>

      <div class="quiz-comp-title">Regímenes más cercanos:</div>
      <div class="quiz-comp-list">
        ${near.map(c => `<div class="quiz-comp-item">
          <div class="quiz-comp-dot" style="background:${c.color}"></div>
          <div class="quiz-comp-name">${c.name}</div>
          <div class="quiz-comp-dist">~${c.d} pts</div>
        </div>`).join('')}
      </div>
      <div class="quiz-note">
        <strong>Sobre el IUE:</strong> El eje universalista/particularista embebe una distinción de origen liberal-ilustrado.
        No es un eje neutral: captura una variación empíricamente observable y políticamente relevante,
        pero no es filosóficamente aséptico. El modelo lo declara explícitamente en su metodología.
        <br><br>
        <strong>Sobre las fuentes:</strong> Este cuestionario es orientativo. El cálculo riguroso usa
        Freedom House, WJP Rule of Law, Fraser Economic Freedom, FMI y V-Dem. Un mismo resultado puede
        corresponder a regímenes muy distintos en sus consecuencias humanas.
      </div>
      <div class="quiz-result-actions">
        <button class="quiz-btn primary" onclick="quizGoToTriangle()">Ver en el triángulo →</button>
        <button class="quiz-btn" onclick="quizRestart()">Reiniciar</button>
      </div>
    </div>`;
}

function quizRender() {
  const panel = document.getElementById('quizPanel');
  if (!panel) return;
  panel.innerHTML = quizState.phase === 'quiz' ? quizRenderQuiz() : quizRenderResult();
  quizUpdateLiveTriangle();
}

window.quizPick = function(v) {
  quizState.answers[quizState.step] = v;
  quizRender();
  if (quizState.step < QUIZ_QUESTIONS.length - 1) {
    setTimeout(() => { quizState.step++; quizRender(); }, 280);
  }
};

window.quizNext = function() {
  if (quizState.answers[quizState.step] === null) return;
  if (quizState.step === QUIZ_QUESTIONS.length - 1) { quizState.phase = 'result'; }
  else { quizState.step++; }
  quizRender();
};

window.quizPrev = function() {
  if (quizState.step > 0) { quizState.step--; quizRender(); }
};

window.quizGoToTriangle = function() {
  const { iae, iue } = quizCalcScores();
  state.iae = iae;
  state.iue = iue;
  const iaeSlider = document.getElementById('iaeSlider');
  const iueSlider = document.getElementById('iueSlider');
  const iaeValEl  = document.getElementById('iaeVal');
  const iueValEl  = document.getElementById('iueVal');
  if (iaeSlider) iaeSlider.value = state.iae;
  if (iueSlider) iueSlider.value = state.iue;
  if (iaeValEl)  iaeValEl.textContent = state.iae;
  if (iueValEl)  iueValEl.textContent = state.iue >= 0 ? '+' + state.iue : state.iue;
  renderUserPoint();
  updatePositionPanel();
  updateContextReading();
  updateIUEAxis();
  const section = document.getElementById('triangulo');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.quizRestart = function() {
  quizState.step = 0;
  quizState.answers = Array(QUIZ_QUESTIONS.length).fill(null);
  quizState.phase = 'quiz';
  quizRender();
};

function initQuiz() {
  quizRender();
}

/* ══════════════════════════════════════════════════
   13. COMPARACIÓN DE CASOS
══════════════════════════════════════════════════ */
const compareState = { slots: [null, null] };

function initCasosCompare() {
  // Permitir doble clic para comparar (clic simple = activar, doble clic = agregar a comparación)
  // En la práctica, usaremos un long press / segundo clic para simplificar UX
  // Los botones de limpiar comparación
  document.querySelectorAll('.compare-slot-clear').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slot = parseInt(btn.dataset.slot) - 1;
      compareState.slots[slot] = null;
      renderCompare();
    });
  });
}

function addToCompare(casoId) {
  const caso = CASOS.find(c => c.id === casoId);
  if (!caso) return;

  // Si ya está en algún slot, quítalo
  const existing = compareState.slots.indexOf(casoId);
  if (existing !== -1) {
    compareState.slots[existing] = null;
  } else {
    // Llenar el primer slot vacío
    const empty = compareState.slots.indexOf(null);
    if (empty !== -1) {
      compareState.slots[empty] = casoId;
    } else {
      // Reemplazar slot 0
      compareState.slots[0] = casoId;
    }
  }
  renderCompare();
}

function renderCompare() {
  const bar  = document.getElementById('casosCompareBar');
  const hint = document.getElementById('casosCompareHint');
  const slot1Name = document.getElementById('compareSlot1Name');
  const slot2Name = document.getElementById('compareSlot2Name');
  const result    = document.getElementById('compareResult');

  const [id1, id2] = compareState.slots;
  const caso1 = id1 ? CASOS.find(c => c.id === id1) : null;
  const caso2 = id2 ? CASOS.find(c => c.id === id2) : null;

  // Actualizar visual de las tarjetas de casos
  document.querySelectorAll('.caso-item').forEach(el => {
    el.classList.toggle('compare-selected', compareState.slots.includes(el.dataset.id));
  });

  if (slot1Name) slot1Name.textContent = caso1 ? caso1.label : '—';
  if (slot2Name) slot2Name.textContent = caso2 ? caso2.label : '—';

  const hasAny = id1 || id2;
  if (bar)  bar.hidden  = !hasAny;
  if (hint) hint.hidden = hasAny;

  if (caso1 && caso2 && result) {
    const dIAE = caso2.iae - caso1.iae;
    const dIUE = caso2.iue - caso1.iue;
    const dIUEe = parseFloat(calcIUEe(caso2.iae, caso2.iue)) - parseFloat(calcIUEe(caso1.iae, caso1.iue));
    const dirIAE = dIAE > 0 ? 'mayor alcance estatal' : dIAE < 0 ? 'menor alcance estatal' : 'mismo alcance estatal';
    const dirIUE = dIUE > 0 ? 'más particularista' : dIUE < 0 ? 'más universalista' : 'misma orientación';

    result.innerHTML = `
      <strong>${caso2.label}</strong> tiene
      <span class="compare-delta-iae">${dIAE > 0 ? '+' : ''}${dIAE} puntos de IAE</span>
      (${dirIAE}) y
      <span class="compare-delta-iue">${dIUE > 0 ? '+' : ''}${dIUE} puntos de IUE</span>
      (${dirIUE}) respecto a <strong>${caso1.label}</strong>.
      El uso estatal efectivo (IUEe) difiere en ${dIUEe > 0 ? '+' : ''}${dIUEe.toFixed(1)} puntos.
      ${(caso1.zona !== caso2.zona) ? `Se ubican en zonas distintas: <em>${caso1.zona}</em> vs <em>${caso2.zona}</em>.` : `Ambos se ubican en la zona: <em>${caso1.zona}</em>.`}
    `;
  } else if (result) {
    result.innerHTML = '';
  }
}

/* ══════════════════════════════════════════════════
   14. CODEBOOK EXPANDIBLE
══════════════════════════════════════════════════ */
function initCodebookExpand() {
  const btn = document.getElementById('codebookExpandBtn');
  const box = document.getElementById('codebookInline');
  if (!btn || !box) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    box.hidden = expanded;
    btn.textContent = expanded ? 'Ver puntos clave del Codebook ↓' : 'Ocultar Codebook ↑';
  });
}

/* ══════════════════════════════════════════════════
   15. HINT DE PRIMER CLIC EN TRIÁNGULO
══════════════════════════════════════════════════ */
function initTriangleHint() {
  const hint = document.getElementById('triClickHint');
  if (!hint) return;
  hint.classList.add('visible');
  // Ocultar al primer clic en el triángulo
  const svg = document.getElementById('mainTriangle');
  if (svg) {
    svg.addEventListener('click', () => {
      hint.style.display = 'none';
    }, { once: true });
  }
}


function init() {
  // Añadir clases reveal a elementos
  document.querySelectorAll('.index-card, .met-block').forEach(el => {
    el.classList.add('reveal');
  });

  initNav();
  initHeroTriangle();
  initHeroExplainer();
  initTriangle();
  updatePositionPanel();
  updateContextReading();
  updateIUEAxis();
  initIndexCards();
  initIdeologias();
  initCasos();
  initQuiz();
  initCasosCompare();
  initTriangleHint();
  initScrollReveal();

  // Héroe: animaciones de entrada
  document.querySelectorAll('.hero > *').forEach((el, i) => {
    el.classList.add('fade-up', `fade-up-delay-${i + 1}`);
  });
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
