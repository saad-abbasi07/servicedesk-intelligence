
import mongoose, { Schema, Model } from "mongoose";

export interface ISettings {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  language: string;
  notifications: {
    email: boolean;
    tickets: boolean;
    updates: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Admin User",
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    language: {
      type: String,
      enum: ["English", "Urdu"],
      default: "English",
    },
    notifications: {
      email: { type: Boolean, default: true },
      tickets: { type: Boolean, default: true },
      updates: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
