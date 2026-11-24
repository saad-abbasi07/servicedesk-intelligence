
import mongoose, { Schema, Model } from "mongoose";

export interface IAIAnalysis {
  userId: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  suggestedCategory: string;
  suggestedPriority: "Low" | "Medium" | "High" | "Urgent";
  sentiment: "Positive" | "Neutral" | "Negative";
  summary: string;
  reasoning: string;
  suggestedResponse: string;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AIAnalysisSchema = new Schema<IAIAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    suggestedCategory: {
      type: String,
      required: true,
    },
    suggestedPriority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      required: true,
    },
    sentiment: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    reasoning: {
      type: String,
      required: true,
    },
    suggestedResponse: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

AIAnalysisSchema.index(
  { userId: 1, ticket: 1 },
  { unique: true }
);

const AIAnalysis: Model<IAIAnalysis> =
  mongoose.models.AIAnalysis ||
  mongoose.model<IAIAnalysis>("AIAnalysis", AIAnalysisSchema);

export default AIAnalysis;