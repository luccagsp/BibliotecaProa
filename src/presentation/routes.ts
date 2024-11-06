import { Router } from 'express';

import { TodoRoutes } from './books/routes';
import { AuthRoutes } from './auth/routes';
import { AuthMiddleware } from '../middlewares/auth.middleware';




export class AppRoutes {


  static get routes(): Router {

    const router = Router();

    router.use('/api/books',TodoRoutes.routes );
    router.use('/api/auth', AuthRoutes.routes );
    return router;
  }


}

