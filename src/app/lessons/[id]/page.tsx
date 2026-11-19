import { notFound } from "next/navigation";
import { structures } from "@/lib/content";
import { Lesson } from "@/components/pages";
export function generateStaticParams() {
  return structures.map((s) => ({ id: s.id }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!structures.some((s) => s.id === id)) notFound();
  return <Lesson id={id} />;
}
