import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { cacheGet, cacheSet, cacheDelete } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const mediaType = searchParams.get("mediaType");
    const requestType = searchParams.get("requestType");
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    // Build cache key with filters
    const cacheKey = `admin:requests:${page}:${limit}:${mediaType || 'all'}:${requestType || 'all'}:${sortBy || 'none'}:${sortOrder}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    await dbConnect();
    
    // Build query filters
    const query: any = {};
    if (mediaType && mediaType !== 'all') {
      query.mediaType = mediaType;
    }
    if (requestType && requestType !== 'all') {
      query.type = requestType;
    }

    // Build sort options
    let sortOptions: any = { createdAt: -1 };
    if (sortBy === 'counter') {
      sortOptions = { counter: sortOrder === 'asc' ? 1 : -1 };
    }

    const [requests, total] = await Promise.all([
      Request.find(query)
        .sort(sortOptions)
        .skip(skip)
        .populate("userId", "name email"),
      Request.countDocuments(query)
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

    // Clear cache
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