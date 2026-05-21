import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  providerId: number;
  name: string;
  monthlyQuota: number;
  usedQuota: number;
}

const ProviderSchema: Schema = new Schema({
  providerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  monthlyQuota: { type: Number, default: 10 },
  usedQuota: { type: Number, default: 0 },
});

export default mongoose.models.Provider || mongoose.model<IProvider>("Provider", ProviderSchema);
