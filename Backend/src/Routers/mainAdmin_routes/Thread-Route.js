// src/Routers/Thread-Route.js
import { Router } from 'express';
import ThreadController from '../Controllers/v1/mainAdmin_controllers/Thread-Controller.js';

const router = Router();
const threadController = new ThreadController();

// Public routes
router.get('/threads', threadController.getAllThreads.bind(threadController));
router.get('/threads/:id', threadController.getThreadById.bind(threadController));

// Admin routes
router.post('/admin/threads', threadController.createThread.bind(threadController));
router.put('/admin/threads/:id', threadController.updateThread.bind(threadController));
router.delete('/admin/threads/:id', threadController.deleteThread.bind(threadController));
router.get('/admin/sites', threadController.getSites.bind(threadController));

export default router;