// File: src/components/TrackingProvider.tsx
import { useEffect, useRef } from "react";
import { trackPageVisit } from "../services/trackingService";

export default function TrackingProvider() {
  const isSent = useRef(false);

  useEffect(() => {
    if (isSent.current) return;
    isSent.current = true;

    const recordVisit = async () => {
      try {
        const res = await fetch("https://api64.ipify.org?format=json");
        const data = await res.json();
        const ip = data.ip || "Unknown IP";

        const userAgent = navigator.userAgent;
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            userAgent,
          );
        const device = isMobile ? "Mobile" : "PC";

        await trackPageVisit(ip, device);
      } catch (error) {
        console.log("Analytics bị block hoặc có lỗi:", error);
      }
    };

    recordVisit();
  }, []);

  return null;
}
