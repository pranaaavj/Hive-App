// domain/entities/user.entity.ts
export interface IUserDTO {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }
  
  export interface IRegisterUserDTO {
    name: string;
    email: string;
    password: string;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    isVerified?: boolean;
  }
  
  export interface ILoginUserDTO {
    email: string;
    password: string;
  }

  