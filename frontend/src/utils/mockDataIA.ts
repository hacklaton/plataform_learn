import {
  Classroom,
  DropoutProjection,
  RoutineProjection,
  ReinforcementPlan,
} from '../types/ia.types';

// ============================================
// Mock data EXCLUSIVO para interfaces de IA.
// No altera ni duplica el mock existente de
// academic.api.ts / attendance.api.ts / analytics.api.ts.
// Reutiliza los mismos IDs de estudiante (std-*) para
// mantener coherencia con los datos ya existentes.
// ============================================

// --- PROFESOR: salones a su cargo (para dropdown del sidebar / dashboard) ---
export const MOCK_CLASSROOMS: Classroom[] = [
  { id: 'cls-a', name: 'Salón 10-A · Cálculo', courseCode: 'MAT-201', studentCount: 28, avgAttendance: 92.4, avgGpa: 4.1 },
  { id: 'cls-b', name: 'Salón 11-B · Inteligencia Artificial', courseCode: 'INF-305', studentCount: 32, avgAttendance: 78.9, avgGpa: 3.3 },
  { id: 'cls-c', name: 'Salón 9-C · Física Ondulatoria', courseCode: 'FIS-102', studentCount: 25, avgAttendance: 85.6, avgGpa: 3.7 },
];

// --- PROFESOR: proyecciones de deserción emitidas por el agente de IA ---
export const MOCK_DROPOUT_PROJECTIONS: DropoutProjection[] = [
  {
    id: 'dp-1',
    classroomId: 'cls-b',
    studentId: 'std-7',
    studentName: 'Lucía Pineda',
    currentRisk: 'CRITICAL',
    dropoutProbability: 87,
    projectedTrend: 'WORSENING',
    primaryFactor: 'Caída sostenida del promedio (-1.8) y 35% de asistencia en las últimas 3 semanas.',
    recommendation: 'Contactar acudiente y activar plan de refuerzo en Machine Learning antes del corte.',
  },
  {
    id: 'dp-2',
    classroomId: 'cls-a',
    studentId: 'std-4',
    studentName: 'Mateo Vasquez',
    currentRisk: 'CRITICAL',
    dropoutProbability: 81,
    projectedTrend: 'WORSENING',
    primaryFactor: 'Ausencias consecutivas detectadas por biometría y reprobación en Estructuras de Datos.',
    recommendation: 'Tutoría personalizada y seguimiento diario de asistencia facial.',
  },
  {
    id: 'dp-3',
    classroomId: 'cls-c',
    studentId: 'std-3',
    studentName: 'Camila Torres',
    currentRisk: 'MODERATE',
    dropoutProbability: 54,
    projectedTrend: 'STABLE',
    primaryFactor: 'Rendimiento a la baja pese a asistencia regular. Posible desmotivación.',
    recommendation: 'Refuerzo en ecuaciones armónicas y acompañamiento socioemocional.',
  },
  {
    id: 'dp-4',
    classroomId: 'cls-a',
    studentId: 'std-5',
    studentName: 'Valeria Gómez',
    currentRisk: 'MODERATE',
    dropoutProbability: 38,
    projectedTrend: 'IMPROVING',
    primaryFactor: 'Asistencia perfecta; el modelo proyecta recuperación tras el último refuerzo.',
    recommendation: 'Mantener plan actual y reevaluar en el siguiente parcial.',
  },
];

// --- ESTUDIANTE: premonición de rutina / proyección de fin de año ---
// Indexado por studentId para que cada alumno vea su propia proyección.
export const MOCK_ROUTINE_PROJECTIONS: Record<string, RoutineProjection> = {
  'std-4': {
    studentId: 'std-4',
    studentName: 'Mateo Vasquez',
    outlook: 'AT_RISK',
    headline: 'Tu rutina actual proyecta un cierre de año reprobatorio',
    summary:
      'El agente detectó un patrón de ausencias matutinas y baja entrega de tareas. De mantener el ritmo actual, tu promedio caería por debajo de 2.5 en diciembre.',
    confidence: 88,
    timeline: [
      { month: 'Mar', projectedGpa: 3.1, projectedAttendance: 72 },
      { month: 'Abr', projectedGpa: 2.7, projectedAttendance: 64 },
      { month: 'May', projectedGpa: 2.2, projectedAttendance: 49 },
      { month: 'Jun', projectedGpa: 2.0, projectedAttendance: 48, isProjection: true },
      { month: 'Ago', projectedGpa: 1.9, projectedAttendance: 45, isProjection: true },
      { month: 'Oct', projectedGpa: 1.8, projectedAttendance: 42, isProjection: true },
      { month: 'Dic', projectedGpa: 1.7, projectedAttendance: 40, isProjection: true },
    ],
    habits: [
      { label: 'Llegadas tarde', impact: 'NEGATIVE', detail: '6 tardanzas registradas por cámara este mes.' },
      { label: 'Entrega de tareas', impact: 'NEGATIVE', detail: 'Solo 3 de 8 entregas en Estructuras de Datos.' },
      { label: 'Participación en clase', impact: 'POSITIVE', detail: 'Buena participación cuando asiste.' },
    ],
  },
  'std-1': {
    studentId: 'std-1',
    studentName: 'Sofía Rodríguez',
    outlook: 'POSITIVE',
    headline: 'Vas en camino a cerrar el año con honores',
    summary:
      'Tu constancia en asistencia y entregas mantiene una trayectoria ascendente. El agente proyecta un promedio cercano a 4.8 al finalizar el año.',
    confidence: 91,
    timeline: [
      { month: 'Mar', projectedGpa: 4.5, projectedAttendance: 97 },
      { month: 'Abr', projectedGpa: 4.6, projectedAttendance: 98 },
      { month: 'May', projectedGpa: 4.7, projectedAttendance: 98 },
      { month: 'Jun', projectedGpa: 4.7, projectedAttendance: 99, isProjection: true },
      { month: 'Ago', projectedGpa: 4.8, projectedAttendance: 99, isProjection: true },
      { month: 'Oct', projectedGpa: 4.8, projectedAttendance: 99, isProjection: true },
      { month: 'Dic', projectedGpa: 4.9, projectedAttendance: 99, isProjection: true },
    ],
    habits: [
      { label: 'Asistencia', impact: 'POSITIVE', detail: 'Asistencia biométrica del 98% sostenida.' },
      { label: 'Constancia académica', impact: 'POSITIVE', detail: 'Todas las evaluaciones por encima de 4.5.' },
    ],
  },
};

// Proyección por defecto para alumnos sin registro específico
export const DEFAULT_ROUTINE_PROJECTION: RoutineProjection = {
  studentId: 'std-generic',
  studentName: 'Estudiante',
  outlook: 'NEUTRAL',
  headline: 'Proyección estable según tu rutina actual',
  summary:
    'El agente no detecta desviaciones significativas. Mantén tus hábitos para conservar tu promedio proyectado.',
  confidence: 76,
  timeline: [
    { month: 'Mar', projectedGpa: 3.8, projectedAttendance: 88 },
    { month: 'Abr', projectedGpa: 3.8, projectedAttendance: 87 },
    { month: 'May', projectedGpa: 3.9, projectedAttendance: 88 },
    { month: 'Jun', projectedGpa: 3.9, projectedAttendance: 88, isProjection: true },
    { month: 'Ago', projectedGpa: 4.0, projectedAttendance: 89, isProjection: true },
    { month: 'Oct', projectedGpa: 4.0, projectedAttendance: 89, isProjection: true },
    { month: 'Dic', projectedGpa: 4.1, projectedAttendance: 90, isProjection: true },
  ],
  habits: [
    { label: 'Asistencia', impact: 'POSITIVE', detail: 'Asistencia dentro del rango esperado.' },
  ],
};

// --- ESTUDIANTE: planes de refuerzo inteligente generados por el agente ---
export const MOCK_REINFORCEMENT_PLANS: Record<string, ReinforcementPlan[]> = {
  'std-4': [
    {
      id: 'rp-1',
      studentId: 'std-4',
      subject: 'Ciencias',
      topic: 'Tabla Periódica',
      currentScore: 2.1,
      targetScore: 3.5,
      priority: 'CRITICAL',
      generatedAt: new Date(Date.now() - 1000 * 3600 * 6).toISOString(),
      aiSummary:
        'Detecté confusión entre grupos y periodos, y errores al ubicar metales de transición. Diseñé un plan progresivo de 3 días.',
      activities: [
        { id: 'ra-1', type: 'VIDEO', title: 'Cómo leer la tabla periódica en 8 minutos', durationMin: 8, completed: false },
        { id: 'ra-2', type: 'READING', title: 'Grupos, periodos y propiedades periódicas', durationMin: 15, completed: false },
        { id: 'ra-3', type: 'EXERCISE', title: 'Práctica: clasifica 20 elementos', durationMin: 20, completed: false },
        { id: 'ra-4', type: 'QUIZ', title: 'Autoevaluación: configuración electrónica', durationMin: 10, completed: false },
      ],
    },
    {
      id: 'rp-2',
      studentId: 'std-4',
      subject: 'Estructuras de Datos',
      topic: 'Árboles B y Rebalanceo',
      currentScore: 1.8,
      targetScore: 3.0,
      priority: 'CRITICAL',
      generatedAt: new Date(Date.now() - 1000 * 3600 * 30).toISOString(),
      aiSummary:
        'No completaste los casos de rebalanceo en el examen. Refuerza inserción/eliminación con visualizaciones paso a paso.',
      activities: [
        { id: 'ra-5', type: 'VIDEO', title: 'Visualizando inserciones en árboles B', durationMin: 12, completed: true },
        { id: 'ra-6', type: 'EXERCISE', title: 'Simulador interactivo de rebalanceo', durationMin: 25, completed: false },
        { id: 'ra-7', type: 'QUIZ', title: 'Quiz: complejidad y casos límite', durationMin: 10, completed: false },
      ],
    },
  ],
  'std-1': [
    {
      id: 'rp-3',
      studentId: 'std-1',
      subject: 'Cálculo Multivariable',
      topic: 'Integrales Múltiples',
      currentScore: 4.0,
      targetScore: 4.8,
      priority: 'LOW',
      generatedAt: new Date(Date.now() - 1000 * 3600 * 48).toISOString(),
      aiSummary:
        'Vas bien; este refuerzo opcional te ayudará a dominar coordenadas cilíndricas para el próximo parcial.',
      activities: [
        { id: 'ra-8', type: 'READING', title: 'Integrales triples en coordenadas cilíndricas', durationMin: 18, completed: false },
        { id: 'ra-9', type: 'EXERCISE', title: 'Set de problemas avanzados', durationMin: 30, completed: false },
      ],
    },
  ],
};
