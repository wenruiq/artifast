import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function BubbleChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const data = [
      { label: "JavaScript", value: 95, group: "frontend" },
      { label: "Python", value: 88, group: "backend" },
      { label: "TypeScript", value: 82, group: "frontend" },
      { label: "Rust", value: 65, group: "systems" },
      { label: "Go", value: 72, group: "backend" },
      { label: "Java", value: 78, group: "backend" },
      { label: "C++", value: 60, group: "systems" },
      { label: "Swift", value: 55, group: "mobile" },
      { label: "Kotlin", value: 52, group: "mobile" },
      { label: "Ruby", value: 45, group: "backend" },
      { label: "PHP", value: 50, group: "backend" },
      { label: "CSS", value: 70, group: "frontend" },
    ];

    const width = 600;
    const height = 500;
    const colorMap: Record<string, string> = {
      frontend: "#6366f1",
      backend: "#22c55e",
      systems: "#f59e0b",
      mobile: "#ec4899",
    };

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%");

    svg.selectAll("*").remove();

    const pack = d3
      .pack<typeof data[0]>()
      .size([width, height])
      .padding(8);

    const root = d3
      .hierarchy({ children: data } as any)
      .sum((d: any) => d.value || 0);

    const nodes = pack(root as any).leaves();

    const node = svg
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("circle")
      .attr("r", 0)
      .attr("fill", (d: any) => colorMap[d.data.group] || "#999")
      .attr("opacity", 0.8)
      .attr("stroke", (d: any) => colorMap[d.data.group] || "#999")
      .attr("stroke-width", 2)
      .transition()
      .duration(800)
      .delay((_, i) => i * 60)
      .attr("r", (d) => d.r);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "white")
      .attr("font-size", (d) => Math.max(10, d.r / 3.5))
      .attr("font-weight", "bold")
      .attr("opacity", 0)
      .text((d: any) => d.data.label)
      .transition()
      .duration(400)
      .delay((_, i) => 600 + i * 60)
      .attr("opacity", 1);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "white")
      .attr("font-size", (d) => Math.max(9, d.r / 4.5))
      .attr("opacity", 0)
      .text((d: any) => d.data.value)
      .transition()
      .duration(400)
      .delay((_, i) => 600 + i * 60)
      .attr("opacity", 0.7);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Language Popularity</h1>
      <p className="text-slate-400 mb-6 text-sm">Bubble size represents popularity index</p>
      <div className="flex gap-4 mb-6">
        {[
          { label: "Frontend", color: "#6366f1" },
          { label: "Backend", color: "#22c55e" },
          { label: "Systems", color: "#f59e0b" },
          { label: "Mobile", color: "#ec4899" },
        ].map((g) => (
          <div key={g.label} className="flex items-center gap-1.5 text-sm text-slate-300">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
            {g.label}
          </div>
        ))}
      </div>
      <svg ref={svgRef} />
    </div>
  );
}

export default BubbleChart;
