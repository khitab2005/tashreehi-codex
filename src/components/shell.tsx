"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  HeartPulse,
  BookOpen,
  Compass,
  Heart,
  GraduationCap,
  ShieldCheck,
  Download,
} from "lucide-react";
import { usePreferences } from "@/lib/store";
import { Button } from "./ui/button";
export function Shell({ children }: { children: React.ReactNode }) {
  const { locale, theme, setLocale, toggleTheme, storageWarning } =
    usePreferences();
  const t = (a: string, b: string) => (locale === "ar" ? a : b);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [install, setInstall] = useState<
    (Event & { prompt: () => Promise<void> }) | null
  >(null);
  useEffect(() => {
    if (!usePreferences.persist.hasHydrated())
      void usePreferences.persist.rehydrate();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const handler = (event: Event) => {
      event.preventDefault();
      setInstall(event as Event & { prompt: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);
  useEffect(() => {
    // A full navigation lets the service worker restore cached HTML offline.
    // Next's in-memory RSC navigation cannot guarantee that after a cold start.
    const offlineNavigation = (event: MouseEvent) => {
      if (
        navigator.onLine ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target =
        event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !(target instanceof HTMLAnchorElement) ||
        target.target === "_blank" ||
        target.hasAttribute("download")
      )
        return;
      const url = new URL(target.href);
      if (
        url.origin !== window.location.origin ||
        (url.pathname === window.location.pathname && url.hash)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(url.href);
    };
    document.addEventListener("click", offlineNavigation, true);
    return () => document.removeEventListener("click", offlineNavigation, true);
  }, []);
  const links = [
    ["/explorer", t("مستكشف التشريح", "Explorer"), Compass],
    ["/systems", t("أجهزة الجسم", "Body systems"), HeartPulse],
    ["/lessons", t("مكتبة الدروس", "Lessons"), BookOpen],
    ["/quizzes", t("اختبر معرفتك", "Quizzes"), GraduationCap],
    ["/favorites", t("المفضلة", "Favorites"), Heart],
  ] as const;
  return (
    <div
      className="app-shell"
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-theme={theme}
    >
      <a className="skip-link" href="#main">
        {t("تجاوز إلى المحتوى", "Skip to content")}
      </a>
      <div className="announcement">
        <span>
          {t(
            "معرفة متاحة للجميع. تشريح أقرب إليك.",
            "Knowledge for everyone. Anatomy within reach.",
          )}
        </span>
        <Link href="/about">
          {t("مجاني ومفتوح المصدر", "Free & open source")}{" "}
          <ShieldCheck size={13} />
        </Link>
      </div>
      <header className="header">
        <Link href="/" className="brand" aria-label="تشريحي | Tashreehi">
          <span className="brand-icon">
            <HeartPulse size={27} strokeWidth={1.7} />
          </span>
          <span>
            <strong>
              تشريحي<span className="brand-dot">.</span>
            </strong>
            <small>TASHREEHI</small>
          </span>
        </Link>
        <nav
          className="desktop-nav"
          aria-label={t("التنقل الرئيسي", "Main navigation")}
        >
          {links.slice(0, 4).map(([href, label]) => (
            <Link
              href={href}
              key={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label={t("Switch to English", "التبديل للعربية")}
          >
            <Languages size={17} />
            <span>{locale === "ar" ? "EN" : "عربي"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("تبديل المظهر", "Toggle theme")}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          <Link
            className="favorite-nav"
            href="/favorites"
            aria-label={t("المفضلة", "Favorites")}
          >
            <Heart size={19} />
          </Link>
          <Button
            className="mobile-menu-button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={t("القائمة", "Menu")}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      {open && (
        <nav
          className="mobile-nav"
          aria-label={t("قائمة الهاتف", "Mobile menu")}
        >
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
      )}
      {storageWarning && (
        <div className="notice" role="status">
          {t(
            "التخزين المحلي غير متاح؛ التغييرات محفوظة لهذه الجلسة فقط.",
            "Local storage is unavailable; changes last for this session only.",
          )}
        </div>
      )}
      <main id="main">{children}</main>
      <footer className="footer">
        <div className="footer-main">
          <Link href="/" className="footer-brand">
            <HeartPulse size={22} /> تشريحي <span>Tashreehi</span>
          </Link>
          <p>
            {t(
              "مساحة للتعلّم، بُنيت للفضول.",
              "A place to learn, built for curiosity.",
            )}
          </p>
          <span className="footer-note">
            {t(
              "محتوى تعليمي؛ ليس أداة للتشخيص أو العلاج.",
              "For education; not for diagnosis or treatment.",
            )}
          </span>
        </div>
        <nav aria-label={t("روابط المشروع", "Project links")}>
          <Link href="/about">{t("عن تشريحي", "About")}</Link>
          <Link href="/credits">
            {t("الاعتمادات والتراخيص", "Credits & licenses")}
          </Link>
          <Link href="/privacy">{t("الخصوصية", "Privacy")}</Link>
          {install && (
            <button
              onClick={async () => {
                await install.prompt();
                setInstall(null);
              }}
            >
              <Download size={15} />
              {t("تثبيت التطبيق", "Install app")}
            </button>
          )}
        </nav>
        <span className="footer-copy">
          © {new Date().getFullYear()} · MIT / CC BY 4.0
        </span>
      </footer>
    </div>
  );
}
