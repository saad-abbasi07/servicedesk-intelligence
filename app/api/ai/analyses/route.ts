
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import AIAnalysis from "@/models/AIAnalysis";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(user.userId);

    const analyses = await AIAnalysis.find({ userId })
      .populate({
        path: "ticket",
        match: { userId },
        select:
          "ticketId subject description customerName customerEmail category priority status createdAt",
      })
      .sort({ createdAt: -1 })
      .lean();

    const validAnalyses = analyses.filter(
      (analysis) => analysis.ticket !== null
    );

    return NextResponse.json({
      success: true,
      count: validAnalyses.length,
      data: validAnalyses,
    });
  } catch (error) {
    console.error("Fetch AI Analyses Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch AI analyses.",
      },
      { status: 500 }
    );
  }
}
