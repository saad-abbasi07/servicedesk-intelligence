
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      "subject",
      "description",
      "category",
      "priority",
      "status",
      "assignedTo",
    ];

    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string" || !body[field].trim()) {
          return NextResponse.json(
            { success: false, message: `Invalid ${field}` },
            { status: 400 }
          );
        }

        updates[field] = body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided" },
        { status: 400 }
      );
    }

    if (
      updates.priority &&
      !["Low", "Medium", "High", "Urgent"].includes(updates.priority)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid priority" },
        { status: 400 }
      );
    }

    if (
      updates.status &&
      !["Open", "In Progress", "Resolved", "Closed"].includes(updates.status)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    await connectDB();

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("PATCH ticket error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const ticket = await Ticket.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ticket error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}