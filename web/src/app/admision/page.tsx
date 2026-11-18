import type { Metadata } from "next";
import ExtraRoute from "@/components/ExtraRoute";

export const metadata: Metadata = { title: "Admisión" };

export default function Page() {
  return <ExtraRoute path="/admision" />;
}
