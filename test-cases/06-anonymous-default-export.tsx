import { useState } from "react";
import { Moon, Sun } from "lucide-react";

export default () => {
  const [dark, setDark] = useState(false);

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${dark ? "bg-gray-900" : "bg-white"}`}>
      <div className="text-center">
        <button
          onClick={() => setDark((d) => !d)}
          className={`p-4 rounded-full transition-all duration-300 ${
            dark
              ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30"
              : "bg-gray-800 text-yellow-300 shadow-lg shadow-gray-800/30"
          }`}
        >
          {dark ? <Sun className="w-10 h-10" /> : <Moon className="w-10 h-10" />}
        </button>
        <p className={`mt-6 text-xl font-medium ${dark ? "text-gray-200" : "text-gray-800"}`}>
          {dark ? "Light awaits" : "Embrace the dark"}
        </p>
      </div>
    </div>
  );
};
