import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { subDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Find requests that are:
    // 1. Still pending
    // 2. Created more than 1 day ago
    // 3. Have a counter less than 4
    const oneDayAgo = subDays(new Date(), 1);
    
    const result = await Request.updateMany(
      { 
        status: "pending", 
        createdAt: { $lt: oneDayAgo },
        counter: { $lt: 4 }
      },
      { 
        status: "rejected",
        rejectionReason: "Baixa demanda"
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