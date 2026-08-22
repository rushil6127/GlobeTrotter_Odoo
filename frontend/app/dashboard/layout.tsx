import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — GlobeTrotter",
  description:
    "Your travel command centre. Plan new trips, view upcoming adventures, and explore destinations.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
