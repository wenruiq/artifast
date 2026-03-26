import { useState } from "react";
import { Plus, Minus } from "lucide-react";

function Stepper() {
  const [value, setValue] = useState(0);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-lg">
        <button
          onClick={() => setValue((v) => v - 1)}
          className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-5xl font-bold text-gray-800 tabular-nums w-24 text-center">
          {value}
        </span>
        <button
          onClick={() => setValue((v) => v + 1)}
          className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

module.exports = Stepper;
