import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import Settings from "@/models/Settings";
import { auth } from "@/lib/auth";
import { startOfDay, startOfWeek } from "date-fns";

export async function checkRequestLimits() {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    await dbConnect();

    // Get current settings
    const settings = await Settings.findOne();
    if (!settings) {
      throw new Error("Settings not found");
    }

    const { requestLimitPerDay, requestLimitPerWeek } = settings;

    // Get start of current day and week
    const today = startOfDay(new Date());
    const weekStart = startOfWeek(new Date());

    // Count requests for today
    const dailyRequests = await Request.countDocuments({
      userId: session.user.id,
      createdAt: { $gte: today }
    });

    if (dailyRequests >= requestLimitPerDay) {
      throw new Error(`Limite diário de ${requestLimitPerDay} solicitações atingido`);
    }

    // Count requests for this week
    const weeklyRequests = await Request.countDocuments({
      userId: session.user.id,
      createdAt: { $gte: weekStart }
    });

    if (weeklyRequests >= requestLimitPerWeek) {
      throw new Error(`Limite semanal de ${requestLimitPerWeek} solicitações atingido`);
    }

    return true;
  } catch (error) {
    throw error;
  }
}