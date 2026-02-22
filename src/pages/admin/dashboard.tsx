import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
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
  LineChart,
  FileText,
  Table as TableIcon,
  EyeOff,
  Copy,
  Key,
  Link as LinkIcon,
  UserCog,
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
import {
  exportDashboardToPDF,
  exportToCSV,
  exportMultipleToCSV,
  exportChartToPDF,
} from "@/lib/exportUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d" | "90d" | "1y">("7d");
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Bulk operations state
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "activate" | "delete" | "export" | "">("");
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [filterKYC, setFilterKYC] = useState<"all" | "verified" | "pending" | "not_verified">("all");
  const [filterRank, setFilterRank] = useState<"all" | "star1" | "star2" | "star3" | "star4" | "star5" | "star6" | "star7">("all");
  
  // Activity timeline state
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);
  const [userActivities, setUserActivities] = useState<any[]>([]);

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

  // Enhanced user data with passwords and referral info
  const usersData = [
    {
      id: "1",
      email: "user1@example.com",
      full_name: "John Doe",
      password: "hashed_password_123",
      referral_code: "JOHN2024",
      referral_link: "https://sui24.trade?ref=JOHN2024",
      phone: "+1 234 567 8900",
      created_at: "2026-01-15",
      status: "active",
      kyc_status: "verified",
      total_deposits: 5000,
      total_withdrawals: 2000,
      current_balance: 3500,
      active_packages: 2,
      team_size: 45,
      team_volume: 125000,
      total_commissions: 8500,
      star_rank: "Star 3",
      direct_referrals: 12,
      ip_address: "192.168.1.1",
      last_login: "2026-02-22 08:30:00",
    },
    {
      id: "2",
      email: "user2@example.com",
      full_name: "Jane Smith",
      password: "hashed_password_456",
      referral_code: "JANE2024",
      referral_link: "https://sui24.trade?ref=JANE2024",
      phone: "+1 234 567 8901",
      created_at: "2026-01-18",
      status: "active",
      kyc_status: "pending",
      total_deposits: 2500,
      total_withdrawals: 500,
      current_balance: 2200,
      active_packages: 1,
      team_size: 28,
      team_volume: 75000,
      total_commissions: 4200,
      star_rank: "Star 2",
      direct_referrals: 8,
      ip_address: "192.168.1.2",
      last_login: "2026-02-22 09:15:00",
    },
    {
      id: "3",
      email: "user3@example.com",
      full_name: "Mike Johnson",
      password: "hashed_password_789",
      referral_code: "MIKE2024",
      referral_link: "https://sui24.trade?ref=MIKE2024",
      phone: "+1 234 567 8902",
      created_at: "2026-01-20",
      status: "suspended",
      kyc_status: "verified",
      total_deposits: 10000,
      total_withdrawals: 8000,
      current_balance: 2500,
      active_packages: 3,
      team_size: 67,
      team_volume: 250000,
      total_commissions: 15000,
      star_rank: "Star 4",
      direct_referrals: 15,
      ip_address: "192.168.1.3",
      last_login: "2026-02-20 14:20:00",
    },
  ];

  // User activity timeline data
  const getUserActivities = (userId: string) => {
    return [
      { id: 1, type: "login", description: "Logged in from 192.168.1.1", timestamp: "2026-02-22 09:30:00", icon: "🔐" },
      { id: 2, type: "deposit", description: "Deposited 100 SUI ($90)", timestamp: "2026-02-22 09:25:00", icon: "💰" },
      { id: 3, type: "package", description: "Purchased Package 2 (100 SUI)", timestamp: "2026-02-22 09:26:00", icon: "📦" },
      { id: 4, type: "roi_claim", description: "Claimed ROI: 5.2 SUI", timestamp: "2026-02-22 06:15:00", icon: "🎁" },
      { id: 5, type: "commission", description: "Earned L1 commission: 3 SUI from user #1234", timestamp: "2026-02-22 05:00:00", icon: "💵" },
      { id: 6, type: "p2p", description: "Sent 20 SUI to user@example.com", timestamp: "2026-02-21 18:30:00", icon: "🔄" },
      { id: 7, type: "withdrawal", description: "Withdrew 50 SUI (Pending)", timestamp: "2026-02-21 15:00:00", icon: "📤" },
      { id: 8, type: "kyc", description: "KYC verification completed", timestamp: "2026-02-20 12:00:00", icon: "✅" },
      { id: 9, type: "referral", description: "New referral: jane.doe@example.com", timestamp: "2026-02-20 10:30:00", icon: "👥" },
      { id: 10, type: "signup", description: "Account created", timestamp: "2026-02-15 14:20:00", icon: "🎉" },
    ];
  };

  // Filter and search users
  const filteredUsers = usersData.filter(user => {
    // Search query filter
    const matchesSearch = searchQuery === "" || 
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.referral_code.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    
    // KYC filter
    const matchesKYC = filterKYC === "all" || user.kyc_status === filterKYC;
    
    // Rank filter
    const matchesRank = filterRank === "all" || user.star_rank.toLowerCase().replace(" ", "") === filterRank;
    
    return matchesSearch && matchesStatus && matchesKYC && matchesRank;
  });

  // Bulk operations handlers
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const executeBulkAction = () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    switch (bulkAction) {
      case "suspend":
        alert(`Suspending ${selectedUsers.length} users...`);
        setSelectedUsers([]);
        break;
      case "activate":
        alert(`Activating ${selectedUsers.length} users...`);
        setSelectedUsers([]);
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`)) {
          alert(`Deleting ${selectedUsers.length} users...`);
          setSelectedUsers([]);
        }
        break;
      case "export":
        exportSelectedUsersToCSV();
        break;
    }
    setBulkAction("");
  };

  const exportSelectedUsersToCSV = () => {
    const selectedUserData = usersData.filter(u => selectedUsers.includes(u.id));
    const csvData = selectedUserData.map(user => ({
      "User ID": user.id,
      "Full Name": user.full_name,
      "Email": user.email,
      "Phone": user.phone,
      "Referral Code": user.referral_code,
      "Status": user.status,
      "KYC Status": user.kyc_status,
      "Balance": user.current_balance,
      "Total Deposits": user.total_deposits,
      "Total Withdrawals": user.total_withdrawals,
      "Star Rank": user.star_rank,
      "Team Size": user.team_size,
      "Team Volume": user.team_volume,
      "Direct Referrals": user.direct_referrals,
      "Total Commissions": user.total_commissions,
      "Registered": user.created_at,
      "Last Login": user.last_login,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sui24_selected_users_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSelectedUsers([]);
  };

  const exportAllUsersToCSV = () => {
    const csvData = filteredUsers.map(user => ({
      "User ID": user.id,
      "Full Name": user.full_name,
      "Email": user.email,
      "Phone": user.phone,
      "Referral Code": user.referral_code,
      "Status": user.status,
      "KYC Status": user.kyc_status,
      "Balance": user.current_balance,
      "Total Deposits": user.total_deposits,
      "Total Withdrawals": user.total_withdrawals,
      "Star Rank": user.star_rank,
      "Team Size": user.team_size,
      "Team Volume": user.team_volume,
      "Direct Referrals": user.direct_referrals,
      "Total Commissions": user.total_commissions,
      "Registered": user.created_at,
      "Last Login": user.last_login,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sui24_all_users_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendPasswordResetEmail = (user: any) => {
    alert(`Password reset email sent to ${user.email}!\n\nReset Link: https://sui24.trade/reset-password?token=${user.id}_reset_token\n\nThe user will receive an email with instructions to reset their password.`);
  };

  const openActivityTimeline = (user: any) => {
    setSelectedUser(user);
    setUserActivities(getUserActivities(user.id));
    setShowActivityTimeline(true);
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setShowPassword(false);
    setNewPassword("");
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handlePasswordReset = () => {
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    alert(`Password reset for ${selectedUser?.email}`);
    setNewPassword("");
    setShowUserModal(false);
  };

  const handleResetPassword = () => {
    // Deprecated in favor of handlePasswordReset, keeping for compatibility if referenced
    handlePasswordReset();
  };

  // Export Handlers
  const handleExportFullPDF = async () => {
    await exportDashboardToPDF(
      {
        totalUsers: 12847,
        totalVolume: "$4.5M",
        platformEarnings: "$226,150",
        activePackages: 3421,
      },
      revenueData,
      userGrowthData,
      packageDistribution,
      transactionVolume,
      mlmLevelData,
      platformEarnings,
      "sui24_admin_dashboard"
    );
  };

  const handleExportAllCSV = () => {
    exportMultipleToCSV(
      [
        { name: "Revenue Analytics", data: revenueData },
        { name: "User Growth", data: userGrowthData },
        { name: "Package Distribution", data: packageDistribution },
        { name: "Transaction Volume", data: transactionVolume },
        { name: "MLM Performance", data: mlmLevelData },
        { name: "Platform Earnings", data: platformEarnings },
      ],
      "sui24_dashboard_data"
    );
  };

  const handleExportRevenuePDF = async () => {
    if (revenueChartRef.current) {
      await exportChartToPDF(
        revenueChartRef.current,
        "Revenue Analytics - Last 7 Days",
        "sui24_revenue_chart"
      );
    }
  };

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
              {(["24h", "7d", "30d", "90d", "1y"] as const).map((period) => (
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

          {/* Export Actions */}
          <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">📊 Export Dashboard Data</h3>
                <p className="text-sm text-gray-400">Download reports in PDF or CSV format</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleExportFullPDF}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Full Report (PDF)
                </Button>
                
                <Button
                  onClick={handleExportAllCSV}
                  variant="outline"
                  className="border-purple-500/30 hover:bg-purple-500/10"
                >
                  <TableIcon className="w-4 h-4 mr-2" />
                  Export All Data (CSV)
                </Button>
                
                <Button
                  onClick={handleExportRevenuePDF}
                  variant="outline"
                  className="border-pink-500/30 hover:bg-pink-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Revenue Chart (PDF)
                </Button>
              </div>
            </div>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Analytics */}
            <Card className="p-6 col-span-2" ref={revenueChartRef}>
              <h3 className="text-lg font-semibold mb-4">💰 Revenue Analytics</h3>
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
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
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

          {/* User Management Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">User Management</h3>
              <Button onClick={exportAllUsersToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export All Users (CSV)
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {/* Search */}
              <div className="md:col-span-2">
                <Input
                  placeholder="Search by name, email, or referral code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* KYC Filter */}
              <select
                value={filterKYC}
                onChange={(e) => setFilterKYC(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
              >
                <option value="all">All KYC</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="not_verified">Not Verified</option>
              </select>

              {/* Rank Filter */}
              <select
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm"
              >
                <option value="all">All Ranks</option>
                <option value="star1">Star 1</option>
                <option value="star2">Star 2</option>
                <option value="star3">Star 3</option>
                <option value="star4">Star 4</option>
                <option value="star5">Star 5</option>
                <option value="star6">Star 6</option>
                <option value="star7">Star 7</option>
              </select>
            </div>

            {/* Bulk Actions Bar */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-4 mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as any)}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm"
                >
                  <option value="">Choose Action...</option>
                  <option value="activate">Activate</option>
                  <option value="suspend">Suspend</option>
                  <option value="export">Export Selected</option>
                  <option value="delete">Delete</option>
                </select>
                {bulkAction && (
                  <Button onClick={executeBulkAction} size="sm" variant="default">
                    Execute
                  </Button>
                )}
                <Button onClick={() => setSelectedUsers([])} size="sm" variant="outline">
                  Clear Selection
                </Button>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="text-left p-3">User Info</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Balance</th>
                    <th className="text-left p-3">Team</th>
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500">Ref: {user.referral_code}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status}
                          </Badge>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              user.kyc_status === "verified"
                                ? "bg-blue-500/20 text-blue-400"
                                : user.kyc_status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {user.kyc_status}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">${user.current_balance.toLocaleString()}</td>
                      <td className="p-3 text-sm">
                        <div>{user.team_size} users</div>
                        <div className="text-gray-400">${(user.team_volume / 1000).toFixed(0)}K</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{user.star_rank}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                          >
                            👤
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openActivityTimeline(user)}
                          >
                            📊
                          </Button>
                          <Button
                            size="sm"
                            variant={user.status === "active" ? "destructive" : "default"}
                            onClick={() => alert(`User ${user.status === "active" ? "suspended" : "activated"}`)}
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredUsers.length} of {usersData.length} users
            </div>
          </Card>

          {/* User Details Modal */}
          <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-purple-400">
                  User Details - {selectedUser?.full_name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Manage user account, password, and referral information
                </DialogDescription>
              </DialogHeader>

              {selectedUser && (
                <div className="space-y-6 mt-4">
                  {/* Account Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 bg-gray-800 border-gray-700">
                      <h4 className="font-semibold mb-3 text-purple-400">Account Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">User ID:</span>
                          <span>{selectedUser.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Phone:</span>
                          <span>{selectedUser.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span>{selectedUser.created_at}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Login:</span>
                          <span className="text-xs">{selectedUser.last_login}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">IP Address:</span>
                          <span>{selectedUser.ip_address}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gray-800 border-gray-700">
                      <h4 className="font-semibold mb-3 text-purple-400">Financial Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Deposits:</span>
                          <span className="text-green-400">${selectedUser.total_deposits.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Withdrawals:</span>
                          <span className="text-red-400">${selectedUser.total_withdrawals.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Balance:</span>
                          <span className="text-blue-400 font-bold">${selectedUser.current_balance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Packages:</span>
                          <span>{selectedUser.active_packages}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Commissions:</span>
                          <span className="text-purple-400">${selectedUser.total_commissions.toLocaleString()}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Password Management */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span>🔐</span> Password Management
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Current Password Hash</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={selectedUser.password_hash}
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "🙈" : "👁"}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Reset Password</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="password"
                            placeholder="Enter new password..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handlePasswordReset}>
                            Reset
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => sendPasswordResetEmail(selectedUser)}
                      >
                        📧 Send Password Reset Email
                      </Button>
                    </div>
                  </Card>

                  {/* Referral Information */}
                  <Card className="p-4 bg-gray-800 border-gray-700">
                    <h4 className="font-semibold mb-3 text-purple-400 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      Referral Information
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-400">Referral Code</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={selectedUser.referral_code}
                            readOnly
                            className="bg-gray-900 border-gray-700 font-mono"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyText(selectedUser.referral_code)}
                            className="border-purple-500/50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-400">Referral Link</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={selectedUser.referral_link}
                            readOnly
                            className="bg-gray-900 border-gray-700 text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyText(selectedUser.referral_link)}
                            className="border-purple-500/50"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center p-3 bg-gray-900 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">{selectedUser.direct_referrals}</div>
                          <div className="text-xs text-gray-400">Direct Referrals</div>
                        </div>
                        <div className="text-center p-3 bg-gray-900 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{selectedUser.team_size}</div>
                          <div className="text-xs text-gray-400">Total Team Size</div>
                        </div>
                        <div className="text-center p-3 bg-gray-900 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">
                            ${(selectedUser.team_volume / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-400">Team Volume</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* MLM Performance */}
                  <Card className="p-4 bg-gray-800 border-gray-700">
                    <h4 className="font-semibold mb-3 text-purple-400">MLM Performance</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 text-sm">Star Rank:</span>
                        <div className="text-xl font-bold text-purple-400 mt-1">{selectedUser.star_rank}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-sm">Total Commissions Earned:</span>
                        <div className="text-xl font-bold text-green-400 mt-1">
                          ${selectedUser.total_commissions.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Activity Timeline Dialog */}
              <Dialog open={showActivityTimeline} onOpenChange={setShowActivityTimeline}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span>📊</span>
                      Activity Timeline - {selectedUser?.full_name}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {selectedUser && (
                    <div className="space-y-4">
                      {/* User Summary */}
                      <Card className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/20">
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-purple-400">{userActivities.length}</div>
                            <div className="text-xs text-gray-400">Total Activities</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-400">{selectedUser.total_deposits}</div>
                            <div className="text-xs text-gray-400">Total Deposits</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-400">{selectedUser.total_commissions}</div>
                            <div className="text-xs text-gray-400">Commissions</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-pink-400">{selectedUser.direct_referrals}</div>
                            <div className="text-xs text-gray-400">Referrals</div>
                          </div>
                        </div>
                      </Card>

                      {/* Timeline */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-400">Recent Activity</h4>
                        {userActivities.map((activity, index) => (
                          <div key={activity.id} className="flex gap-4 items-start">
                            {/* Icon */}
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
                              {activity.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium capitalize">{activity.type.replace("_", " ")}</div>
                                <div className="text-xs text-gray-500">{activity.timestamp}</div>
                              </div>
                              <div className="text-sm text-gray-400 mt-1">{activity.description}</div>
                            </div>

                            {/* Connector Line */}
                            {index < userActivities.length - 1 && (
                              <div className="absolute left-[1.25rem] mt-12 w-0.5 h-8 bg-gradient-to-b from-purple-500/50 to-transparent" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Activity Stats */}
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3 text-sm">Activity Breakdown</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span className="text-gray-400">Logins</span>
                            <span className="font-medium">1</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span className="text-gray-400">Deposits</span>
                            <span className="font-medium">1</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span className="text-gray-400">ROI Claims</span>
                            <span className="font-medium">1</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span className="text-gray-400">Commissions</span>
                            <span className="font-medium">1</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span className="text-gray-400">P2P Transfers</span>
                            <span className="font-medium">1</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                            <span className="text-gray-400">Withdrawals</span>
                            <span className="font-medium">1</span>
                          </div>
                        </div>
                      </Card>

                      {/* Export Timeline */}
                      <Button
                        onClick={() => {
                          const csvData = userActivities.map(a => ({
                            "Type": a.type,
                            "Description": a.description,
                            "Timestamp": a.timestamp,
                          }));
                          const csv = Papa.unparse(csvData);
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `${selectedUser.full_name}_activity_${new Date().toISOString().split("T")[0]}.csv`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Activity Timeline (CSV)
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}