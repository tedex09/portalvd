import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const mediaId = searchParams.get("mediaId");
    const mediaType = searchParams.get("mediaType");
    const type = searchParams.get("type");

    if (!mediaId || !mediaType || !type) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Find all requests with the same media ID, type, and media type
    const requests = await Request.find({
      mediaId,
      mediaType,
      type
    }).populate("userId", "name email provider username");

    // Map the requests to include user information
    const users = await Promise.all(
      requests.map(async (request) => {
        const user = await User.findById(request.userId);
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          provider: user.provider || null,
          username: user.username || null,
          status: request.status,
          requestId: request._id,
          createdAt: request.createdAt
        };
      })
    );

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching request users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}