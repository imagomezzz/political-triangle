'use strict';

/* ══════════════════════════════════════════════════
   EL TRIÁNGULO POLÍTICO — main.js V4.0
   Módulos:
   1. Fórmulas core
   2. Estado global
   3. Datos: vértices, casos
   4. Nav
   5. Triángulo interactivo
   6. Panel de posición y contexto
   7. Índices (toggle)
   8. Módulos V4 (cards)
   9. Casos ilustrativos + comparador
   10. Scroll reveal
   11. Hero animación
   12. Init
══════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════
   1. FÓRMULAS CORE V4.0
══════════════════════════════════════════════════ */

function calcIAE(iaec, iaee) {
  if (iaee < 10) return Math.max(iaec, iaee); // IAE_político §2.2.0
  return Math.round((iaec * 0.60) + (iaee * 0.40));
}

function calcIUEe(iae, iue) {
  return ((iue / 100) * iae).toFixed(1);
}

/**
 * toXY — convierte índices a coordenadas SVG
 * usando coordenadas baricéntricas.
 */
function toXY(iae, iue, tri) {
  const iaeN = Math.max(0, Math.min(100, iae)) / 100;
  const iueN = (Math.max(-100, Math.min(100, iue)) + 100) / 200;
  const wA = 1 - iaeN;
  const wC = iaeN * (1 - iueN);
  const wF = iaeN * iueN;
  return {
    x: wA * tri.A.x + wC * tri.C.x + wF * tri.F.x,
    y: wA * tri.A.y + wC * tri.C.y + wF * tri.F.y,
  };
}

/* ══════════════════════════════════════════════════
   2. ESTADO GLOBAL
══════════════════════════════════════════════════ */
const state = {
  expertMode: false,
  dualView: false,
  iae: 50,
  iue: 0,
  activeCaso: null,
};

/* ══════════════════════════════════════════════════
   3. DATOS
══════════════════════════════════════════════════ */

const TRI = {
  A: { x: 320, y: 36,  iae: 0,   iue: 0 },
  C: { x: 100, y: 466, iae: 100, iue: -100 },
  F: { x: 540, y: 466, iae: 100, iue: 100 },
};

const CASOS_TRI = {
  A: { x: 350, y: 30  },
  C: { x: 100, y: 545 },
  F: { x: 600, y: 545 },
};

function indicesToXY(iae, iue) { return toXY(iae, iue, TRI); }
function casosToXY(iae, iue)   { return toXY(iae, iue, CASOS_TRI); }

/* ── Casos V4.0 ── */
const CASOS = [
  {
    id: 'noruega',
    label: 'Noruega',
    periodo: 'actual',
    iae: 39, iue: -40,
    iaec: 32, iaee: 49,
    color: '#1B5C9E',
    zona: 'Social democracia',
    filter: 'democratico',
    desc: 'Estado de bienestar con orientación redistributiva y alta legitimidad institucional. IAEc muy bajo (libertades sólidas), IAEe elevado por gasto público y carga tributaria.',
    v4notes: 'MCTI relevante: hidrocarburos ~40% exportaciones. IC5_inmi activo en años recientes.',
  },
  {
    id: 'suiza',
    label: 'Suiza',
    periodo: 'actual',
    iae: 32, iue: 8,
    iaec: 33, iaee: 30,
    color: '#2874A6',
    zona: 'Liberalismo moderado',
    filter: 'democratico',
    desc: 'Alcance estatal bajo-moderado con leve sesgo conservador. Estado de derecho muy sólido, economía abierta.',
  },
  {
    id: 'eeuu',
    label: 'EE.UU.',
    periodo: '2000s',
    iae: 35, iue: 20,
    iaec: 40, iaee: 27,
    color: '#1A4A7A',
    zona: 'Liberalismo conservador',
    filter: 'democratico',
    desc: 'Alcance estatal moderado-bajo con orientación conservadora en lo cultural y liberal en lo económico.',
  },
  {
    id: 'hungria',
    label: 'Hungría',
    periodo: '2022',
    iae: 43, iue: 55,
    iaec: 44, iaee: 42,
    color: '#7B3F00',
    zona: 'Autoritarismo electoral',
    filter: 'autoritario',
    desc: 'Autoritarismo electoral con proyecto nacionalista-conservador. IAEc elevado por captura informacional y debilitamiento institucional progresivo.',
    v4notes: 'IC4 moderado (tensiones dentro del bloque Fidesz). IGE relevante: dependencia energética rusa.',
  },
  {
    id: 'singapur',
    label: 'Singapur',
    periodo: '2020',
    iae: 35, iue: 15,
    iaec: 44, iaee: 21,
    color: '#8B6914',
    zona: 'Autoritarismo por desempeño',
    filter: 'autoritario',
    desc: 'Autoritarismo por desempeño. Asimetría R1 marcada: IAEc (44) muy superior a IAEe (21). Control político con economía muy libre.',
  },
  {
    id: 'china',
    label: 'China',
    periodo: 'actual',
    iae: 52, iue: -15,
    iaec: 58, iaee: 44,
    color: '#C0392B',
    zona: 'Autoritarismo de mercado',
    filter: 'autoritario',
    desc: 'Alto control civil con economía parcialmente liberalizada. Asimetría R1 estructural. Liderazgo personal muy concentrado.',
    v4notes: 'IC1 elevado (Xi Jinping). IGE moderado. IC4 bajo (bloque cohesionado).',
    highCoercion: true,
  },
  {
    id: 'venezuela',
    label: 'Venezuela',
    periodo: '2015-2023',
    iae: 52, iue: -65,
    iaec: 58, iaee: 43,
    color: '#E07B20',
    zona: 'Autoritarismo izquierdista',
    filter: 'autoritario',
    desc: 'Expansión estatal con proyecto homogeneizador económico. Emigración masiva selectiva (IC5_emi activo). Dependencia de China/Rusia (IGE elevado).',
    v4notes: 'IC5_emi: ~7M de emigrantes (>20% de la PEA). MCTI: colapso del precio del petróleo 2014-2016. IGE alto.',
    highCoercion: true,
    trayectoria: {
      label: 'Venezuela 1999',
      iae: 40, iue: -28, color: '#E07B20',
      desc: 'Inicio del gobierno de Chávez: alcance estatal moderado, orientación redistributiva incipiente.',
    },
  },
  {
    id: 'iran',
    label: 'Irán',
    periodo: 'actual',
    iae: 51, iue: 80,
    iaec: 61, iaee: 37,
    color: '#8B1A1A',
    zona: 'Teocracia autoritaria',
    filter: 'autoritario',
    desc: 'Estado con fuerte orientación religiosa particularista. IAEc muy alto por control civil y represión sistemática.',
    v4notes: 'IGE alto: exposición a sanciones (EEUU/UE) + dependencia de China. ICAI moderado (conflicto regional).',
    highCoercion: true,
    trayectoria: {
      label: 'Irán 1979',
      iae: 45, iue: 55, color: '#8B1A1A',
      desc: 'Revolución Islámica: expansión inicial del aparato estatal con proyecto teocrático en construcción.',
    },
  },
  {
    id: 'ukraine',
    label: 'Ucrania',
    periodo: '2022-2024',
    iae: 46, iue: 10,
    iaec: 52, iaee: 36,
    color: '#2D6A4F',
    zona: 'Democracia en conflicto',
    filter: 'autoritario',
    desc: 'ICAI muy alto (conflicto armado interestatal de alta intensidad). IAEc elevado por medidas de emergencia situacionales. IVR_econ declarado inaplicable en picos del conflicto.',
    v4notes: 'Caso ancla principal del módulo ICAI. ICAI ~75-85. IF1c_ajustado_ICAI activo (expansión civil situacional, no estructural).',
  },
  {
    id: 'somalia',
    label: 'Somalia',
    periodo: '1990s',
    iae: 9, iue: 0,
    iaec: 8, iaee: 9,
    color: '#888',
    zona: 'Estado fallido',
    filter: 'extremo',
    desc: 'Colapso del Estado. El monopolio de la violencia se fragmenta entre actores armados no estatales. IAE_político activo §2.2.0.',
    iaePolitico: true,
  },
  {
    id: 'suecia_80',
    label: 'Suecia',
    periodo: '1980s',
    iae: 43, iue: -55,
    iaec: 33, iaee: 57,
    color: '#0F6E5A',
    zona: 'Social democracia plena',
    filter: 'democratico',
    desc: 'Modelo de Estado de bienestar en su punto de mayor expansión. IAEc muy bajo (33), IAEe elevado (57) por gasto público ~62% del PIB.',
    trayectoria: {
      label: 'Suecia 2020s',
      iae: 36, iue: -28, color: '#0F6E5A',
      desc: 'Retroceso moderado: gasto/PIB cae a ~49%. IC5_inmi activo 2015-2018: amplificación de IF3_der_shock.',
    },
  },
  {
    id: 'chile_pinochet',
    label: 'Chile — Pinochet',
    periodo: '~1985',
    iae: 43, iue: 50,
    iaec: 53, iaee: 27,
    color: '#5C4A1A',
    zona: 'Autoritarismo moderado de derecha',
    filter: 'autoritario',
    desc: 'Autoritarismo de derecha con liberalización económica. IAEc elevado por represión y FF.AA. autónomas. IAEe bajo por desregulación y apertura.',
    highCoercion: true,
  },
  {
    id: 'urss_stalin',
    label: 'URSS — Stalin',
    periodo: '~1950',
    iae: 72, iue: -90,
    iaec: 69, iaee: 76,
    color: '#7A0000',
    zona: 'Totalitarismo de izquierda',
    filter: 'extremo',
    desc: 'Estado totalitario con proyecto de homogeneización económica absoluta. Terror sistemático documentado. Caso ancla para IC4 (URSS 1989: fragmentación del bloque).',
    highCoercion: true,
  },
  {
    id: 'alemania_nazi',
    label: 'Alemania Nazi',
    periodo: '1938',
    iae: 62, iue: 85,
    iaec: 68, iaee: 52,
    color: '#4A1A1A',
    zona: 'Fascismo histórico',
    filter: 'extremo',
    desc: 'Estado total con proyecto homogeneizador cultural de carácter genocida. Terror de Estado sistemático. IAEc máximo por control total.',
    highCoercion: true,
    trayectoria: {
      label: 'Alemania 1933',
      iae: 44, iue: 50, color: '#4A1A1A',
      desc: 'Toma del poder: alcance estatal moderado en expansión, viraje hacia homogeneización cultural.',
    },
  },
];

/* ── Vértices ── */
const VERTICES = {
  anarquia: {
    label: 'Anarquía',
    iae: 0, iue: 0,
    desc: 'Ausencia de Estado. IAE = 0: no hay aparato coercitivo legitimado. El IUE no tiene sentido cuando no hay Estado que lo oriente.',
  },
  comunismo: {
    label: 'Polo igualitario · Homogeneidad económica',
    iae: 100, iue: -100,
    highCoercion: true,
    desc: 'Estado total con orientación universalista-igualitaria. IAE = 100, IUE = −100. Los regímenes históricos que se acercaron a este vértice documentan terror sistemático y crímenes de lesa humanidad.',
  },
  fascismo: {
    label: 'Polo identitario · Homogeneidad cultural',
    iae: 100, iue: 100,
    highCoercion: true,
    desc: 'Estado total con orientación particularista. IAE = 100, IUE = +100. Los regímenes históricos que se acercaron a este vértice documentan terror sistemático y crímenes de lesa humanidad.',
  },
};

/* ── Base de contexto por zona ── */
const CONTEXT_DB = [
  {
    test: (iae) => iae < 12,
    public: 'El Estado tiene una presencia muy débil o inexistente. No hay monopolio real de la fuerza: la coerción está fragmentada entre actores no estatales.',
    expert: 'IAE < 12: colapso estatal. El modelo opera en modo degradado. IAE_político activo cuando IAEe < 10.',
  },
  {
    test: (iae, iue) => iae >= 12 && iae < 35 && Math.abs(iue) <= 30,
    public: 'Estado presente pero limitado, sin orientación ideológica fuerte. Protege derechos individuales sin imponer un proyecto cultural uniforme.',
    expert: 'Zona liberal clásica: IAE 12–35, IUE ±30. Alta sensibilidad al IC2 negativo.',
  },
  {
    test: (iae, iue) => iae >= 12 && iae < 38 && iue < -30,
    public: 'Estado relativamente pequeño con orientación progresista. Quiere redistribuir, pero con capacidad limitada.',
    expert: 'IUEe negativo moderado. Asimetría intención/capacidad.',
  },
  {
    test: (iae, iue) => iae >= 12 && iae < 38 && iue > 30,
    public: 'Estado pequeño con orientación conservadora. Puede ser culturalmente restrictivo, pero sin los instrumentos para imponerlo masivamente.',
    expert: 'IUEe positivo bajo. Baja capacidad coercitiva limita el proyecto particularista.',
  },
  {
    test: (iae, iue) => iae >= 35 && iae < 58 && iue < -20,
    public: 'Estado de bienestar con orientación redistributiva. Interviene activamente para reducir desigualdades y garantizar derechos sociales.',
    expert: 'Zona de equilibrio estable. IAEc bajo preserva pluralismo. IAEe elevado financia redistribución.',
  },
  {
    test: (iae, iue) => iae >= 35 && iae < 58 && iue >= -20 && iue <= 20,
    public: 'Estado activo en la economía y la regulación, sin orientación ideológica fuerte hacia ningún polo. Zona de alta negociación política y pluralismo.',
    expert: 'IUEe próximo a cero. Equilibrio dinámico. Sensible a polarización via IC1.',
  },
  {
    test: (iae, iue) => iae >= 35 && iae < 58 && iue > 20,
    public: 'Estado con capacidad real de intervención, orientado a preservar el orden cultural establecido. Tiene contrapesos democráticos que limitan el proyecto.',
    expert: 'Zona conservadora institucionalizada. Riesgo de captura si IAEc sube sin aumento de II1.',
  },
  {
    test: (iae, iue) => iae >= 58 && iue < -40,
    public: 'Estado muy poderoso orientado a un proyecto de homogeneización económica. A esta escala de coerción, la supresión violenta de la disidencia es estructural.',
    expert: 'IUEe negativo elevado. Protocolo de coerción extrema obligatorio si hay evidencia de crímenes de lesa humanidad.',
  },
  {
    test: (iae, iue) => iae >= 58 && iue >= -40 && iue <= 40,
    public: 'Estado muy poderoso sin proyecto ideológico claro. El control es el objetivo en sí mismo. Depende casi exclusivamente del IC1 para mantenerse.',
    expert: 'Alta dependencia del IC1. II1 mínimo. Vulnerable a IC2 negativo.',
  },
  {
    test: (iae, iue) => iae >= 58 && iue > 40,
    public: 'Estado muy poderoso orientado a imponer un orden cultural o religioso particular. La supresión de la disidencia es estructural a esta escala.',
    expert: 'IUEe positivo elevado. Protocolo de coerción extrema obligatorio si hay evidencia de crímenes de lesa humanidad.',
  },
];

function getContext(iae, iue) {
  return CONTEXT_DB.find(e => e.test(iae, iue)) || {
    public: 'Mové los sliders o hacé clic en el triángulo.',
    expert: '',
  };
}

function calcZone(iae, iue) {
  if (iae < 12) return 'Estado mínimo / Colapso';
  if (iae < 35) {
    if (iue < -30) return 'Liberalismo de izquierda';
    if (iue >  30) return 'Liberalismo conservador';
    return 'Liberalismo';
  }
  if (iae < 58) {
    if (iue < -50) return 'Social democracia';
    if (iue < -20) return 'Centro-izquierda';
    if (iue >  50) return 'Conservadurismo';
    if (iue >  20) return 'Centro-derecha';
    return 'Centro democrático';
  }
  if (iue < -60) return 'Autoritarismo de izquierda';
  if (iue >  60) return 'Autoritarismo de derecha';
  return 'Autoritarismo pragmático';
}

/* ══════════════════════════════════════════════════
   4. NAV
══════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('modeToggle');
  const modeLabel = document.getElementById('modeLabel');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  const MODES = [
    { key: 'explorer', label: 'Explorador' },
    { key: 'expert',   label: 'Especialista' },
  ];
  let modeIdx = 0;

  function applyMode(idx) {
    document.body.classList.remove('expert-mode');
    const m = MODES[idx];
    if (m.key === 'expert') document.body.classList.add('expert-mode');
    modeLabel.textContent = m.label;
    state.expertMode = m.key === 'expert';
    updateExpertVisibility();
  }

  toggle.addEventListener('click', () => {
    modeIdx = (modeIdx + 1) % MODES.length;
    applyMode(modeIdx);
  });

  applyMode(0);

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.textContent = navLinks.classList.contains('open') ? '✕' : '☰';
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.textContent = '☰';
    });
  });

  // Active link
  const sections = document.querySelectorAll('section[id]');
  const anchors = document.querySelectorAll('.nav-links a');
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        anchors.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' }).observe !== undefined &&
  sections.forEach(s => {
    new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          anchors.forEach(a => a.classList.remove('active'));
          const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' }).observe(s);
  });
}

function updateExpertVisibility() {
  document.querySelectorAll('.expert-only').forEach(el => {
    if (el.getAttribute('hidden') !== null && !state.expertMode) return;
    el.hidden = !state.expertMode;
  });
  const ivrPanel = document.getElementById('ivrPanel');
  if (ivrPanel) ivrPanel.hidden = !state.expertMode;
}

/* ══════════════════════════════════════════════════
   5. TRIÁNGULO INTERACTIVO
══════════════════════════════════════════════════ */
function xyToIndices(x, y, svgEl) {
  const vb = svgEl.viewBox.baseVal;
  const rect = svgEl.getBoundingClientRect();
  const svgX = x * (vb.width / rect.width);
  const svgY = y * (vb.height / rect.height);

  const denom = (TRI.C.y - TRI.F.y) * (TRI.A.x - TRI.F.x) + (TRI.F.x - TRI.C.x) * (TRI.A.y - TRI.F.y);
  if (Math.abs(denom) < 1e-10) return null;

  const wA = ((TRI.C.y - TRI.F.y) * (svgX - TRI.F.x) + (TRI.F.x - TRI.C.x) * (svgY - TRI.F.y)) / denom;
  const wC = ((TRI.F.y - TRI.A.y) * (svgX - TRI.F.x) + (TRI.A.x - TRI.F.x) * (svgY - TRI.F.y)) / denom;
  const wF = 1 - wA - wC;

  if (wA < -0.01 || wC < -0.01 || wF < -0.01) return null;

  return {
    iae: Math.round(Math.max(0, Math.min(100, (wC + wF) * 100))),
    iue: Math.round(Math.max(-100, Math.min(100, (wF / (wC + wF + 1e-10)) * 200 - 100))),
  };
}

function initTriangle() {
  const svg  = document.getElementById('mainTriangle');
  const iaeS = document.getElementById('iaeSlider');
  const iueS = document.getElementById('iueSlider');
  const iaeV = document.getElementById('iaeVal');
  const iueV = document.getElementById('iueVal');
  if (!svg) return;

  function syncState(iae, iue) {
    state.iae = iae;
    state.iue = iue;
    if (iaeS) iaeS.value = iae;
    if (iueS) iueS.value = iue;
    if (iaeV) iaeV.textContent = iae;
    if (iueV) iueV.textContent = iue >= 0 ? '+' + iue : iue;
    renderUserPoint();
    updatePositionPanel();
  }

  if (iaeS) iaeS.addEventListener('input', () => syncState(+iaeS.value, +iueS.value));
  if (iueS) iueS.addEventListener('input', () => syncState(+iaeS.value, +iueS.value));

  const dualToggle = document.getElementById('dualViewToggle');
  if (dualToggle) {
    dualToggle.addEventListener('change', () => {
      state.dualView = dualToggle.checked;
      renderUserPoint();
    });
  }

  svg.addEventListener('click', (e) => {
    const r = svg.getBoundingClientRect();
    const result = xyToIndices(e.clientX - r.left, e.clientY - r.top, svg);
    if (!result) {
      const poly = document.getElementById('triPolygon');
      if (poly) {
        poly.style.stroke = 'var(--accent)';
        poly.style.strokeWidth = '2.5';
        setTimeout(() => {
          poly.style.stroke = 'var(--border-main)';
          poly.style.strokeWidth = '1.5';
        }, 350);
      }
      return;
    }
    syncState(result.iae, result.iue);
    // Ocultar hint
    const hint = document.getElementById('triClickHint');
    if (hint) hint.style.opacity = '0';
  });

  svg.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const r = svg.getBoundingClientRect();
    const result = xyToIndices(t.clientX - r.left, t.clientY - r.top, svg);
    if (result) syncState(result.iae, result.iue);
  }, { passive: false });

  // Vértices clicables
  ['anarquia', 'comunismo', 'fascismo'].forEach(key => {
    const el = document.getElementById(`v-${key}`);
    if (!el) return;
    const show = () => showVertexTooltip(key);
    el.addEventListener('click', show);
    el.addEventListener('keydown', e => { if (e.key === 'Enter') show(); });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.vertex') && !e.target.closest('#triangleTooltip')) {
      hideVertexTooltip();
    }
  });

  // Hint inicial
  const hint = document.getElementById('triClickHint');
  if (hint) setTimeout(() => hint.classList.add('visible'), 1200);

  syncState(50, 0);
}

function renderUserPoint() {
  const svg = document.getElementById('mainTriangle');
  if (!svg) return;
  const dot   = document.getElementById('userDot');
  const pulse = document.getElementById('userPulse');
  if (!dot) return;

  const { x, y } = indicesToXY(state.iae, state.iue);
  dot.setAttribute('cx', x);   dot.setAttribute('cy', y);   dot.setAttribute('opacity', '1');
  pulse.setAttribute('cx', x); pulse.setAttribute('cy', y); pulse.setAttribute('opacity', '0.6');

  // Vista dual
  const dualGroup = document.getElementById('dualPointC');
  const dualLine  = document.getElementById('dualLine');
  const dualDotC  = document.getElementById('dualDotC');
  const dualLblC  = document.getElementById('dualLabelC');

  if (dualGroup && dualLine) {
    if (state.dualView && state.iae >= 40) {
      const iueNorm = state.iue / 100;
      const asym = iueNorm * 0.15;
      const iaecVal = Math.max(0, Math.min(100, Math.round(state.iae * (1 + asym + 0.05))));
      const { x: cx, y: cy } = indicesToXY(iaecVal, state.iue);
      dualDotC.setAttribute('cx', cx); dualDotC.setAttribute('cy', cy);
      if (dualLblC) { dualLblC.setAttribute('x', cx); dualLblC.setAttribute('y', cy - 14); dualLblC.textContent = `IAEc≈${iaecVal}`; }
      dualGroup.setAttribute('opacity', '1');
      dualLine.setAttribute('x1', x); dualLine.setAttribute('y1', y);
      dualLine.setAttribute('x2', cx); dualLine.setAttribute('y2', cy);
      dualLine.setAttribute('opacity', '0.7');
    } else {
      dualGroup.setAttribute('opacity', '0');
      dualLine.setAttribute('opacity', '0');
    }
  }

  // Pulso animado
  pulse.style.animation = 'none';
  void pulse.offsetWidth;
  pulse.style.animation = '';
}

function showVertexTooltip(key) {
  const v = VERTICES[key];
  if (!v) return;
  const ttGroup = document.getElementById('triangleTooltip');
  const ttTitle = document.getElementById('ttTitle');
  const ttSub   = document.getElementById('ttSub');
  const ttBg    = document.getElementById('ttBg');
  const ttDesc  = document.getElementById('ttDesc');
  if (!ttGroup) return;

  if (ttTitle) ttTitle.textContent = v.label;
  if (ttSub)   ttSub.textContent   = `IAE=${v.iae} · IUE=${v.iue}`;

  // Ajustar posición del box
  const pos = key === 'anarquia' ? { x: 170, y: 50 }
            : key === 'comunismo' ? { x: 100, y: 310 }
            : { x: 320, y: 310 };
  if (ttBg) { ttBg.setAttribute('x', pos.x); ttBg.setAttribute('y', pos.y); ttBg.setAttribute('width', '220'); ttBg.setAttribute('height', v.highCoercion ? 100 : 80); }
  if (ttTitle) { ttTitle.setAttribute('x', pos.x + 110); ttTitle.setAttribute('y', pos.y + 20); }
  if (ttSub)   { ttSub.setAttribute('x', pos.x + 110);   ttSub.setAttribute('y', pos.y + 35); }
  if (ttDesc) {
    ttDesc.setAttribute('x', pos.x + 110);
    ttDesc.setAttribute('y', pos.y + 52);
    // Truncar texto para SVG
    const short = v.desc.length > 90 ? v.desc.slice(0, 87) + '…' : v.desc;
    ttDesc.textContent = short;
    if (v.highCoercion) {
      ttDesc.setAttribute('fill', 'var(--c-left)');
    } else {
      ttDesc.setAttribute('fill', 'var(--ink-3)');
    }
  }
  ttGroup.setAttribute('opacity', '1');
}

function hideVertexTooltip() {
  const ttGroup = document.getElementById('triangleTooltip');
  if (ttGroup) ttGroup.setAttribute('opacity', '0');
}

/* ══════════════════════════════════════════════════
   6. PANEL DE POSICIÓN Y CONTEXTO
══════════════════════════════════════════════════ */
function updatePositionPanel() {
  const iuee  = calcIUEe(state.iae, state.iue);
  const zona  = calcZone(state.iae, state.iue);
  const ctx   = getContext(state.iae, state.iue);

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('posIAE',  state.iae);
  setEl('posIUE',  (state.iue >= 0 ? '+' : '') + state.iue);
  setEl('posIUEe', iuee);
  setEl('posZone', zona);

  // Contexto
  const ctxText = document.getElementById('contextText');
  if (ctxText) {
    ctxText.style.opacity = '0';
    setTimeout(() => { ctxText.textContent = ctx.public; ctxText.style.opacity = '1'; }, 140);
  }

  const ctxExp = document.getElementById('contextExpertText');
  if (ctxExp) ctxExp.textContent = ctx.expert || '';

  const ctxExpPanel = document.getElementById('contextExpert');
  if (ctxExpPanel) ctxExpPanel.hidden = !state.expertMode || !ctx.expert;
}

/* ══════════════════════════════════════════════════
   7. ÍNDICES — TOGGLE EXPANDIR
══════════════════════════════════════════════════ */
function initIndexCards() {
  document.querySelectorAll('.ic-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cardId = btn.dataset.target;
      const card = document.getElementById(cardId);
      if (!card) return;
      const expand = card.querySelector('.ic-expand');
      if (!expand) return;
      const open = !expand.hidden;
      expand.hidden = open;
      btn.textContent = open ? 'Ver más ↓' : 'Ver menos ↑';
    });
  });
}

/* ══════════════════════════════════════════════════
   8. MÓDULOS V4 — hover detalle
══════════════════════════════════════════════════ */
function initModules() {
  // Las module-cards ya tienen todo el contenido en HTML.
  // Aquí podríamos añadir interactividad extra si se necesita.
}

/* ══════════════════════════════════════════════════
   9. CASOS ILUSTRATIVOS + COMPARADOR
══════════════════════════════════════════════════ */
const compareState = { slots: [] };

function initCasos() {
  const list   = document.getElementById('casosList');
  const ptGroup = document.getElementById('casosPoints');
  const svg    = document.getElementById('casosTriangle');
  const tooltip = document.getElementById('casosTooltip');
  if (!list || !svg) return;

  let activeFilter = 'all';

  // Botones de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderCasosList();
      renderCasosPoints();
    });
  });

  function renderCasosList() {
    list.innerHTML = '';
    CASOS
      .filter(c => activeFilter === 'all' || c.filter === activeFilter)
      .forEach(caso => {
        const el = document.createElement('div');
        el.className = 'caso-item reveal';
        el.dataset.id = caso.id;
        if (state.activeCaso === caso.id) el.classList.add('active');
        if (compareState.slots.includes(caso.id)) el.classList.add('compare-selected');
        el.innerHTML = `
          <div class="caso-item-name">${caso.label}</div>
          <div class="caso-item-periodo">${caso.periodo}</div>
          <div class="caso-item-indices">IAE ${caso.iae} · IUE ${caso.iue >= 0 ? '+' : ''}${caso.iue}</div>
        `;
        el.addEventListener('click', () => selectCaso(caso.id));
        list.appendChild(el);
        requestAnimationFrame(() => el.classList.add('visible'));
      });
  }

  function renderCasosPoints() {
    if (!ptGroup) return;
    ptGroup.innerHTML = '';
    const visible = CASOS.filter(c => activeFilter === 'all' || c.filter === activeFilter);

    visible.forEach(caso => {
      const { x, y } = casosToXY(caso.iae, caso.iue);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.style.cursor = 'pointer';

      // Trayectoria
      if (caso.trayectoria) {
        const { x: x0, y: y0 } = casosToXY(caso.trayectoria.iae, caso.trayectoria.iue);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x0); line.setAttribute('y1', y0);
        line.setAttribute('x2', x);  line.setAttribute('y2', y);
        line.setAttribute('stroke', caso.color);
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '5 3');
        line.setAttribute('opacity', '0.5');
        line.setAttribute('marker-end', 'url(#arrowTray)');
        ptGroup.appendChild(line);

        // Punto inicial
        const c0 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c0.setAttribute('cx', x0); c0.setAttribute('cy', y0); c0.setAttribute('r', '5');
        c0.setAttribute('fill', caso.color); c0.setAttribute('opacity', '0.35');
        ptGroup.appendChild(c0);
      }

      // Punto principal
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', '7');
      circle.setAttribute('fill', caso.color);
      circle.setAttribute('stroke', 'var(--white)');
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('opacity', state.activeCaso === caso.id ? '1' : '0.75');

      // Etiqueta
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x + 10); text.setAttribute('y', y + 4);
      text.setAttribute('font-family', 'IBM Plex Sans');
      text.setAttribute('font-size', '10');
      text.setAttribute('fill', 'var(--ink-2)');
      text.textContent = caso.label;

      g.appendChild(circle);
      g.appendChild(text);
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        selectCaso(caso.id);
      });

      // Hover tooltip
      g.addEventListener('mouseenter', (e) => showCasoTooltip(caso, e));
      g.addEventListener('mouseleave', () => { if (tooltip) tooltip.hidden = true; });

      ptGroup.appendChild(g);
    });
  }

  function selectCaso(id) {
    // Toggle comparador
    if (compareState.slots.includes(id)) {
      compareState.slots = compareState.slots.filter(s => s !== id);
    } else if (compareState.slots.length < 2) {
      compareState.slots.push(id);
    } else {
      compareState.slots = [compareState.slots[1], id];
    }
    state.activeCaso = id;
    renderCasosList();
    renderCasosPoints();
    updateCompare();
  }

  function showCasoTooltip(caso, e) {
    if (!tooltip) return;
    const wrap = document.querySelector('.casos-triangle-wrap');
    if (!wrap) return;
    const wr = wrap.getBoundingClientRect();
    tooltip.innerHTML = `
      <div class="ct-name">${caso.label} <span style="opacity:0.5;font-size:0.8em">${caso.periodo}</span></div>
      <div class="ct-indices">IAE ${caso.iae} · IUE ${caso.iue >= 0 ? '+' : ''}${caso.iue} · IUEe ${calcIUEe(caso.iae, caso.iue)}</div>
      <div class="ct-desc">${caso.desc}</div>
      ${caso.v4notes && state.expertMode ? `<div class="ct-desc" style="margin-top:6px;font-style:italic;color:var(--accent);font-size:0.75rem">V4: ${caso.v4notes}</div>` : ''}
    `;
    tooltip.style.left = (e.clientX - wr.left + 12) + 'px';
    tooltip.style.top  = (e.clientY - wr.top  + 12) + 'px';
    tooltip.hidden = false;
  }

  renderCasosList();
  renderCasosPoints();
}

function updateCompare() {
  const bar    = document.getElementById('compareBar');
  const hint   = document.getElementById('compareHint');
  const s1Name = document.getElementById('slot1Name');
  const s2Name = document.getElementById('slot2Name');
  const result = document.getElementById('compareResult');

  const [id1, id2] = compareState.slots;
  const c1 = CASOS.find(c => c.id === id1);
  const c2 = CASOS.find(c => c.id === id2);

  if (s1Name) s1Name.textContent = c1 ? c1.label : '—';
  if (s2Name) s2Name.textContent = c2 ? c2.label : '—';

  const hasAny = id1 || id2;
  if (bar)  bar.hidden  = !hasAny;
  if (hint) hint.hidden = hasAny;

  if (c1 && c2 && result) {
    const dIAE  = c2.iae - c1.iae;
    const dIUE  = c2.iue - c1.iue;
    const dIUEe = parseFloat(calcIUEe(c2.iae, c2.iue)) - parseFloat(calcIUEe(c1.iae, c1.iue));
    const dirIAE = dIAE > 0 ? 'mayor alcance estatal' : dIAE < 0 ? 'menor alcance estatal' : 'mismo alcance estatal';
    const dirIUE = dIUE > 0 ? 'más identitario' : dIUE < 0 ? 'más igualitario' : 'misma orientación';
    result.innerHTML = `
      <strong>${c2.label}</strong> tiene
      <span class="compare-delta-iae">${dIAE > 0 ? '+' : ''}${dIAE} pts IAE</span> (${dirIAE})
      y <span class="compare-delta-iue">${dIUE > 0 ? '+' : ''}${dIUE} pts IUE</span> (${dirIUE})
      respecto a <strong>${c1.label}</strong>.
      IUEe difiere en ${dIUEe > 0 ? '+' : ''}${dIUEe.toFixed(1)} puntos.
      ${c1.zona !== c2.zona
        ? `Zonas distintas: <em>${c1.zona}</em> vs <em>${c2.zona}</em>.`
        : `Misma zona: <em>${c1.zona}</em>.`}
    `;
  } else if (result) {
    result.innerHTML = '';
  }
}

/* ══════════════════════════════════════════════════
   10. SCROLL REVEAL
══════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.index-card, .module-card, .met-block');
  els.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════
   11. HERO ANIMACIÓN
══════════════════════════════════════════════════ */
function initHeroAnim() {
  const dot = document.getElementById('heroDot');
  const pulse = document.getElementById('heroPulse');
  if (!dot) return;

  // Mover el punto entre posiciones representativas del triángulo
  const waypoints = [
    { iae: 40, iue: -50 },  // Social democracia
    { iae: 35, iue: 10 },   // Liberalismo
    { iae: 55, iue: 70 },   // Autoritarismo derecha
    { iae: 62, iue: -80 },  // Autoritarismo izquierda
    { iae: 45, iue: -5 },   // Centro
  ];

  const HERO_TRI = { A: { x: 140, y: 12 }, C: { x: 20, y: 220 }, F: { x: 260, y: 220 } };
  let idx = 0;

  function moveDot() {
    const wp = waypoints[idx % waypoints.length];
    const { x, y } = toXY(wp.iae, wp.iue, HERO_TRI);
    dot.style.transition = 'cx 1s ease, cy 1s ease';
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    if (pulse) { pulse.setAttribute('cx', x); pulse.setAttribute('cy', y); }
    idx++;
  }

  moveDot();
  setInterval(moveDot, 2500);
}

/* ══════════════════════════════════════════════════
   12. INIT
══════════════════════════════════════════════════ */
function init() {
  initNav();
  initTriangle();
  updatePositionPanel();
  initIndexCards();
  initModules();
  initCasos();
  initScrollReveal();
  initHeroAnim();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
