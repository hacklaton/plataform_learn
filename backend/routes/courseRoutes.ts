/**
 * routes/courseRoutes.ts
 *
 * Rutas para la gestión de cursos y planes educativos.
 * Protegidas con autenticación JWT y autorización por rol.
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { Role } from '../constants/roles.js';
import {
  createCourse,
  getTeacherCourseList,
  getCourse,
  getCourseTopics,
  selectTopic,
  finalizePlan,
  suggestTopics,
} from '../controllers/courseController.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * POST /courses
 * Crea un nuevo curso y dispara la generación del plan educativo.
 * Solo TEACHER y ADMIN pueden crear cursos.
 *
 * Body: { title, subject, durationMonths, targetLevel, description? }
 */
router.post('/', authorize(Role.TEACHER, Role.ADMIN), createCourse);

/**
 * GET /courses
 * Lista todos los cursos del profesor autenticado.
 */
router.get('/', authorize(Role.TEACHER, Role.ADMIN), getTeacherCourseList);

/**
 * GET /courses/:id
 * Obtiene un curso con su plan completo, semanas y tópicos.
 * Accesible por cualquier usuario autenticado.
 */
router.get('/:id', getCourse);

/**
 * GET /courses/:id/topics
 * Lista todos los tópicos del plan de un curso, agrupados por semana.
 * Muestra cuáles están seleccionados por el profesor.
 */
router.get('/:id/topics', getCourseTopics);

/**
 * PATCH /courses/:id/topics/:topicId/select
 * El profesor selecciona o deselecciona un tópico para su plan de clases.
 *
 * Body: { selected: boolean, notes?: string }
 */
router.patch(
  '/:id/topics/:topicId/select',
  authorize(Role.TEACHER, Role.ADMIN),
  selectTopic,
);

/**
 * POST /courses/:id/finalize
 * Finaliza el plan del curso con los tópicos seleccionados por el profesor.
 */
router.post('/:id/finalize', authorize(Role.TEACHER, Role.ADMIN), finalizePlan);

/**
 * POST /courses/:id/weeks/:weekNumber/suggest
 * Solicita sugerencias adicionales de tópicos para una semana específica.
 * Llama al agente Python para generar más opciones.
 */
router.post(
  '/:id/weeks/:weekNumber/suggest',
  authorize(Role.TEACHER, Role.ADMIN),
  suggestTopics,
);

export default router;

