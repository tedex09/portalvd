import { AdminSettings } from "@/components/pages/admin-settings";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }
  
  return <AdminSettings />;
}