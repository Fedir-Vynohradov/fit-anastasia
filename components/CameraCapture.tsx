"use client";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  disabled?: boolean;
}

function compressImage(dataUrl: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.src = dataUrl;
  });
}

export default function CameraCapture({ onCapture, disabled }: CameraCaptureProps) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      onCapture(compressed);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <label
      className={`block w-full cursor-pointer touch-manipulation ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className="rounded-3xl bg-card/50 px-6 py-7 flex flex-col items-center gap-3 transition-colors hover:bg-card"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 6px, var(--border-strong) 6px, var(--border-strong) 12px), repeating-linear-gradient(90deg, transparent, transparent 6px, var(--border-strong) 6px, var(--border-strong) 12px), repeating-linear-gradient(180deg, transparent, transparent 6px, var(--border-strong) 6px, var(--border-strong) 12px), repeating-linear-gradient(270deg, transparent, transparent 6px, var(--border-strong) 6px, var(--border-strong) 12px)",
          backgroundSize: "1.5px 100%, 100% 1.5px, 1.5px 100%, 100% 1.5px",
          backgroundPosition: "0 0, 0 0, 100% 0, 0 100%",
          backgroundRepeat: "no-repeat",
          borderRadius: "1.5rem",
        }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-terracotta flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Log a meal</h2>
        <p className="text-sm text-ink-soft text-center">
          Snap a photo &mdash; Claude will estimate the rest
        </p>
      </div>
    </label>
  );
}
