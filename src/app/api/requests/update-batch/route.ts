import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import User from "@/models/User";
import { sendWhatsAppNotification } from "@/lib/twilio";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role === "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mediaId, mediaType, type, status, rejectionReason } = body;
    
    if (!mediaId || !mediaType || !type || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    
    // Find all requests with the same media ID, type, and media type
    const requests = await Request.find({
      mediaId,
      mediaType,
      type
    });
    
    if (!requests || requests.length === 0) {
      return NextResponse.json({ error: "No matching requests found" }, { status: 404 });
    }
    
    // Update all matching requests
    const updateData: any = { status };
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    
    const updateResult = await Request.updateMany(
      { mediaId, mediaType, type },
      updateData
    );
    
    // Send notifications for each request if status changed
    for (const request of requests) {
      if (status !== request.status && request.notifyWhatsapp) {
        try {
          // Get user's WhatsApp number
          const user = await User.findById(request.userId);
          if (user && user.whatsapp) {
            const statusMessages = {
              pending: "Sua solicitação está pendente de análise.",
              in_progress: "Sua solicitação está em análise pela nossa equipe.",
              completed: "Sua solicitação foi concluída com sucesso!",
              rejected: `Sua solicitação foi rejeitada. ${rejectionReason ? `Motivo: ${rejectionReason}` : "Entre em contato para mais informações."}`
            };
            
            const message = `*Atualização de Solicitação*\n\nOlá ${user.name},\n\nSua solicitação para "${request.mediaTitle}" teve o status atualizado para: *${statusMessages[status] || status}*\n\nAcesse a plataforma para mais detalhes.`;
            
            await sendWhatsAppNotification(user.whatsapp, message);
          }
        } catch (notificationError) {
          console.error("Error sending notification:", notificationError);
          // Don't fail the request if notification fails
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: updateResult.modifiedCount,
      message: `Updated ${updateResult.modifiedCount} requests`
    });
  } catch (error) {
    console.error("Error updating batch requests:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}