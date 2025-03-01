import { AdminDashboard } from "@/components/pages/admin-dashboard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  
  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }
  
  return <AdminDashboard />;
}