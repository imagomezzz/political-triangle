# El Triángulo Político

Sitio web interactivo para explorar el modelo analítico de posiciones y trayectorias de regímenes políticos, basado en el **Codebook V3.2**.

🔗 **[Ver sitio](https://tu-usuario.github.io/nombre-repo)** ← reemplazar con la URL real

---

## Qué es el modelo

El Triángulo Político describe, compara y proyecta regímenes usando dos dimensiones independientes:

- **IAE — Índice de Alcance Estatal**: cuánto interviene el Estado (eje vertical del triángulo)
- **IUE — Índice de Uso Estatal**: hacia dónde orienta ese poder, del polo universalista-progresista (−100) al particularista-conservador (+100)

A diferencia del eje izquierda–derecha clásico, el modelo permite detectar regímenes mixtos: autoritarismos que liberalizan su economía sin abrir la política, o democracias que intervienen fuertemente en lo económico sin restringir libertades civiles.

El modelo no prescribe qué posición es mejor. Es una herramienta analítica, no un manifiesto político.

---

## Estructura del sitio

```
/
├── index.html      # Página principal (una sola página con anclas)
├── style.css       # Sistema de diseño con tokens CSS
├── main.js         # Lógica interactiva (vanilla JS, sin dependencias)
├── .nojekyll       # Evita el procesamiento Jekyll de GitHub Pages
└── README.md
```

No hay framework, bundler ni dependencias de npm. El sitio funciona abriéndolo directamente en un navegador.

---

## Funcionalidades

- **Triángulo interactivo**: sliders de IAE e IUE que mueven un punto en el espacio político; también se puede hacer clic directamente sobre el triángulo
- **Cálculo en tiempo real** de IAE, IUE, IUEe y clasificación de zona
- **Casos ilustrativos**: 7 regímenes precargados con su posición en el triángulo (Noruega, EE.UU., China, Venezuela, Irán, Somalia, Suecia 1980s)
- **Modo especialista**: toggle que muestra las fórmulas técnicas de cada índice
- **Dos audiencias**: el mismo sitio sirve a lectores generales y a especialistas que buscan rigor metodológico

---

## Índices del modelo

| Índice | Descripción | Rango |
|--------|-------------|-------|
| IAE    | Alcance Estatal total | 0–100 |
| IAEc   | Alcance Estatal Civil | 0–100 |
| IAEe   | Alcance Estatal Económico | 0–100 |
| IUE    | Uso del Estado (dirección) | −100 a +100 |
| IUEe   | Uso Estatal Efectivo = (IUE/100) × IAE | −100 a +100 |
| IVR    | Vector Resultante (trayectoria) | — |

---

## Desarrollo local

Clonar el repo y abrir `index.html` en cualquier navegador moderno. No requiere servidor local, pero si preferís uno:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Luego abrís `http://localhost:8000`.

---

## Cómo agregar casos

Los casos ilustrativos están en `main.js`, en el array `CASOS`. Cada entrada tiene esta forma:

```js
{
  id: 'id_unico',
  label: 'Nombre del régimen',
  periodo: 'año o período',
  iae: 55,          // 0–100
  iue: -40,         // −100 a +100
  color: '#1B5C9E', // color del punto en el triángulo
  zona: 'Nombre de zona',
  desc: 'Descripción breve para el público general.',
  indices: { iac: 18, iaee: 52 }, // valores desagregados opcionales
}
```

---

## Advertencia metodológica

> Este sitio documenta un modelo analítico. Las predicciones son hipótesis de trabajo sujetas a revisión empírica continua. Los casos ilustrativos son aproximaciones didácticas, no diagnósticos definitivos.
>
> Cuando exista evidencia documentada de crímenes de lesa humanidad, el output del modelo debe acompañarse de identificación explícita del tipo de coerción y referencia a fuentes históricas o jurídicas. Ver sección de Metodología en el sitio.

---

## Basado en

**Codebook V3.2 — Modelo de Espectro Político · El Triángulo Político**
Versión consolidada con validación retrospectiva sobre colapsos democráticos, transiciones, derivas iliberales y equilibrios estables.

---

## Cómo citar

> *El Triángulo Político* (Codebook V3.2). Imanol Gomez Cataldi. Disponible en: [URL del sitio].
