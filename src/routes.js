/* eslint-disable prettier/prettier */
import { Router } from 'express';
require('dotenv/config');
const asyncHandler = require('express-async-handler');

import UserController from './app/controllers/UserController';
import ImageController from './app/controllers/ImageController';
import StoreController from './app/controllers/StoreController';
<<<<<<< HEAD
import ServiceTypeController from './app/controllers/ServiceTypeController';
=======
import PetTypeController from './app/controllers/PetTypeController';
import BreedController from './app/controllers/BreedController';
>>>>>>> fc3a98f8a81ea7a16467f1c88b8d2b3e9ec1b4ab
import Auth from './app/middlewares/auth';

const routes = new Router();

// Image
routes.get('/image/:image_id', asyncHandler(ImageController.show));

// User
routes.get('/user', Auth.verify, asyncHandler(UserController.find));
routes.get('/user/list', asyncHandler(UserController.index));
routes.post('/user/sign_in', asyncHandler(UserController.signIn));
routes.post('/user/login', asyncHandler(UserController.signIn));
routes.get('/user/user-types', Auth.verify, asyncHandler(UserController.userTypes));
routes.post('/user', asyncHandler(UserController.store));
routes.get('/user/:user_id', asyncHandler(UserController.find));
routes.put('/user/:user_id', asyncHandler(UserController.update));
routes.delete('/user/bulk', Auth.verify, asyncHandler(UserController.bulkDestroy));
routes.delete('/user/:user_id', Auth.verify, asyncHandler(UserController.destroy));


// Store
routes.get('/store', asyncHandler(StoreController.index));
routes.post('/store', asyncHandler(StoreController.store));
routes.get('/store/:store_id', asyncHandler(StoreController.find));
// routes.put('/faq/:faq_id', Auth.verify, asyncHandler(FaqController.update));
// routes.delete('/faq/bulk', Auth.verify, asyncHandler(FaqController.bulkDestroy));

//Service type
routes.get('/service_type',asyncHandler(ServiceTypeController.index))
routes.post('/service_type',asyncHandler(ServiceTypeController.store))

// petType
routes.get('/pet_type', asyncHandler(PetTypeController.index));
routes.post('/pet_type', asyncHandler(PetTypeController.store));
routes.get('/pet_type/:pet_type_id', asyncHandler(PetTypeController.find));

// breed
routes.get('/breed', asyncHandler(BreedController.index));
routes.post('/breed', asyncHandler(BreedController.store));
routes.get('/breed/:breed_id', asyncHandler(BreedController.find));

export default routes;
