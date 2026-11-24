
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import Ticket from "@/models/Ticket";

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
    const filter = { userId };

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 5,
      1
    );

    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      priorityStats,
      statusStats,
      monthlyStats,
      categoryStats,
    ] = await Promise.all([
      Ticket.countDocuments(filter),

      Ticket.countDocuments({ ...filter, status: "Open" }),

      Ticket.countDocuments({ ...filter, status: "In Progress" }),

      Ticket.countDocuments({ ...filter, status: "Resolved" }),

      Ticket.countDocuments({ ...filter, status: "Closed" }),

      Ticket.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
          },
        },
      ]),

      Ticket.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Ticket.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      Ticket.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const monthlyTickets = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - 5 + index,
          1
        );

        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const existing = monthlyStats.find(
          (item) =>
            item._id.year === year &&
            item._id.month === month
        );

        return {
          month: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          tickets: existing?.count || 0,
        };
      }
    );

    const priorities = ["Low", "Medium", "High", "Urgent"];
    const statuses = ["Open", "In Progress", "Resolved", "Closed"];

    const priorityDistribution = priorities.map((priority) => ({
      name: priority,
      value:
        priorityStats.find((item) => item._id === priority)?.count || 0,
    }));

    const statusDistribution = statuses.map((status) => ({
      name: status,
      value:
        statusStats.find((item) => item._id === status)?.count || 0,
    }));

    const resolvedCount = resolvedTickets + closedTickets;

    const resolutionRate =
      totalTickets > 0
        ? Number(((resolvedCount / totalTickets) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          resolutionRate,
        },
        priorityDistribution,
        statusDistribution,
        monthlyTickets,
        categoryDistribution: categoryStats.map((item) => ({
          name: item._id || "Other",
          value: item.count,
        })),
      },
    });
  } catch (error) {
    console.error("Analytics API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics data",
      },
      { status: 500 }
    );
  }
}
