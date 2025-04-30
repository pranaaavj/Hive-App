// src/infrastructure/models/tempUser.model.ts
import { Schema, model, Document } from 'mongoose';

export interface ITempUserModel extends Document {
  name: string;
  email: string;
  password: string;
  verificationToken: string;
  verificationTokenExpires: Date;
  createdAt: Date;
}

const tempUserSchema = new Schema<ITempUserModel>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationToken: { type: String, required: true },
  verificationTokenExpires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ TTL index to automatically delete expired unverified users
tempUserSchema.index({ verificationTokenExpires: 1 }, { expireAfterSeconds: 0 });

const TempUser = model<ITempUserModel>('TempUser', tempUserSchema);

export default TempUser;
