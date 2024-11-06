
export class PaginationDto {

  private constructor(
    public readonly page: number,
  ) {}

  static create(page: number = 1): [string?, PaginationDto?] {
    if(isNaN(page)) return ["Page must be numbers"]

    if(page <= 0) return ["Page must be a greater than 0"]
  
    return [undefined, new PaginationDto(page)] 
  }
}