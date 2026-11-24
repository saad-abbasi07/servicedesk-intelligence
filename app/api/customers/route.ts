
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Ticket from "@/models/Ticket";
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

    const [customers, ticketCounts] = await Promise.all([
      Customer.find({ userId: user.userId })
        .sort({ createdAt: -1 })
        .lean(),

      Ticket.aggregate([
        { $match: { userId: new (await import("mongoose")).default.Types.ObjectId(user.userId) } },
        {
          $group: {
            _id: { $toLower: "$customerEmail" },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = new Map<string, number>(
      ticketCounts.map((item) => [item._id, item.total])
    );

    const data = customers.map((customer) => ({
      ...customer,
      totalTickets: counts.get(customer.email.toLowerCase()) || 0,
    }));

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("GET customers error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch customers" },
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
    const { name, email, phone, company } = body;

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

    await connectDB();

    const existingCustomer = await Customer.findOne({
      userId: user.userId,
      email: normalizedEmail,
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "Customer email already exists" },
        { status: 409 }
      );
    }

    const totalTickets = await Ticket.countDocuments({
      userId: user.userId,
      customerEmail: normalizedEmail,
    });

    const customer = await Customer.create({
      userId: user.userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: typeof phone === "string" ? phone.trim() : "",
      company: typeof company === "string" ? company.trim() : "",
      totalTickets,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        data: customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST customer error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create customer" },
      { status: 500 }
    );
  }
}