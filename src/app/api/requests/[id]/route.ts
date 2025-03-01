import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import User from "@/models/User";
import { sendWhatsAppNotification } from "@/lib/twilio";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const request = await Request.findOne({
      _id: params.id,
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if user is admin or the owner of the request
    const isAdmin = session.user.role === "admin";
    const isOwner = session.user.id === request.userId.toString();
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(request);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    // Get the current request to check for status changes
    const currentRequest = await Request.findById(params.id);
    if (!currentRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if user is admin or the owner of the request
    const isAdmin = session.user.role === "admin";
    const isOwner = session.user.id === currentRequest.userId.toString();
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const request = await Request.findOneAndUpdate(
      { _id: params.id },
      body,
      { new: true }
    );

    // Send WhatsApp notification if status changed and notifications are enabled
    if (body.status && body.status !== currentRequest.status && currentRequest.notifyWhatsapp) {
      try {
        // Get WhatsApp number
        if (currentRequest.whatsapp) {
          const statusMessages = {
            pending: "Sua solicitação está pendente de análise.",
            in_progress: "Sua solicitação está em análise pela nossa equipe.",
            completed: "Sua solicitação foi concluída com sucesso!",
            rejected: "Sua solicitação foi rejeitada."
          };
          
          const message = `*Atualização de Solicitação*\n\nOlá!\n\nSua solicitação para "${currentRequest.mediaTitle}" teve o status atualizado para: *${statusMessages[body.status] || body.status}*\n\nAcesse a plataforma para mais detalhes.`;
          
          await sendWhatsAppNotification(currentRequest.whatsapp, message);
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const request = await Request.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!request) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}