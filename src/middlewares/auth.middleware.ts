import { NextFunction, Request, Response } from "express";
import { CustomError, UserEntity } from "../domain";
import { JwtAdapter } from "../config";
import { prisma } from "../data/postgres";




export class AuthMiddleware {
  
  constructor(){}

  static async validateJWT(req: Request, res: Response, next: NextFunction) {
    // const authorization = req.header("Authorization")
    const {auth_token} = req.cookies
    
    if(!auth_token) return res.status(401).json({error:"auth token not found (possibly unlogged)"})


    try {
      const payload = await JwtAdapter.validateToken<{id: string}>(auth_token)
      if(!payload) return res.status(401).json({error: "invalid token"})
      
      const user = await prisma.user.findUnique({
        where:{
          id:+payload.id
        }
      })
      if(!user) return res.status(401).json({error: "user not found"})

      //todo: validar si el usuario esta activo
      // console.log(UserEntity.fromObject(user))
      req.body.user = UserEntity.fromObject(user)
      next();
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "internal server error"})
    }
    
  }
  static async userAdmin(req: Request, res: Response, next: NextFunction) {
    // const authorization = req.header("Authorization")
    const {auth_token} = req.cookies
    if(!auth_token) return res.status(401).json({error:"auth token not found (possibly unlogged)"})

    try {
      const payload = await JwtAdapter.validateToken<{id: string}>(auth_token)
      if(!payload) return res.status(401).json({error: "invalid token"})
      
      const user = await prisma.user.findUnique({
        where:{
          id:+payload.id
        }
      })
      if(!user) return res.status(401).json({error: "user not found"})
      console.log(user.role)
      if(user.role !== "ADMIN") return res.status(401).json({error:"unauthorized"})
      
      //todo: validar si el usuario esta activo
      req.body.user = UserEntity.fromObject(user)
      next();
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "internal server error"})
    }
    
  }

}