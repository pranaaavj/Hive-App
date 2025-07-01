export interface IAdmin {
  id?: string; 
  adminName: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Admin {
  constructor(
    public id: string | undefined,
    public adminName: string,
    public email: string,
    public password: string,
    public role: string = 'admin',
    public isVerified: boolean = false,
    public resetPasswordToken: string | undefined,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!adminName || !email || !password) {
      throw new Error('Admin name, email, and password are required');
    }
  }

  static create(data: Partial<IAdmin>): Admin {
    return new Admin(
      data.id,
      data.adminName ?? '', // Provide fallback to avoid undefined
      data.email ?? '',
      data.password ?? '',
      data.role ?? 'admin',
      data.isVerified ?? false,
      data.resetPasswordToken,
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }
}