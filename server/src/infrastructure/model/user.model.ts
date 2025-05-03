// src/infrastructure/models/user.model.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUserModel extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  isVerified: boolean,
  resetPasswordToken?: string,
  role:string
}

const userSchema = new Schema<IUserModel>({
  username: { type: String, required: true,unique:true,index:true},
  email: { type: String, required: true, unique: true , index:true },
  password: { type: String, required: true },
  role: { type: String , default:'user'},
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  createdAt: { type: Date, default: Date.now }
});


const User = model<IUserModel>('User', userSchema);

export default User;
