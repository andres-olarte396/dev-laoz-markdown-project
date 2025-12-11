const fs = require('fs');
const path = 'public/content/teach-laoz-curso_optimizacion_entrenamientos/plan_curricular.md';

const newJson = `\`\`\`json
[
  {
    "id": "modulo_1",
    "titulo": "Fundamentos de Biomecánica y Evaluación",
    "orden": 1,
    "temas": [
      {"id": "1.1", "titulo": "Análisis de movimiento aplicado al gimnasio"},
      {"id": "1.2", "titulo": "Evaluaciones posturales y funcionales iniciales"},
      {"id": "1.3", "titulo": "Detección de compensaciones musculares comunes"}
    ]
  },
  {
    "id": "modulo_2",
    "titulo": "Fisiología del Esfuerzo y Adaptación",
    "orden": 2,
    "prerequisitos": ["modulo_1"],
    "temas": [
      {"id": "2.1", "titulo": "Sistemas energéticos en el entrenamiento de fuerza e hipertrofia"},
      {"id": "2.2", "titulo": "Mecanismos de hipertrofia (Tensión mecánica, Estrés metabólico, Daño muscular)"},
      {"id": "2.3", "titulo": "Recuperación y sobreentrenamiento"}
    ]
  },
  {
    "id": "modulo_3",
    "titulo": "Selección y Optimización de Ejercicios",
    "orden": 3,
    "prerequisitos": ["modulo_1"],
    "temas": [
      {"id": "3.1", "titulo": "Patrones de movimiento fundamentales (Push, Pull, Squat, Hinge, Carry)"},
      {"id": "3.2", "titulo": "Análisis de perfiles de resistencia vs. perfiles de fuerza"},
      {"id": "3.3", "titulo": "Modificación de ejercicios para palancas individuales"}
    ]
  },
  {
    "id": "modulo_4",
    "titulo": "Diseño de Programas y Periodización",
    "orden": 4,
    "prerequisitos": ["modulo_2", "modulo_3"],
    "temas": [
      {"id": "4.1", "titulo": "Variables del entrenamiento (Volumen, Intensidad, Frecuencia)"},
      {"id": "4.2", "titulo": "Modelos de periodización (Lineal, Ondulante, Bloques)"},
      {"id": "4.3", "titulo": "Progresión y descarga (Deloads)"}
    ]
  },
  {
    "id": "modulo_5",
    "titulo": "Nutrición y Suplementación",
    "orden": 5,
    "prerequisitos": ["modulo_2"],
    "temas": [
      {"id": "5.1", "titulo": "Macronutrientes y timing peri-entreno"},
      {"id": "5.2", "titulo": "Suplementación con evidencia científica (Creatina, Cafeína, Beta-alanina)"},
      {"id": "5.3", "titulo": "Hidratación y sueño"}
    ]
  },
  {
    "id": "modulo_6",
    "titulo": "Psicología del Coaching",
    "orden": 6,
    "temas": [
      {"id": "6.1", "titulo": "Establecimiento de objetivos y motivación"},
      {"id": "6.2", "titulo": "Comunicación efectiva entrenador-atleta"},
      {"id": "6.3", "titulo": "Creación de hábitos a largo plazo"}
    ]
  }
]
\`\`\``;

let content = fs.readFileSync(path, 'utf8');
// Replace the existing JSON block
// It starts with ```json and ends with ```
content = content.replace(/```json[\s\S]*?```/, newJson);

fs.writeFileSync(path, content);
console.log('Updated plan_curricular.md');
