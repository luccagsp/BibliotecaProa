
import { BcryptAdapter, JwtAdapter, envs } from "../config";
import { prisma } from "../data/postgres";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../domain";
import { EmailService } from "./email.service";



export class AuthService {
  
  //DI  
  constructor(
    //DI . EmailService
    private readonly emailService: EmailService
  ){}

  public async registerUser(dto: RegisterUserDto) {
    const {name, email, password} = dto
    
    const existUser = await prisma.user.findUnique({
      where: {email},
    })
    if(existUser) throw CustomError.badRequest('Email already exists')
    
    try {
      
      //todo: Encriptar contraseña
      const cryptedPassword = BcryptAdapter.hash(dto.password)

      const user = await prisma.user.create({
        data:{
          email,
          name,
          password:cryptedPassword,
          emailValidated:false
        }
      })
      //todo: JWT <--- Para mantener la identificacion de que usuario es
      const token = await JwtAdapter.generateToken({id: user.id})
      if(!token) throw CustomError.internalServer('Error to generate token')
      
      //todo: Email de confirmacion
      // this.sendEmailWithValidationLink(user.email)
      //const userEntity = UserEntity.fromObject(user)
      const {password, ...rest} = UserEntity.fromObject(user) // No devuelve __v ni _id
      return {
        userInfo: rest,
        token: token
      }
    } catch (error) {
      throw CustomError.internalServer(`${ error }`)
    }
  }

  public async loginUser(loginUserDto: LoginUserDto ) {
    const user = await prisma.user.findUnique({
      where: {email:loginUserDto.email},
    })
    console.log(user)
    if(!user) throw CustomError.badRequest('Cuenta no encontrada')
  
    const isMatch = BcryptAdapter.compare(loginUserDto.password, user.password) 
    if(!isMatch) throw CustomError.badRequest('Contraseña incorrecta')

    const {password, ...rest } = UserEntity.fromObject(user)

    const token = await JwtAdapter.generateToken({id: user.id})
    if(!token) throw CustomError.internalServer('Error to generate token')

    return {
      user: rest,
      token: token,
    }

  }

  private async sendEmailWithValidationLink( email:string ) {
    const token = await JwtAdapter.generateToken({email})
    if(!token) throw CustomError.internalServer('error getting token')

    const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${token}`
    const html = `
      <h1>Validate your email!</h1>
      <p>Click on the following link to validate your mail</p>
      <a href="${ link }">Validate now: ${email}</a>
    `
    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    }

    const isSent = this.emailService.sendEmail(options)
    if(!isSent) throw CustomError.internalServer("Error sending email")

    return true
  }

  public async validateEmail(token: string) {
    const payload = await JwtAdapter.validateToken(token)
    if(!payload) throw CustomError.unauthorized('invalid token')

    const {email} = payload as {email: string}
    if(!email) throw CustomError.internalServer("email not in token")

    // const user = await prisma.user.findUnique({
    //   where: {email},
    // })
    // if(!user) throw CustomError.internalServer('Email not exists')

    const updateUser = await prisma.user.update({
      where: {email},
      data: {
        emailValidated: true,
      },
    })
    // user.emailValideted = true
    // await user.save() // Obligatorio despues de un cambio en la bdd

    return true
  }
}