import { Router } from 'express';
import { GradeController } from '../controllers/gradeController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { Role } from '../constants/roles.js';
import { createGradeSchema, updateGradeSchema } from '../schemas/grade.schema.js';

const router = Router();

router.use(authenticate);

// GET /grades — ADMIN: todas | TEACHER: sus cursos | STUDENT: solo suyas
router.get('/', GradeController.getGrades);

// POST /grades — ADMIN y TEACHER (el service valida propiedad del curso)
router.post('/', authorize(Role.ADMIN, Role.TEACHER), validate(createGradeSchema), GradeController.createGrade);

// PATCH /grades/:id
router.patch('/:id', authorize(Role.ADMIN, Role.TEACHER), validate(updateGradeSchema), GradeController.updateGrade);

// DELETE /grades/:id
router.delete('/:id', authorize(Role.ADMIN, Role.TEACHER), GradeController.deleteGrade);

export default router;
