// utils/hash.ts
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (input: string, stored: string) => {
  return await bcrypt.compare(input, stored);
};
