import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-container empty">
      <h1>404</h1>
      <p>الصفحة غير موجودة · Page not found</p>
      <Link href="/">تشريحي · Tashreehi</Link>
    </div>
  );
}
