import { Metadata } from "next";
import { appTitle } from "@/lib/data";

export const metadata: Metadata = {
  title: `Account Settings | ${appTitle}`,
  description: "Manage your account settings and preferences",
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
