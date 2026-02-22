import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();

  // Ako korisnik nije ulogovan, šaljemo ga na admin (gde ti je login)
  if (!userId) {
    redirect("/admin");
  }

  // Ako jeste ulogovan, prikazujemo dashboard
  return <DashboardClient />;
}
