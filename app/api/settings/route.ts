
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Settings from "@/models/Settings";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);

    const settings = await Settings.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          name: user.name,
          email: user.email,
          language: "English",
          notifications: {
            email: true,
            tickets: true,
            updates: false,
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("GET settings error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { name, email, language, notifications } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Name and email are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!["English", "Urdu"].includes(language)) {
      return NextResponse.json(
        { success: false, message: "Invalid language" },
        { status: 400 }
      );
    }

    if (
      !notifications ||
      typeof notifications.email !== "boolean" ||
      typeof notifications.tickets !== "boolean" ||
      typeof notifications.updates !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid notification preferences" },
        { status: 400 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);

    const settings = await Settings.findOneAndUpdate(
      { userId },
      {
        $set: {
          name: name.trim(),
          email: normalizedEmail,
          language,
          notifications: {
            email: notifications.email,
            tickets: notifications.tickets,
            updates: notifications.updates,
          },
        },
        $setOnInsert: { userId },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });
  } catch (error) {
    console.error("PUT settings error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save settings" },
      { status: 500 }
    );
  }
}
