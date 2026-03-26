import { useState } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    setIntervalId(id);
  };

  const stop = () => {
    if (intervalId !== null) clearInterval(intervalId);
    setRunning(false);
    setIntervalId(null);
  };

  const reset = () => {
    stop();
    setSeconds(0);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl font-mono font-bold text-white tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={start}
            disabled={running}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-40 hover:bg-green-500 transition-colors"
          >
            Start
          </button>
          <button
            onClick={stop}
            disabled={!running}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-40 hover:bg-red-500 transition-colors"
          >
            Stop
          </button>
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export { Timer as default };
