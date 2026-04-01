import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

const QrScanner = ({ onScan, onClose }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  onScanRef.current = onScan;

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (cancelled) return;
          cancelled = true;
          startedRef.current = false;
          scanner.stop().catch(() => {});
          onScanRef.current(decodedText.trim());
        },
        () => {}
      )
      .then(() => {
        if (!cancelled) {
          startedRef.current = true;
        }
      })
      .catch(() => {
        startedRef.current = false;
        if (!cancelled) {
          setError("Camera access denied. Please allow camera permissions.");
        }
      });

    return () => {
      cancelled = true;
      if (startedRef.current) {
        startedRef.current = false;
        scanner.stop().catch(() => {});
      }
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
