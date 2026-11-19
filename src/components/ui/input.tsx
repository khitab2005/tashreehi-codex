"use client";
import { useSyncExternalStore, type InputHTMLAttributes } from "react";
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
// A slow client must not accept text before React can receive input events.
// Native disabled also gives browser automation the correct readiness signal.
export function Input({
  disabled,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const ready = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return <input {...props} disabled={!ready || disabled} data-ready={ready} />;
}
