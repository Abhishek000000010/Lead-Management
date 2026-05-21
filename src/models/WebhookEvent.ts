import mongoose, { Schema, Document } from "mongoose";

export interface IWebhookEvent extends Document {
  eventKey: string;
  type: string;
  processedAt: Date;
}

const WebhookEventSchema: Schema = new Schema({
  eventKey: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  processedAt: { type: Date, default: Date.now },
});

export default mongoose.models.WebhookEvent || mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
