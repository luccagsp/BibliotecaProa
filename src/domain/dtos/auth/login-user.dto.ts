import { regularExps } from "../../../config"


export class LoginUserDto {
  private constructor(
    public email: string,
    public password: string,
  ) {}
  
  static create(object:{[key:string]:any}):[string?, LoginUserDto?] {
    const {email, password} = object
    if(!email) return ['Missing email']
    if(!regularExps.email.test(email)) return ['Email not valid']
    if(email.split('@')[1] != 'escuelasproa.edu.ar') return ['Email must be @escuelasproa.edu.ar']
    if(!password) return ['Missing password']
    if(password.length < 6) return ['Password too short']

    return [undefined, new LoginUserDto(email, password)]
  }
}