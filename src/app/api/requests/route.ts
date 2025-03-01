import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { checkRequestLimits } from "@/middleware/requestLimits";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const requests = await Request.find({ userId: session.user.id })
      .sort({ createdAt: -1 });

    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar limites antes de criar nova solicitação
    try {
      await checkRequestLimits();
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Limite de solicitações excedido" },
        { status: 429 }
      );
    }

    const body = await req.json();
    await dbConnect();
    
    // Check if there's an existing request with the same media and type
    const existingRequest = await Request.findOne({
      mediaId: body.mediaId,
      mediaType: body.mediaType,
      type: body.type
    });

    if (existingRequest) {
      // Increment the counter of the existing request
      existingRequest.counter += 1;
      await existingRequest.save();
      
      // Create a new request with the incremented counter
      const request = await Request.create({
        ...body,
        userId: session.user.id,
        counter: existingRequest.counter
      });
      
      return NextResponse.json(request, { status: 201 });
    } else {
      // Create a new request with counter = 1
      const request = await Request.create({
        ...body,
        userId: session.user.id,
        counter: 1
      });
      
      return NextResponse.json(request, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}