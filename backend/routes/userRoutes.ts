import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { updateUserSchema, changePasswordSchema } from '../schemas/user.schema.js';
import { Role } from '../constants/roles.js';

const router = Router();

router.get('/', authenticate, authorize(Role.ADMIN), UserController.getAllUsers);
router.get('/me', authenticate, UserController.getProfile);
router.get('/:id', authenticate, authorize(Role.ADMIN, Role.TEACHER), UserController.getUserById);
router.patch('/:id', authenticate, authorize(Role.ADMIN), validate(updateUserSchema), UserController.updateUser);
router.patch('/me/password', authenticate, validate(changePasswordSchema), UserController.changePassword);
router.delete('/:id', authenticate, authorize(Role.ADMIN), UserController.deactivateUser);

export default router;
