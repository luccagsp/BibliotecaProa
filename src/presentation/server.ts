import express, { Router } from 'express';
import path from 'path';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import cookieParser from 'cookie-parser';
import cors from 'cors';

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}


export class Server {

  private app = express();
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;
  }

  
  
  async start() {
    

    //* Middlewares
    this.app.use( express.json() ); // raw
    this.app.use( express.urlencoded({ extended: true }) ); // x-www-form-urlencoded
    this.app.use(cors({ origin: 'http://localhost:4321', credentials: true }));
    this.app.use(cookieParser())
    console.log(path.join(__dirname, '../../uploads'))
    console.log(__dirname)
    this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));


    //* Public Folder
    this.app.use( express.static( this.publicPath ) );


    //* Routes
    this.app.use( this.routes );


    //* SPA
    this.app.get('*', (req, res) => {
      const indexPath = path.join( __dirname + `../../../${ this.publicPath }/index.html` );
      res.sendFile(indexPath);
    });
    

    this.app.listen(this.port, () => {
      console.log(`Server running on port ${ this.port }`);
    });

  }

}