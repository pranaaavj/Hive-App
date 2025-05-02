export interface RegisterFormData {
    username: string,
    email: string,
    password: string
}

export interface LoginFormData {
    identifier: string,
    password: string
}

export interface ResetPasswordFormData {
    password: string;
    confirmPassword: string;
  }