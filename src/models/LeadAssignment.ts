import mongoose, { Schema, Document } from "mongoose";

export interface ILeadAssignment extends Document {
  leadId: mongoose.Types.ObjectId;
  providerId: number;
  createdAt: Date;
}

const LeadAssignmentSchema: Schema = new Schema({
  leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
  providerId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

LeadAssignmentSchema.index({ leadId: 1, providerId: 1 }, { unique: true });

export default mongoose.models.LeadAssignment || mongoose.model<ILeadAssignment>("LeadAssignment", LeadAssignmentSchema);
