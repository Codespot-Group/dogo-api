/* eslint-disable prettier/prettier */
import { Router } from 'express';
require('dotenv/config');
const asyncHandler = require('express-async-handler');

import ImageController from './app/controllers/ImageController';

const routes = new Router();

// Image
routes.get('/image/:image_id', asyncHandler(ImageController.show));

export default routes;
