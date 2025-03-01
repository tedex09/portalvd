import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    const onlineUsers = await Session.find({ 
      isActive: true,
      lastActivity: { 
        $gte: new Date(Date.now() - 5 * 60 * 1000) // Active in last 5 minutes
      }
    }).populate('userId', 'name email');

    return NextResponse.json(onlineUsers);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}