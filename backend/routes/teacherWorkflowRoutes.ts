import { Router } from 'express';
import { TeacherWorkflowController } from '../controllers/teacherWorkflowController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { submitContextSchema, updateTopicStatusSchema } from '../schemas/teacherWorkflow.schema.js';
import { Role } from '../constants/roles.js';

const router = Router();

router.get('/current', authenticate, authorize(Role.TEACHER, Role.ADMIN), TeacherWorkflowController.getCurrentWorkflow);
router.post('/', authenticate, authorize(Role.TEACHER, Role.ADMIN), validate(submitContextSchema), TeacherWorkflowController.submitContext);
router.patch(
  '/topics/:topicId',
  authenticate,
  authorize(Role.TEACHER, Role.ADMIN),
  validate(updateTopicStatusSchema),
  TeacherWorkflowController.updateTopicStatus
);

export default router;
