import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  serviceId: number;
  name: string;
}

const ServiceSchema: Schema = new Schema({
  serviceId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
