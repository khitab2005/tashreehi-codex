"use client";
import dynamic from "next/dynamic";
const AnatomyViewer = dynamic(() => import("./viewer"), {
  ssr: false,
  loading: () => (
    <div className="viewer viewer-placeholder" role="status">
      3D · تشريحي | Tashreehi
    </div>
  ),
});
export default AnatomyViewer;
