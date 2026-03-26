import React from "react";

class ClickTracker extends React.Component<{}, { clicks: { x: number; y: number; id: number }[] }> {
  state = { clicks: [] as { x: number; y: number; id: number }[] };
  nextId = 0;

  handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.setState((prev) => ({
      clicks: [...prev.clicks, { x, y, id: this.nextId++ }],
    }));
  };

  render() {
    return (
      <div
        onClick={this.handleClick}
        className="min-h-screen bg-slate-900 relative cursor-crosshair select-none"
      >
        <div className="absolute top-4 left-4 text-slate-500 text-sm">
          Click anywhere &middot; {this.state.clicks.length} points
        </div>
        {this.state.clicks.map((c) => (
          <div
            key={c.id}
            className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-cyan-400 animate-ping"
            style={{ left: c.x, top: c.y }}
          />
        ))}
        {this.state.clicks.map((c) => (
          <div
            key={`dot-${c.id}`}
            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-cyan-300"
            style={{ left: c.x, top: c.y }}
          />
        ))}
      </div>
    );
  }
}

export default ClickTracker;
