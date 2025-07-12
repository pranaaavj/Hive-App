import { Schema, model, Document, Types } from 'mongoose';
import { comparePassword, hashPassword } from '../../utils/hash';

export interface IAdminModel extends Document {
  adminName: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  resetPasswordToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdminModel>(
  {
    adminName: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
  },
  { timestamps: true },
);

adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await comparePassword(candidatePassword, this.password);
};

export const AdminModel = model<IAdminModel>('Admin', adminSchema);
