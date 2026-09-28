import { useEffect, useRef } from "react";

/**
 * usePolling - Auto refresh data dari server setiap N detik
 * @param {Function} fetchFn - Fungsi async yang akan dipanggil ulang
 * @param {number} intervalMs - Interval polling dalam milidetik (default: 8000 = 8 detik)
 * @param {boolean} enabled - Aktifkan polling (default: true)
 */
export function usePolling(fetchFn, intervalMs = 3500, enabled = true) {
  const fetchRef = useRef(fetchFn);

  // Update ref agar selalu pakai versi terbaru fungsi tanpa re-register interval
  useEffect(() => {
    fetchRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      fetchRef.current?.();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchRef.current?.();
      }
    };

    const id = setInterval(tick, intervalMs);
    window.addEventListener("focus", tick);
    window.addEventListener("online", tick);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", tick);
      window.removeEventListener("online", tick);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs, enabled]);
}
