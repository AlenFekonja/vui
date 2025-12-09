export type ABVariant = "A" | "B";

declare global {
  interface Window {
    _browsee?: (...args: any[]) => void;
  }
}

export const getCurrentABVariant = (): ABVariant => {
  if (typeof window === "undefined") return "A";
  const stored = localStorage.getItem("ab_variant");
  return stored === "B" ? "B" : "A";
};

export const trackBrowseeEvent = (
  name: string,
  data?: Record<string, any>
) => {
  if (typeof window === "undefined") return;
  if (typeof window._browsee === "function") {
    window._browsee("event", name, data || {});
  }
};