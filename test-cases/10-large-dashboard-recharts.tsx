import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  Layers,
  BarChart3,
  PieChart as PieChartIcon,
  Globe,
  Clock,
  Star,
  Zap,
  Target,
  Award,
  Package,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000, orders: 620 },
  { month: "Feb", revenue: 48000, expenses: 31000, profit: 17000, orders: 710 },
  { month: "Mar", revenue: 55000, expenses: 33000, profit: 22000, orders: 820 },
  { month: "Apr", revenue: 51000, expenses: 30000, profit: 21000, orders: 780 },
  { month: "May", revenue: 60000, expenses: 35000, profit: 25000, orders: 910 },
  { month: "Jun", revenue: 67000, expenses: 38000, profit: 29000, orders: 1020 },
  { month: "Jul", revenue: 72000, expenses: 40000, profit: 32000, orders: 1100 },
  { month: "Aug", revenue: 69000, expenses: 39000, profit: 30000, orders: 1050 },
  { month: "Sep", revenue: 75000, expenses: 41000, profit: 34000, orders: 1150 },
  { month: "Oct", revenue: 80000, expenses: 44000, profit: 36000, orders: 1230 },
  { month: "Nov", revenue: 88000, expenses: 48000, profit: 40000, orders: 1380 },
  { month: "Dec", revenue: 95000, expenses: 52000, profit: 43000, orders: 1500 },
];

const DAILY_VISITORS = [
  { day: "Mon", visitors: 2400, pageViews: 5200, bounceRate: 42 },
  { day: "Tue", visitors: 2800, pageViews: 6100, bounceRate: 38 },
  { day: "Wed", visitors: 3200, pageViews: 7400, bounceRate: 35 },
  { day: "Thu", visitors: 3100, pageViews: 7000, bounceRate: 37 },
  { day: "Fri", visitors: 2900, pageViews: 6500, bounceRate: 40 },
  { day: "Sat", visitors: 2100, pageViews: 4200, bounceRate: 48 },
  { day: "Sun", visitors: 1800, pageViews: 3600, bounceRate: 52 },
];

const CATEGORY_SPLIT = [
  { name: "Electronics", value: 35, color: "#6366f1" },
  { name: "Clothing", value: 25, color: "#ec4899" },
  { name: "Home & Garden", value: 18, color: "#f59e0b" },
  { name: "Sports", value: 12, color: "#22c55e" },
  { name: "Books", value: 10, color: "#06b6d4" },
];

const CONVERSION_FUNNEL = [
  { stage: "Visited", count: 12400, rate: 100 },
  { stage: "Browsed", count: 8800, rate: 71 },
  { stage: "Added to Cart", count: 4200, rate: 34 },
  { stage: "Checkout", count: 2800, rate: 23 },
  { stage: "Purchased", count: 1500, rate: 12 },
];

const TOP_PRODUCTS = [
  { name: "Wireless Headphones Pro", sales: 2340, revenue: 163800, trend: 12.5, rating: 4.8 },
  { name: 'Ultra HD Monitor 32"', sales: 1820, revenue: 545820, trend: 8.2, rating: 4.6 },
  { name: "Ergonomic Keyboard", sales: 3100, revenue: 154690, trend: -2.1, rating: 4.7 },
  { name: "Smart Watch Series 5", sales: 1560, revenue: 467880, trend: 22.4, rating: 4.5 },
  { name: "Noise Cancelling Buds", sales: 4200, revenue: 335580, trend: 15.8, rating: 4.9 },
  { name: "Laptop Stand Deluxe", sales: 2800, revenue: 111720, trend: 5.3, rating: 4.4 },
];

const HOURLY_TRAFFIC = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  traffic: Math.round(
    200 + 800 * Math.exp(-0.5 * Math.pow((i - 14) / 4, 2)) + Math.random() * 100
  ),
  conversions: Math.round(
    20 + 80 * Math.exp(-0.5 * Math.pow((i - 15) / 5, 2)) + Math.random() * 15
  ),
}));

const REGIONAL_DATA = [
  { region: "North America", revenue: 320000, growth: 14.2, customers: 8400 },
  { region: "Europe", revenue: 245000, growth: 11.8, customers: 6200 },
  { region: "Asia Pacific", revenue: 198000, growth: 22.5, customers: 5100 },
  { region: "Latin America", revenue: 87000, growth: 18.3, customers: 2300 },
  { region: "Middle East", revenue: 54000, growth: 9.7, customers: 1400 },
];

// ─── Helpers ───────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Sub-components ────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const isPositive = change >= 0;
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className={`flex items-center mt-2 text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              <span className="font-medium">{Math.abs(change)}%</span>
              <span className="text-gray-400 ml-1">vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueChart({ data }: { data: typeof MONTHLY_REVENUE }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Revenue & Expenses</CardTitle>
          <CardDescription>Monthly financial overview</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Calendar className="w-3.5 h-3.5" /> 2024
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="url(#expGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ProfitBarChart({ data }: { data: typeof MONTHLY_REVENUE }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Monthly Profit</CardTitle>
            <CardDescription>Revenue minus expenses</CardDescription>
          </div>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === data.length - 1 ? "#6366f1" : "#c7d2fe"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CategoryPieChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sales by Category</CardTitle>
            <CardDescription>Product category distribution</CardDescription>
          </div>
          <PieChartIcon className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={CATEGORY_SPLIT}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {CATEGORY_SPLIT.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {CATEGORY_SPLIT.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-gray-600">{c.name}</span>
              <span className="ml-auto font-medium">{c.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VisitorLineChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Weekly Traffic</CardTitle>
            <CardDescription>Visitors and page views this week</CardDescription>
          </div>
          <Globe className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={DAILY_VISITORS} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Line type="monotone" dataKey="visitors" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1" }} />
            <Line type="monotone" dataKey="pageViews" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HourlyTrafficChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Hourly Traffic</CardTitle>
            <CardDescription>Traffic and conversions over 24 hours</CardDescription>
          </div>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={HOURLY_TRAFFIC} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={2} />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Area type="monotone" dataKey="traffic" stroke="#06b6d4" fill="url(#trafficGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="conversions" stroke="#ec4899" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ConversionFunnel() {
  const maxCount = CONVERSION_FUNNEL[0].count;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Conversion Funnel</CardTitle>
            <CardDescription>Customer journey stages</CardDescription>
          </div>
          <Target className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {CONVERSION_FUNNEL.map((step, i) => {
          const widthPct = (step.count / maxCount) * 100;
          const colors = ["bg-indigo-500", "bg-indigo-400", "bg-violet-400", "bg-purple-400", "bg-fuchsia-500"];
          return (
            <div key={step.stage}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{step.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{formatNumber(step.count)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {step.rate}%
                  </Badge>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors[i]} transition-all duration-700`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function TopProductsTable() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Top Products</CardTitle>
            <CardDescription>Best performing products this quarter</CardDescription>
          </div>
          <Package className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-3 pr-4">
                  Product
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Sales
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Revenue
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 px-4">
                  Trend
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-3 pl-4">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {TOP_PRODUCTS.map((p) => (
                <tr key={p.name} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-800 text-sm">{p.name}</span>
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-gray-600">
                    {formatNumber(p.sales)}
                  </td>
                  <td className="text-right py-3 px-4 text-sm font-medium text-gray-800">
                    {formatCurrency(p.revenue)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={`inline-flex items-center text-sm font-medium ${
                        p.trend >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {p.trend >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                      )}
                      {Math.abs(p.trend)}%
                    </span>
                  </td>
                  <td className="text-right py-3 pl-4">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {p.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function RegionalBreakdown() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Regional Performance</CardTitle>
            <CardDescription>Revenue by geographic region</CardDescription>
          </div>
          <Globe className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={REGIONAL_DATA} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis type="category" dataKey="region" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {REGIONAL_DATA.map((r) => (
            <div key={r.region} className="text-center p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500">{r.region}</div>
              <div className="text-sm font-semibold text-green-600 flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                {r.growth}%
              </div>
              <div className="text-xs text-gray-400">{formatNumber(r.customers)} customers</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function OrdersOverview({ data }: { data: typeof MONTHLY_REVENUE }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Orders Trend</CardTitle>
            <CardDescription>Monthly order volume</CardDescription>
          </div>
          <ShoppingCart className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ fill: "#22c55e", r: 3 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ─── Quick-action & Activity ───────────────────────────────

function QuickActions() {
  const actions = [
    { label: "Generate Report", icon: <Download className="w-4 h-4" />, color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
    { label: "Refresh Data", icon: <RefreshCw className="w-4 h-4" />, color: "bg-green-50 text-green-600 hover:bg-green-100" },
    { label: "Apply Filters", icon: <Filter className="w-4 h-4" />, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
    { label: "View Layers", icon: <Layers className="w-4 h-4" />, color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button
            key={a.label}
            className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${a.color}`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivity() {
  const activities = [
    { text: "New order #4892 placed", time: "2 min ago", icon: <ShoppingCart className="w-4 h-4 text-blue-500" /> },
    { text: "Payment received: $1,240", time: "15 min ago", icon: <DollarSign className="w-4 h-4 text-green-500" /> },
    { text: "New user registered", time: "1 hr ago", icon: <Users className="w-4 h-4 text-purple-500" /> },
    { text: "Flash sale activated", time: "2 hr ago", icon: <Zap className="w-4 h-4 text-yellow-500" /> },
    { text: "Product review: 5 stars", time: "3 hr ago", icon: <Star className="w-4 h-4 text-yellow-500" /> },
    { text: "Monthly target reached", time: "5 hr ago", icon: <Award className="w-4 h-4 text-emerald-500" /> },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="h-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 rounded-lg bg-gray-50">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{a.text}</p>
              <p className="text-xs text-gray-400">{a.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PerformanceIndicators() {
  const kpis = [
    { label: "Avg Order Value", value: "$86.40", change: 4.2, target: "$90", progress: 96 },
    { label: "Customer Lifetime", value: "$1,240", change: 8.1, target: "$1,500", progress: 83 },
    { label: "Return Rate", value: "3.2%", change: -1.5, target: "<5%", progress: 100 },
    { label: "NPS Score", value: "72", change: 3, target: "75", progress: 96 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Performance KPIs</CardTitle>
            <CardDescription>Key metrics vs targets</CardDescription>
          </div>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {kpis.map((k) => (
          <div key={k.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">{k.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{k.value}</span>
                <span className={`text-xs ${k.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {k.change >= 0 ? "+" : ""}
                  {k.change}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    k.progress >= 90 ? "bg-green-500" : k.progress >= 70 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${k.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">Target: {k.target}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CustomerSatisfaction() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const satisfactionData = months.map((month, i) => ({
    month,
    csat: 78 + Math.round(i * 1.2 + (Math.sin(i) * 3)),
    nps: 55 + Math.round(i * 1.5 + (Math.cos(i) * 4)),
    ces: 3.2 + Number((i * 0.08 + Math.sin(i * 0.5) * 0.3).toFixed(1)),
  }));

  const reviewDistribution = [
    { stars: "5 Stars", count: 4280, pct: 42 },
    { stars: "4 Stars", count: 3150, pct: 31 },
    { stars: "3 Stars", count: 1530, pct: 15 },
    { stars: "2 Stars", count: 810, pct: 8 },
    { stars: "1 Star", count: 410, pct: 4 },
  ];

  const barColors = ["#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
            <CardDescription>CSAT & NPS trends with review breakdown</CardDescription>
          </div>
          <Award className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={satisfactionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Legend />
            <Line type="monotone" dataKey="csat" name="CSAT %" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
            <Line type="monotone" dataKey="nps" name="NPS" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} />
          </LineChart>
        </ResponsiveContainer>

        <h3 className="text-sm font-medium text-gray-700 mt-6 mb-3">Review Distribution</h3>
        <div className="space-y-2">
          {reviewDistribution.map((r, i) => (
            <div key={r.stars} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-14 shrink-0">{r.stars}</span>
              <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${r.pct}%`, backgroundColor: barColors[i] }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium w-12 text-right">
                {formatNumber(r.count)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">89%</div>
            <div className="text-xs text-indigo-500 mt-0.5">Overall CSAT</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">72</div>
            <div className="text-xs text-green-500 mt-0.5">NPS Score</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">4.1</div>
            <div className="text-xs text-amber-500 mt-0.5">Avg CES</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryHealth() {
  const categories = [
    { name: "Electronics", inStock: 1240, lowStock: 85, outOfStock: 12, reorderPoint: 100 },
    { name: "Clothing", inStock: 3400, lowStock: 120, outOfStock: 25, reorderPoint: 200 },
    { name: "Home & Garden", inStock: 890, lowStock: 65, outOfStock: 8, reorderPoint: 80 },
    { name: "Sports", inStock: 560, lowStock: 30, outOfStock: 5, reorderPoint: 50 },
    { name: "Books", inStock: 2100, lowStock: 45, outOfStock: 3, reorderPoint: 60 },
  ];

  const inventoryTrend = [
    { week: "W1", total: 8200, turnover: 2.4 },
    { week: "W2", total: 7900, turnover: 2.6 },
    { week: "W3", total: 8500, turnover: 2.3 },
    { week: "W4", total: 8100, turnover: 2.5 },
    { week: "W5", total: 7600, turnover: 2.8 },
    { week: "W6", total: 8300, turnover: 2.4 },
    { week: "W7", total: 8800, turnover: 2.2 },
    { week: "W8", total: 8400, turnover: 2.5 },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Inventory Health</CardTitle>
            <CardDescription>Stock levels and turnover rate</CardDescription>
          </div>
          <Package className="w-5 h-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={inventoryTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }} />
            <Bar dataKey="total" name="Total Units" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>

        <h3 className="text-sm font-medium text-gray-700 mt-5 mb-3">Category Breakdown</h3>
        <div className="space-y-3">
          {categories.map((c) => {
            const total = c.inStock + c.lowStock + c.outOfStock;
            const healthPct = Math.round((c.inStock / total) * 100);
            return (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-28 shrink-0">{c.name}</span>
                <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-gray-100">
                  <div className="bg-green-500" style={{ width: `${(c.inStock / total) * 100}%` }} />
                  <div className="bg-amber-400" style={{ width: `${(c.lowStock / total) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(c.outOfStock / total) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{healthPct}%</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> In Stock</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /> Low Stock</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ────────────────────────────────────────

function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"monthly" | "weekly">("monthly");

  const totalRevenue = useMemo(
    () => MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0),
    []
  );
  const totalProfit = useMemo(
    () => MONTHLY_REVENUE.reduce((s, m) => s + m.profit, 0),
    []
  );
  const totalOrders = useMemo(
    () => MONTHLY_REVENUE.reduce((s, m) => s + m.orders, 0),
    []
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back — here's your business overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPeriod("monthly")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === "monthly" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod("weekly")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  period === "weekly" ? "bg-white shadow-sm text-gray-800" : "text-gray-500"
                }`}
              >
                Weekly
              </button>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            change={18.2}
            icon={<DollarSign className="w-5 h-5 text-white" />}
            color="bg-indigo-500"
          />
          <StatCard
            title="Total Profit"
            value={formatCurrency(totalProfit)}
            change={22.5}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-green-500"
          />
          <StatCard
            title="Total Orders"
            value={formatNumber(totalOrders)}
            change={15.8}
            icon={<ShoppingCart className="w-5 h-5 text-white" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Active Users"
            value="24.3K"
            change={9.1}
            icon={<Users className="w-5 h-5 text-white" />}
            color="bg-orange-500"
          />
        </div>

        {/* Revenue + Profit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={MONTHLY_REVENUE} />
          <ProfitBarChart data={MONTHLY_REVENUE} />
        </div>

        {/* Category Pie + Visitors + Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CategoryPieChart />
          <VisitorLineChart />
          <ConversionFunnel />
        </div>

        {/* Hourly Traffic + Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HourlyTrafficChart />
          <OrdersOverview data={MONTHLY_REVENUE} />
        </div>

        {/* Products Table + Regional */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsTable />
          <RegionalBreakdown />
        </div>

        {/* KPIs + Activity + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PerformanceIndicators />
          <RecentActivity />
          <QuickActions />
        </div>

        {/* Customer Satisfaction + Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomerSatisfaction />
          <InventoryHealth />
        </div>
      </div>
    </div>
  );
}

export default React.memo(AnalyticsDashboard);
