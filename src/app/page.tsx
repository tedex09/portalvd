import { Index } from "@/components/pages/index";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  
  if (session) {
    redirect("/dashboard");
  }
  
  return <Index />;
}