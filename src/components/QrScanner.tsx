import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QrScanner = ({ onScan, onClose }: QrScannerProps) => {
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  onScanRef.current = onScan;

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode("qr-reader");

    const startPromise = scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled) return;
          cancelled = true;
          scanner.stop().catch(() => {});
          onScanRef.current(decodedText.trim());
        },
        () => {}
      )
      .catch(() => {
        if (!cancelled) {
          setError("Camera access denied. Please allow camera permissions.");
        }
        return null; // signal that start failed
      });

    return () => {
      cancelled = true;
      // Wait for start to resolve/reject before calling stop
      startPromise.then((result) => {
        // result is null if start failed (caught above)
        if (result !== null) {
          scanner.stop().catch(() => {});
        }
      });
    };
  }, []);

  return (
    <div className="w-full max-w-sm space-y-4 text-center">
      <div
        id="qr-reader"
        className="w-full rounded-xl overflow-hidden border border-border bg-black"
        style={{ minHeight: 280 }}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        onClick={onClose}
        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

export default QrScanner;
