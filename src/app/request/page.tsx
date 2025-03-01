import { RequestWizard } from "@/components/pages/request-wizard";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RequestPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  return <RequestWizard />;
}