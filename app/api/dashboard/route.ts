
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Ticket from "@/models/Ticket";
import Customer from "@/models/Customer";

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

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      totalCustomers,
      priorityStats,
      recentTickets,
    ] = await Promise.all([
      Ticket.countDocuments({ userId }),
      Ticket.countDocuments({ userId, status: "Open" }),
      Ticket.countDocuments({ userId, status: "In Progress" }),
      Ticket.countDocuments({ userId, status: "Resolved" }),
      Ticket.countDocuments({ userId, status: "Closed" }),
      Customer.countDocuments({ userId }),
      Ticket.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),
      Ticket.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const resolutionRate =
      totalTickets > 0
        ? Number(
            (
              ((resolvedTickets + closedTickets) / totalTickets) *
              100
            ).toFixed(1)
          )
        : 0;

    const priorities = {
      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0,
    };

    for (const item of priorityStats) {
      if (item._id in priorities) {
        priorities[item._id as keyof typeof priorities] = item.count;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          totalCustomers,
          resolutionRate,
        },
        priorityDistribution: priorities,
        recentTickets,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}
