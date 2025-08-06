import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cacheDelete } from "@/lib/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Clear all request-related cache
    await cacheDelete('admin:requests:*');

    return NextResponse.json({ 
      success: true, 
      message: "Cache cleared successfully" 
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}