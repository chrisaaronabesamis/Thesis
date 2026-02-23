import express from 'express';
import ReportController from '../Controllers/Report-Controller.js';
import authenticate from '../Middlewares/authentication.js';
import authorize from '../Middlewares/authorization.js';

const router = express.Router();
const reportCtrl = new ReportController();

// Apply authentication and authorization middleware to all routes
router.use(authenticate);
router.use(authorize);

// Report routes
router.get('/types', reportCtrl.getReportTypes.bind(reportCtrl));
router.get('/', reportCtrl.getReports.bind(reportCtrl));
router.post('/generate', reportCtrl.generateReport.bind(reportCtrl));
router.get('/:id', reportCtrl.getReportById.bind(reportCtrl));
router.get('/:id/export', reportCtrl.exportReport.bind(reportCtrl));

export default router;
