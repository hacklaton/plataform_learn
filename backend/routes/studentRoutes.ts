import { Router } from 'express';
import { StudentController } from '../controllers/studentController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { Role } from '../constants/roles.js';
import { createStudentSchema, updateStudentSchema } from '../schemas/person.schema.js';

const router = Router();

router.use(authenticate);

// Lectura: ADMIN y TEACHER (para gestionar a sus alumnos)
router.get('/', authorize(Role.ADMIN, Role.TEACHER), StudentController.getStudents);
router.get('/:id', authorize(Role.ADMIN, Role.TEACHER), StudentController.getStudentById);

// Escritura: solo ADMIN
router.post('/', authorize(Role.ADMIN), validate(createStudentSchema), StudentController.createStudent);
router.patch('/:id', authorize(Role.ADMIN), validate(updateStudentSchema), StudentController.updateStudent);
router.delete('/:id', authorize(Role.ADMIN), StudentController.deleteStudent);

export default router;
