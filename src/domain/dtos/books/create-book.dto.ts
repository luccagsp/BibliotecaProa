export class CreateBookDto {
  private constructor(
    public readonly name: string,
    public readonly autor: string,
    public readonly reservationEnd: Date // Agrega reservationEnd
  ) {}

  static create(props: { [key: string]: any }): [string?, CreateBookDto?] {
    const { name, autor } = props;

    if (!name) return ['Name property is required', undefined];
    if (!autor) return ['Autor property is required', undefined];

    const today = new Date(); // Fecha de hoy
    const reservationEnd = new Date(today); // Crea una nueva fecha basada en hoy
    reservationEnd.setDate(today.getDate() + 7); // Suma 7 días

    return [undefined, new CreateBookDto(name, autor, reservationEnd)];
  }
}
