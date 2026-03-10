import { useEffect, useState } from "react";
import { subscribeToast } from "../utils/toast";

export default function ToastViewport() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((nextToast) => {
      if (!nextToast?.message) return;
      setItems((prev) => [...prev, nextToast]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== nextToast.id));
      }, Number(nextToast.duration || 2800));
    });
    return unsubscribe;
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div key={item.id} className={`toast-item ${item.type || "info"}`}>
          {item.message}
        </div>
      ))}
    </div>
  );
}

