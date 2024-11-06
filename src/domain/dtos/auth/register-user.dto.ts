import { regularExps } from "../../../config"


export class RegisterUserDto {
  private constructor(
    public name: string,
    public email: string,
    public password: string,
  ) {}
  
  static create(object:{[key:string]:any}):[string?, RegisterUserDto?] {
    const {name, email, password} = object
    if(!name) return ['Missing name']
    if(!email) return ['Missing email']
    if(!regularExps.email.test(email)) return ['Email not valid']
    if(email.split('@')[1] != 'escuelasproa.edu.ar') return ['Email must be @escuelasproa.edu.ar']

    if(!password) return ['Missing password']
    if(password.length < 6) return ['Password too short']

    return [undefined, new RegisterUserDto(name, email, password)]
  }
}