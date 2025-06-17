import { Schema, model, Document, Types } from 'mongoose';
import { comparePassword, hashPassword } from '../../utils/hash';

export interface IUserModel extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  resetPasswordToken?: string,
  profilePicture?: string,
  bio?: string,
  postsCount: number;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  isOnline: boolean,
  lastActive?: Date
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserModel>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true, },
    role: { type: String, default: 'user' },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    isDeleted: { type: Boolean, default: false },
    profilePicture: {type: String, default: ""},
    bio: {type: String, default: ""},
    postsCount: {type: Number, default: 0},
    followers: [{type: Schema.Types.ObjectId, ref: "User", default: []}],
    following: [{type: Schema.Types.ObjectId, ref: "User", default: []}],
    isOnline: {type: Boolean, default: false},
    lastActive:{type: Date}
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await comparePassword(candidatePassword, this.password);
};

export const UserModel = model<IUserModel>('User', userSchema);
