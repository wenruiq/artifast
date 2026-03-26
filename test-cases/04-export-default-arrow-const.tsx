import { useState } from "react";
import { Check, Copy } from "lucide-react";

const ColorPalette = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const palettes = [
    { name: "Ocean", colors: ["#0ea5e9", "#0284c7", "#0369a1", "#075985", "#0c4a6e"] },
    { name: "Sunset", colors: ["#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"] },
    { name: "Forest", colors: ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d"] },
    { name: "Berry", colors: ["#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87"] },
  ];

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Color Palettes</h1>
      <div className="grid gap-6">
        {palettes.map((p) => (
          <div key={p.name}>
            <h2 className="text-sm font-medium text-gray-400 mb-2">{p.name}</h2>
            <div className="flex gap-2">
              {p.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleCopy(color)}
                  className="group relative flex-1 h-20 rounded-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {copied === color ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </span>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/70">
                    {color}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
