import { Router } from 'express';
import ecommerce_v1 from './index.ecommerce.js';
import bini_v1 from './index.bini.js';
import admin_v1 from './index.Admin.js';
import youtubeRouter from './youtubeRouter.js';


const v1 = Router();

v1.use('/ecommerce', ecommerce_v1);
v1.use('/bini', bini_v1);
v1.use('/admin', admin_v1);
v1.use('/youtube', youtubeRouter);

export default v1;
