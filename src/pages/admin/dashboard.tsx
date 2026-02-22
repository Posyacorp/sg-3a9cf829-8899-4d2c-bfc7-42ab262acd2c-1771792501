import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Package,
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Ban,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  LineChart
} from "lucide-react";
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("7d"); // 24h, 7d, 30d, 90d, 1y

  // Mock data - Replace with real API calls
  const [stats, setStats] = useState({
    totalUsers: 12847,
    activeUsers: 8432,
    totalVolume: 4523000,
    totalEarnings: 226150,
    pendingDeposits: 23,
    pendingWithdrawals: 15,
    activePackages: 3421,
    totalCommissions: 156780
  });

  // Revenue Analytics Data (7 days)
  const revenueData = [
    { date: "Mon", deposits: 45000, withdrawals: 12000, netRevenue: 33000, adminFees: 2250 },
    { date: "Tue", deposits: 52000, withdrawals: 18000, netRevenue: 34000, adminFees: 2600 },
    { date: "Wed", deposits: 48000, withdrawals: 15000, netRevenue: 33000, adminFees: 2400 },
    { date: "Thu", deposits: 61000, withdrawals: 22000, netRevenue: 39000, adminFees: 3050 },
    { date: "Fri", deposits: 73000, withdrawals: 28000, netRevenue: 45000, adminFees: 3650 },
    { date: "Sat", deposits: 68000, withdrawals: 25000, netRevenue: 43000, adminFees: 3400 },
    { date: "Sun", deposits: 58000, withdrawals: 20000, netRevenue: 38000, adminFees: 2900 }
  ];

  // User Growth Data
  const userGrowthData = [
    { month: "Jan", users: 1250, active: 890 },
    { month: "Feb", users: 2100, active: 1520 },
    { month: "Mar", users: 3450, active: 2340 },
    { month: "Apr", users: 5200, active: 3680 },
    { month: "May", users: 7300, active: 5210 },
    { month: "Jun", users: 9800, active: 6890 },
    { month: "Jul", users: 12847, active: 8432 }
  ];

  // Package Distribution
  const packageDistribution = [
    { name: "Starter (30)", value: 3456, percentage: 27, color: "#8b5cf6" },
    { name: "Bronze (100)", value: 2890, percentage: 22, color: "#a78bfa" },
    { name: "Silver (250)", value: 2145, percentage: 17, color: "#c084fc" },
    { name: "Gold (750)", value: 1678, percentage: 13, color: "#e879f9" },
    { name: "Platinum (2.5K)", value: 1234, percentage: 10, color: "#f0abfc" },
    { name: "Diamond (5K)", value: 892, percentage: 7, color: "#fae8ff" },
    { name: "Premium (7.5K)", value: 456, percentage: 3, color: "#fdf4ff" },
    { name: "Royal (10K)", value: 123, percentage: 1, color: "#faf5ff" }
  ];

  // Transaction Volume by Type
  const transactionVolume = [
    { type: "Deposits", count: 3456, volume: 405000, avgSize: 117 },
    { type: "Withdrawals", count: 1890, volume: 180000, avgSize: 95 },
    { type: "P2P Transfers", count: 2345, volume: 89000, avgSize: 38 },
    { type: "ROI Claims", count: 8923, volume: 267000, avgSize: 30 },
    { type: "Commissions", count: 5678, volume: 156780, avgSize: 28 }
  ];

  // MLM Level Performance
  const mlmLevelData = [
    { level: "L1", users: 2456, volume: 456000, commission: 13680, rate: "3%" },
    { level: "L2", users: 4893, volume: 823000, commission: 16460, rate: "2%" },
    { level: "L3", users: 8234, volume: 1234000, commission: 12340, rate: "1%" },
    { level: "L4-6", users: 15678, volume: 1890000, commission: 28350, rate: "0.5%" },
    { level: "L7-18", users: 34567, volume: 2345000, commission: 87938, rate: "0.25%" },
    { level: "L19-24", users: 12890, volume: 890000, commission: 15420, rate: "0.5%-3%" }
  ];

  // Platform Earnings Breakdown
  const platformEarnings = [
    { source: "Package Entry (5%)", amount: 22615, percentage: 45, color: "#8b5cf6" },
    { source: "Withdrawal Tax (50%)", amount: 15000, percentage: 30, color: "#a78bfa" },
    { source: "P2P Fees (1%)", amount: 890, percentage: 2, color: "#c084fc" },
    { source: "Trading Losses", amount: 11645, percentage: 23, color: "#e879f9" }
  ];

  // ROI Claims Activity (Hourly for today)
  const roiClaimsData = [
    { hour: "00:00", claims: 45, missed: 12, amount: 1350 },
    { hour: "03:00", claims: 67, missed: 18, amount: 2010 },
    { hour: "06:00", claims: 89, missed: 23, amount: 2670 },
    { hour: "09:00", claims: 134, missed: 34, amount: 4020 },
    { hour: "12:00", claims: 156, missed: 41, amount: 4680 },
    { hour: "15:00", claims: 178, missed: 45, amount: 5340 },
    { hour: "18:00", claims: 145, missed: 38, amount: 4350 },
    { hour: "21:00", claims: 123, missed: 32, amount: 3690 }
  ];

  // Active Users Timeline (24 hours)
  const activeUsersData = [
    { time: "00:00", online: 234, trading: 89, claiming: 45 },
    { time: "03:00", online: 189, trading: 67, claiming: 34 },
    { time: "06:00", online: 267, trading: 98, claiming: 56 },
    { time: "09:00", online: 456, trading: 178, claiming: 89 },
    { time: "12:00", online: 589, trading: 234, claiming: 123 },
    { time: "15:00", online: 678, trading: 289, claiming: 145 },
    { time: "18:00", online: 734, trading: 312, claiming: 167 },
    { time: "21:00", online: 612, trading: 245, claiming: 134 }
  ];

  const COLORS = ['#8b5cf6', '#a78bfa', '#c084fc', '#e879f9', '#f0abfc', '#fae8ff', '#fdf4ff', '#faf5ff'];

  return (
    <>
      <SEO 
        title="Admin Dashboard - Sui24.trade"
        description="Administrative control panel for Sui24.trade platform"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-xs text-white/60">Master Control Panel</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    User View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Users</p>
                  <p className="text-3xl font-black text-white">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +12.5% vs last week
                  </p>
                </div>
                <Users className="w-12 h-12 text-purple-400 opacity-50" />
              </div>
            </Card>

            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Total Volume</p>
                  <p className="text-3xl font-black text-white">${(stats.totalVolume / 1000).toFixed(1)}M</p>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +8.3% vs last week
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-400 opacity-50" />
              </div>
            </Card>

            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Platform Earnings</p>
                  <p className="text-3xl font-black text-white">${stats.totalEarnings.toLocaleString()}</p>
                  <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Secret Admin Wallet
                  </p>
                </div>
                <Wallet className="w-12 h-12 text-yellow-400 opacity-50" />
              </div>
            </Card>

            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60 mb-1">Active Packages</p>
                  <p className="text-3xl font-black text-white">{stats.activePackages.toLocaleString()}</p>
                  <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Earning ROI
                  </p>
                </div>
                <Activity className="w-12 h-12 text-blue-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-5 h-5 text-white/60" />
            <div className="flex gap-2">
              {["24h", "7d", "30d", "90d", "1y"].map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? "default" : "outline"}
                  className={selectedPeriod === period 
                    ? "bg-purple-500 hover:bg-purple-600" 
                    : "border-white/20 text-white hover:bg-white/10"
                  }
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Analytics */}
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-purple-400" />
                    Revenue Analytics
                  </h3>
                  <p className="text-sm text-white/60">Daily income breakdown</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAdminFees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0b2e', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="deposits" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDeposits)" />
                  <Area type="monotone" dataKey="withdrawals" stroke="#ef4444" fillOpacity={1} fill="url(#colorWithdrawals)" />
                  <Area type="monotone" dataKey="adminFees" stroke="#22c55e" fillOpacity={1} fill="url(#colorAdminFees)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* User Growth Chart */}
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    User Growth
                  </h3>
                  <p className="text-sm text-white/60">Total vs active users</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLine data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="month" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0b2e', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                  <Line type="monotone" dataKey="active" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
                </RechartsLine>
              </ResponsiveContainer>
            </Card>

            {/* Package Distribution */}
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-pink-400" />
                    Package Distribution
                  </h3>
                  <p className="text-sm text-white/60">Investment package popularity</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0b2e', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </Card>

            {/* Transaction Volume */}
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Transaction Volume
                  </h3>
                  <p className="text-sm text-white/60">By transaction type</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={transactionVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="type" stroke="#ffffff60" angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0b2e', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="volume" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </Card>

            {/* Platform Earnings Breakdown */}
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    Platform Earnings
                  </h3>
                  <p className="text-sm text-white/60">Revenue sources breakdown</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={platformEarnings}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {platformEarnings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0b2e', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </Card>

            {/* ROI Claims Activity */}
            <Card className="glass-effect border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    ROI Claims Activity
                  </h3>
                  <p className="text-sm text-white/60">3-hour interval claims</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBar data={roiClaimsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="hour" stroke="#ffffff60" />
                  <YAxis stroke="#ffffff60" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a0b2e', 
                      border: '1px solid #8b5cf6',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="claims" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="missed" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </RechartsBar>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* MLM Level Performance Table */}
          <Card className="glass-effect border-white/10 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  MLM Level Performance
                </h3>
                <p className="text-sm text-white/60">24-level commission breakdown</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 py-3 px-4">Level</th>
                    <th className="text-left text-white/60 py-3 px-4">Users</th>
                    <th className="text-left text-white/60 py-3 px-4">Volume</th>
                    <th className="text-left text-white/60 py-3 px-4">Commission</th>
                    <th className="text-left text-white/60 py-3 px-4">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {mlmLevelData.map((level, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white font-semibold">{level.level}</td>
                      <td className="py-3 px-4 text-white/80">{level.users.toLocaleString()}</td>
                      <td className="py-3 px-4 text-white/80">${level.volume.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-400 font-bold">${level.commission.toLocaleString()}</td>
                      <td className="py-3 px-4 text-purple-400">{level.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Active Users Timeline */}
          <Card className="glass-effect border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Active Users Timeline
                </h3>
                <p className="text-sm text-white/60">Real-time user activity (24h)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activeUsersData}>
                <defs>
                  <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTrading" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClaiming" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a0b2e', 
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area type="monotone" dataKey="online" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOnline)" />
                <Area type="monotone" dataKey="trading" stroke="#22c55e" fillOpacity={1} fill="url(#colorTrading)" />
                <Area type="monotone" dataKey="claiming" stroke="#eab308" fillOpacity={1} fill="url(#colorClaiming)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </>
  );
}