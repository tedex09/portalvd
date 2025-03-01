"use server";

import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import dbConnect from "./db";
import Request from "@/models/Request";

export async function createRequest(data: {
  type: string;
  mediaId: number;
  mediaType: string;
  description: string;
  notifyWhatsapp: boolean;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  
  const request = await Request.create({
    ...data,
    userId: session.user.id,
  });

  revalidatePath("/dashboard");
  return request;
}

export async function updateRequestStatus(requestId: string, status: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await dbConnect();
  
  const request = await Request.findOneAndUpdate(
    { _id: requestId },
    { status },
    { new: true }
  );

  if (!request) {
    throw new Error("Request not found");
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return request;
}