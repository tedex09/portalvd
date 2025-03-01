import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Try to get from cache
    const cacheKey = `admin:requests:${page}:${limit}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    
    const [requests, total] = await Promise.all([
      Request.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      Request.countDocuments()
    ]);

    const result = {
      items: requests,
      total,
      hasMore: skip + limit < total
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Delete all requests in batches
    const batchSize = 1000;
    let deleted = 0;
    
    while (true) {
      const batch = await Request.find().limit(batchSize);
      if (batch.length === 0) break;
      
      await Request.deleteMany({
        _id: { $in: batch.map(doc => doc._id) }
      });
      
      deleted += batch.length;
    }

    // Clear all request-related cache
    await cacheDelete('admin:requests:*');

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}