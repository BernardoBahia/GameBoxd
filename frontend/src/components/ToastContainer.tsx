import { useToast } from "../contexts/ToastContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] max-w-md p-4 rounded-lg shadow-lg
            flex items-center justify-between gap-3
            animate-slide-in-right
            ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }
          `}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <span className="text-2xl">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "warning" && "⚠"}
              {toast.type === "info" && "ℹ"}
            </span>
            {/* Message */}
            <p className="font-medium">{toast.message}</p>
          </div>
          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white hover:text-gray-200 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
