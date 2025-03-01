import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import User from "@/models/User";
import { sendWhatsAppNotification } from "@/lib/twilio";

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

    await dbConnect();
    
    const [requests, total] = await Promise.all([
      Request.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email"),
      Request.countDocuments()
    ]);

    return NextResponse.json({
      items: requests,
      total,
      hasMore: skip + limit < total
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Get the current request to check for status changes
    const currentRequest = await Request.findById(body.id);
    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const request = await Request.findByIdAndUpdate(
      body.id,
      { status: body.status },
      { new: true }
    );

    // Send WhatsApp notification if status changed and notifications are enabled
    if (body.status && body.status !== currentRequest.status && currentRequest.notifyWhatsapp) {
      try {
        // Get user's WhatsApp number
        const user = await User.findById(currentRequest.userId);
        if (user && user.whatsapp) {
          const statusMessages = {
            pending: "Sua solicitação está pendente de análise.",
            in_progress: "Sua solicitação está em análise pela nossa equipe.",
            completed: "Sua solicitação foi concluída com sucesso!",
            rejected: "Sua solicitação foi rejeitada. Entre em contato para mais informações."
          };
          
          const message = `*Atualização de Solicitação*\n\nOlá ${user.name},\n\nSua solicitação para "${currentRequest.mediaTitle}" teve o status atualizado para: *${statusMessages[body.status] || body.status}*\n\nAcesse a plataforma para mais detalhes.`;
          
          await sendWhatsAppNotification(user.whatsapp, message);
        }
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}