import { Router } from 'express';
import { AuthController } from './controller';
import { AuthService, EmailService } from '../../services';
import { envs } from '../../config';
import { AuthMiddleware } from '../../middlewares/auth.middleware';




export class AuthRoutes {


  static get routes(): Router {

    const router = Router();
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL
    )
    const authService = new AuthService(emailService)

    const controller = new AuthController(authService);
    // Definir las rutas
    router.post('/login', controller.loginUser );
    router.post('/register', controller.registerUser );
    router.post('/logout', controller.logout );

    router.get('/validate-email/:token', controller.validateEmail );

    router.get('/user-profile', [AuthMiddleware.validateJWT], controller.userView);

    return router;
  }


}

