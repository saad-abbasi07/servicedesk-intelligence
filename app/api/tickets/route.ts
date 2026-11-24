
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Ticket from "@/models/Ticket";
import Customer from "@/models/Customer";
import { getCurrentUser } from "@/lib/auth";

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

    const tickets = await Ticket.find({
      userId: user.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("GET tickets error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const requiredFields = [
      "subject",
      "description",
      "customerName",
      "customerEmail",
      "category",
    ];

    for (const field of requiredFields) {
      if (
        typeof body[field] !== "string" ||
        !body[field].trim()
      ) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const normalizedEmail = body.customerEmail.trim().toLowerCase();

    const ticket = await Ticket.create({
      userId: user.userId,
      ticketId: `TKT-${Date.now()}`,
      subject: body.subject.trim(),
      description: body.description.trim(),
      customerName: body.customerName.trim(),
      customerEmail: normalizedEmail,
      category: body.category.trim(),
      priority: body.priority || "Medium",
      status: "Open",
      assignedTo: body.assignedTo || "Unassigned",
    });

    const totalTickets = await Ticket.countDocuments({
      userId: user.userId,
      customerEmail: normalizedEmail,
    });

    await Customer.updateOne(
      {
        userId: user.userId,
        email: normalizedEmail,
      },
      { $set: { totalTickets } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Ticket created successfully",
        data: ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST ticket error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
