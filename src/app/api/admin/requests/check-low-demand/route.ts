import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import Settings from "@/models/Settings";
import { subHours } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Get settings
    const settings = await Settings.findOne();
    if (!settings) {
      throw new Error("Settings not found");
    }

    const { lowDemandRejectionHours, highDemandThreshold, lowDemandRejectionMessage } = settings;
    
    // Calculate the cutoff time based on settings
    const cutoffTime = subHours(new Date(), lowDemandRejectionHours);
    
    // Find requests that are:
    // 1. Still pending
    // 2. Created more than X hours ago (from settings)
    // 3. Have a counter less than Y (from settings)
    const result = await Request.updateMany(
      { 
        status: "pending", 
        createdAt: { $lt: cutoffTime },
        counter: { $lt: highDemandThreshold }
      },
      { 
        status: "rejected",
        rejectionReason: lowDemandRejectionMessage
      }
    );

    return NextResponse.json({ 
      success: true, 
      updated: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error checking low demand requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}