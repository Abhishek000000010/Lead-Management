import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  name: string;
  phone: string;
  city: string;
  serviceId: number;
  description?: string;
  createdAt: Date;
}

const LeadSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  serviceId: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

LeadSchema.index({ phone: 1, serviceId: 1 }, { unique: true });

export default mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
