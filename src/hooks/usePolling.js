import { useEffect, useRef } from "react";

/**
 * usePolling - Auto refresh data dari server setiap N detik
 * @param {Function} fetchFn - Fungsi async yang akan dipanggil ulang
 * @param {number} intervalMs - Interval polling dalam milidetik (default: 8000 = 8 detik)
 * @param {boolean} enabled - Aktifkan polling (default: true)
 */
export function usePolling(fetchFn, intervalMs = 8000, enabled = true) {
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

    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
