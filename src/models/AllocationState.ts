import mongoose, { Schema, Document } from "mongoose";

export interface IAllocationState extends Document {
  serviceId: number;
  pointerIndex: number;
}

const AllocationStateSchema: Schema = new Schema({
  serviceId: { type: Number, required: true, unique: true },
  pointerIndex: { type: Number, default: 0 },
});

export default mongoose.models.AllocationState || mongoose.model<IAllocationState>("AllocationState", AllocationStateSchema);
