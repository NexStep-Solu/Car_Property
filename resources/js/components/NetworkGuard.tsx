import { useEffect, useState, type ReactNode } from "react";
import OfflinePage from "@/pages/OfflinePage";

export default function NetworkGuard({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!online) {
    return <OfflinePage />;
  }

  return children;
}
