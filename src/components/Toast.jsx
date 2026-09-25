import React, { useState, useCallback, useRef } from "react";

export function useToast() {
  const [toast, setToast] = useState({ show: false, message: "", isError: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ show: true, message, isError });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  }, []);

  const ToastEl = (
    <div className={`toast ${toast.show ? "show" : ""} ${toast.isError ? "toast-error" : "toast-success"}`}>
      {toast.message}
    </div>
  );

  return { showToast, ToastEl };
}
