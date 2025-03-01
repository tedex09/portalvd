import { Register } from "@/components/pages/register";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";

export default async function RegisterPage() {
  const session = await auth();
  
  if (session) {
    redirect("/dashboard");
  }
  
  // Check if registration is enabled
  await dbConnect();
  const settings = await Settings.findOne();
  
  if (settings && !settings.registrationEnabled) {
    redirect("/login");
  }
  
  return <Register />;
}