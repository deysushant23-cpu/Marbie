import { redirect } from "next/navigation";

export default function OldLoginPage() {
  // If the browser or a cached link tries to go here, instantly bounce them to /admin
  redirect("/admin");
}
