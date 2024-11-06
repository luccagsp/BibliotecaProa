import { Request, Response } from 'express';
import { prisma } from '../../data/postgres';
import { CreateBookDto, UpdateTodoDto, PaginationDto, CustomError } from '../../domain';
import { JwtAdapter } from '../../config';
import { disconnect } from 'process';
const path = require('path');

export class BooksController {

  //* DI
  constructor() { }


  public getBooks = async( req: Request, res: Response ) => {
    const limit = 10
    const {page = 1} = req.query
    const [error, pageDto] = PaginationDto.create(+page)
    if(error) return res.status(400).json(error)
    if(pageDto == undefined) return res.status(400).json(error)
    
    const todos = await prisma.book.findMany({
      skip:((pageDto?.page-1)*limit),
      take:limit,
    });
    return res.json( todos );
  };

  public getBookById = async( req: Request, res: Response ) => {
    const id = +req.params.id;
    if ( isNaN( id ) ) return res.status( 400 ).json( { error: 'ID argument is not a number' } );

    const todo = await prisma.book.findFirst({
      where: { id }
    });
    
    ( todo )
      ? res.json( todo )
      : res.status( 404 ).json( { error: `BOOK with id ${ id } not found` } );
  };
  public getActualBook = async( req: Request, res: Response ) => {
    const id = +req.params.id;
    const user = req.body.user
    const userId = user.id
    console.log({user})


    const todo = await prisma.book.findFirst({
      where: { userId:userId }
    });
    
    ( todo )
      ? res.json( todo )
      : res.status( 404 ).json( { error: `BOOK with id ${ id } not found` } );
  };
  public createBook = async( req: Request, res: Response ) => {
    const [error, createBookDto] = CreateBookDto.create(req.body);
    if (error) return res.status(400).json({ error });
  
    if (!req.file) {
      console.log("Se ha subido book sin cover");
      return res.status(400).json({ error: "Cover image is required" });
    }
  
    const coverImagePath = req.file.path; // Ruta del archivo almacenado
  
    // Define la URL base para acceder a las imágenes
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
  
    // Crear la URL completa de la imagen
    const coverImageUrl = baseUrl + path.basename(coverImagePath);
  
    console.log("Imagen subida!");
  
    // Crear el libro con la URL de la imagen
    const todo = await prisma.book.create({
      data: {
        ...createBookDto!,
        coverImage: coverImageUrl, // Agregar la URL de la imagen al DTO
      },
    });
  
    res.json(todo);
  };
  

  public updateTodo = async( req: Request, res: Response ) => {
    const id = +req.params.id;
    const [error, updateTodoDto] = UpdateTodoDto.create({...req.body, id});
    if ( error ) return res.status(400).json({ error });
    
    const todo = await prisma.book.findFirst({
      where: { id }
    });

    if ( !todo ) return res.status( 404 ).json( { error: `Todo with id ${ id } not found` } );

    const updatedTodo = await prisma.book.update({
      where: { id },
      data: updateTodoDto!.values
    });
  
    res.json( updatedTodo );

  }


  public deleteBook = async(req:Request, res: Response) => {
    const id = +req.params.id;

    try {
      const deleted = await prisma.book.delete({
        where: { id }
      });
      res.json( deleted )
    } catch (error) {
      res.status(400).json({ error: `Book with id ${ id } not found` });
    
    }
  }

  public deleteReserve = async(req:Request, res: Response) => {
    const userToken = req.cookies['auth_token']
    const payload = await JwtAdapter.validateToken<{id: string}>(userToken)
    if (payload?.id === undefined) throw CustomError.badRequest("asdsa")
    const userId = +payload?.id
    const bookId = +req.params.bookId;
  
    try {
      const bookUpdated = await prisma.book.update({
        where: {
          id: bookId
        },
        data: {
          user: {
            disconnect: true // Desvincula el usuario del libro
          }
        }
      });
    
      const userUpdated = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          book: {
            disconnect: true // Desvincula el libro del usuario
          }
        }
      });

    res.json( {bookUpdated, userUpdated} )
    } catch (error) {
      res.status(400).json({ error: `User already has a book allocated` });
    
    }
  }
  public reserveBook = async(req:Request, res: Response) => {
    const userToken = req.cookies['auth_token']
    const payload = await JwtAdapter.validateToken<{id: string}>(userToken)
    if (payload?.id === undefined) throw CustomError.badRequest("asdsa")
    const userId = +payload?.id
    const bookId = +req.params.bookId;
  
    try {
    const bookUpdated = await prisma.book.update({
      where: {
        id:bookId
      },
      data: {
        userId:userId
      }
    })
    const userUpdated = await prisma.user.update({
      where: {
        id:userId
      },
      data: {
        bookId: bookId
      }
    })

    res.json( {bookUpdated, userUpdated} )
    } catch (error) {
      res.status(400).json({ error: `User already has a book allocated` });
    
    }
  }


  


}