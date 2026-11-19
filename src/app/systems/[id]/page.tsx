import { notFound } from "next/navigation";
import { systems } from "@/lib/content";
import { SystemDetail } from "@/components/pages";
export function generateStaticParams() {
  return systems.map((s) => ({ id: s.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!systems.some((s) => s.id === id)) notFound();
  return <SystemDetail id={id} />;
}
