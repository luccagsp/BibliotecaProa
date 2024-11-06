import { Router } from 'express';
import { BooksController } from './controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import multer from 'multer'; // Asegúrate de importar multer
import path from 'path';

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export class TodoRoutes {
  static get routes(): Router {
    const router = Router();
    const booksController = new BooksController();

    router.get('/', booksController.getBooks);
    router.get('/actual', AuthMiddleware.validateJWT, booksController.getActualBook);
    router.put('/deleteReserve/:bookId', [AuthMiddleware.validateJWT], booksController.deleteReserve);
    router.get('/:id', booksController.getBookById);
    router.put('/reserve/:bookId', [AuthMiddleware.validateJWT], booksController.reserveBook);
    
    // admin 
    router.post('/', upload.single('coverImage'), booksController.createBook); // Asegúrate de que 'coverImage' coincida con el nombre del campo en el formulario
    router.put('/:id', [AuthMiddleware.userAdmin], booksController.updateTodo);
    router.delete('/:id', [AuthMiddleware.userAdmin], booksController.deleteBook);
    
    return router;
  }
}
