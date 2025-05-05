// domain/entities/user.entity.ts
export interface IUserDTO {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
  }
  
  export interface IRegisterUserDTO {
    username: string;
    email: string;
    password: string;
  }
  
  export interface ILoginUserDTO {
    identifier: string;
    password: string;
  }

  