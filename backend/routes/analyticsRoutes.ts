import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.get('/correlation', authenticate, AnalyticsController.getCorrelationData);
router.get('/clusters', authenticate, AnalyticsController.getClusters);
router.get('/grey-zone', authenticate, AnalyticsController.getGreyZoneStudents);
router.get('/trends', authenticate, AnalyticsController.getHistoricalTrends);

export default router;
