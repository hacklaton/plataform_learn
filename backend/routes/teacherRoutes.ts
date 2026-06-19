import { Router } from 'express';
import { TeacherController } from '../controllers/teacherController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { Role } from '../constants/roles.js';
import { createTeacherSchema, updateTeacherSchema } from '../schemas/person.schema.js';

const router = Router();

router.use(authenticate);

// CRUD de profesores: exclusivo de ADMIN
router.get('/', authorize(Role.ADMIN), TeacherController.getTeachers);
router.get('/:id', authorize(Role.ADMIN), TeacherController.getTeacherById);
router.post('/', authorize(Role.ADMIN), validate(createTeacherSchema), TeacherController.createTeacher);
router.patch('/:id', authorize(Role.ADMIN), validate(updateTeacherSchema), TeacherController.updateTeacher);
router.delete('/:id', authorize(Role.ADMIN), TeacherController.deleteTeacher);

export default router;
