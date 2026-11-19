"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-container empty" role="alert">
      <h1>تعذر عرض الصفحة · Unable to display page</h1>
      <button className="button button-primary" onClick={reset}>
        إعادة المحاولة · Retry
      </button>
    </div>
  );
}
