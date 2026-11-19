import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageRouter } from "@/components/pages";
const pages = [
  "explorer",
  "systems",
  "lessons",
  "quizzes",
  "favorites",
  "about",
  "credits",
  "privacy",
];
export function generateStaticParams() {
  return pages.map((page) => ({ page }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!pages.includes(page)) notFound();
  return (
    <Suspense
      fallback={<div className="page-container">تشريحي · Tashreehi</div>}
    >
      <PageRouter page={page} />
    </Suspense>
  );
}
