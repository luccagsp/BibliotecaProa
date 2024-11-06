import { Request, Response } from "express";
import { brotliDecompress } from "zlib";
import { CustomError, LoginUserDto, RegisterUserDto } from "../../domain";
import { AuthService } from "../../services/auth.service";

export class AuthController {
  //DI
  constructor(public readonly authService: AuthService) {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server error" });
  };

  registerUser = (req: Request, res: Response) => {
    const [error, registerUserDto] = RegisterUserDto.create(req.body);

    if (error) return res.status(400).json({ error });

    this.authService
      .registerUser(registerUserDto!)
      .then((user) => {
        res.cookie("auth_token", user.token, {
          httpOnly: true, // Evita el acceso desde JavaScript
          secure: process.env.NODE_ENV === "production", // Solo en HTTPS
          sameSite: "none", // Previene ataques CSRF
          maxAge: 3600000, // La cookie expira en 1 hora (igual que el token)
        });
        // res.header("Authorization", `${user.token}`);
        res.json(user);
      })
      .catch((error) => this.handleError(error, res));
  };
  logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token', {
      httpOnly: true,  // Si estaba configurado como httpOnly
      secure: true     // Si estaba configurado como secure
    });
    res.status(200).json({ message: 'Logout exitoso' });
  };
  loginUser = (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.create(req.body);
    const {secure} = req;

    if (error) return res.status(400).json({ error });
    this.authService.loginUser(loginUserDto!).then((user) => {
      res.cookie("auth_token", user.token, {
        // secure: process.env.NODE_ENV === "production", // Solo en HTTPS
        secure,
        httpOnly: true, // Evita el acceso desde JavaScript
        sameSite: secure ? 'none' : 'lax',
        maxAge: 3600000, // La cookie expira en 1 hora (igual que el token)
      });
      res.json(user)
    }).catch((err) => this.handleError(err, res));
  };
  validateEmail = (req: Request, res: Response) => {
    const { token } = req.params;

    this.authService
      .validateEmail(token)
      .then(() => res.json("email validated"))
      .catch((error) => this.handleError(error, res));
  };
  userView = (req: Request, res: Response) => {
    const user = req.body.user;  // Esto proviene del middleware
    res.json(user);  // Enviamos los datos del usuario al frontend
  }
}
