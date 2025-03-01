import { AdminUsers } from "@/components/pages/admin-users";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }
  
  return <AdminUsers />;
}