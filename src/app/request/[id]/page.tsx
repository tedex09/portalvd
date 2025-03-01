import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Request from "@/models/Request";
import { RequestDetails } from "@/components/pages/request-details";

export default async function RequestPage({ params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const request = await Request.findById(params.id);
    
    if (!request) {
      notFound();
    }

    const session = await auth();
    const isOwner = session?.user?.id === request.userId.toString();
    const isAdmin = session?.user?.role === "admin";

    return <RequestDetails request={request} isOwner={isOwner} isAdmin={isAdmin} />;
  } catch (error) {
    notFound();
  }
}