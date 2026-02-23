import { Router } from 'express';

import revenueRouter from './bini_routes/Revenue_route.js';
import Generaterouter from './mainAdmin_routes/Generate-Route.js';
const admin_v1 = Router();


admin_v1.use('/dashboard', revenueRouter); 
admin_v1.use('/generate', Generaterouter);

export default admin_v1;
