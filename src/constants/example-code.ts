export const EXAMPLE_CODE = `import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  Activity,
  Sparkles,
  Globe,
  ChevronRight,
} from "lucide-react";

const chartData = [
  { time: "00:00", value: 20, prev: 15 },
  { time: "04:00", value: 35, prev: 28 },
  { time: "08:00", value: 55, prev: 42 },
  { time: "12:00", value: 78, prev: 65 },
  { time: "16:00", value: 92, prev: 71 },
  { time: "20:00", value: 68, prev: 58 },
  { time: "Now", value: 85, prev: 62 },
];

const stats = [
  { label: "Active Users", value: 2847, icon: Users, color: "from-blue-500 to-cyan-400", change: 12.5 },
  { label: "Events / sec", value: 1423, icon: Activity, color: "from-violet-500 to-purple-400", change: 8.3 },
  { label: "Latency", value: 42, suffix: "ms", icon: Zap, color: "from-amber-500 to-orange-400", change: -18.2 },
  { label: "Regions", value: 24, icon: Globe, color: "from-emerald-500 to-green-400", change: 4.1 },
];

const feed = [
  { text: "Anomaly detected in EU-West cluster", time: "2m ago", severity: "warning" },
  { text: "Auto-scaled to 12 instances", time: "5m ago", severity: "info" },
  { text: "New deployment v2.14.0 live", time: "12m ago", severity: "success" },
  { text: "Cache hit ratio above 98%", time: "18m ago", severity: "info" },
];

const sevColor = { warning: "bg-amber-500", info: "bg-blue-500", success: "bg-emerald-500" };

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display.toLocaleString()}{suffix}</>;
}

export default function App() {
  const [live, setLive] = useState(true);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <div className={\`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 \${live ? "bg-emerald-400" : "bg-zinc-600"} \${live && pulse ? "animate-ping" : ""}\`} style={{ animationDuration: "2s" }} />
              <div className={\`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 \${live ? "bg-emerald-400" : "bg-zinc-600"}\`} />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">System Monitor</h1>
              <p className="text-xs text-zinc-500">Real-time infrastructure overview</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={\`border-zinc-800 text-xs \${live ? "text-emerald-400 border-emerald-900 hover:bg-emerald-950" : "text-zinc-400 hover:bg-zinc-900"}\`}
            onClick={() => setLive(!live)}
          >
            <span className={\`mr-1.5 inline-block h-1.5 w-1.5 rounded-full \${live ? "bg-emerald-400" : "bg-zinc-600"}\`} />
            {live ? "Live" : "Paused"}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <Card key={s.label} className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur overflow-hidden group hover:border-zinc-700 transition-all duration-300">
              <CardContent className="p-4 relative">
                <div className={\`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl \${s.color} opacity-[0.07] rounded-bl-full group-hover:opacity-[0.12] transition-opacity\`} />
                <s.icon className="h-4 w-4 text-zinc-500 mb-3" />
                <div className="text-2xl font-bold tabular-nums">
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-zinc-500">{s.label}</span>
                  <span className={\`text-[11px] font-medium flex items-center \${s.change > 0 ? "text-emerald-400" : "text-rose-400"}\`}>
                    <ArrowUpRight className={\`h-3 w-3 mr-0.5 \${s.change < 0 ? "rotate-90" : ""}\`} />
                    {Math.abs(s.change)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Throughput</span>
                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Today</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-zinc-700" /> Yesterday</span>
                </div>
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-emerald-400 text-[11px]">
                <TrendingUp className="h-3 w-3 mr-1" /> +24.5%
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#27272a" tick={{ fill: "#52525b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#e4e4e7", fontSize: 12 }} />
                <Area type="monotone" dataKey="prev" stroke="#3f3f46" strokeWidth={1.5} fill="transparent" dot={false} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="border-zinc-800/50 bg-zinc-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Activity Feed</span>
              <button className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center transition-colors">
                View all <ChevronRight className="h-3 w-3 ml-0.5" />
              </button>
            </div>
            <div className="space-y-3">
              {feed.map((item, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-1.5 relative">
                    <div className={\`h-2 w-2 rounded-full \${sevColor[item.severity]}\`} />
                    {i < feed.length - 1 && <div className="absolute top-2.5 left-[3px] w-px h-6 bg-zinc-800" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{item.text}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}`;
