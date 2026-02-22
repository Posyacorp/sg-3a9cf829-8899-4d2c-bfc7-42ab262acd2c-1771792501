import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Activity,
  Download,
  FileText,
  Table,
  Eye,
  EyeOff,
  Copy,
  Mail,
  Search,
  Filter,
  CheckSquare,
  X,
  BarChart3,
  Shield,
  UserCog,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import Papa from "papaparse";
import { adminService } from "@/services/adminService";
import {
  exportToPDF,
  exportToCSV,
  exportMultipleToCSV,
  exportChartToPDF,
} from "@/lib/exportUtils";

type Period = "24h" | "7d" | "30d" | "90d" | "1y";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("7d");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [detailedUsers, setDetailedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const revenueChartRef = useRef(null);

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
    subscribeToRealtimeUpdates();
  }, [searchQuery, statusFilter, kycFilter, rankFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await adminService.getAllUsers({
        search: searchQuery,
        status: statusFilter,
        kycStatus: kycFilter,
        starRank: rankFilter,
      });
      setDetailedUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRealtimeUpdates = () => {
    const channel = adminService.subscribeToUserUpdates((payload) => {
      console.log("Real-time update:", payload);
      fetchUsers(); // Refresh user list on any change
    });

    return () => {
      adminService.unsubscribeFromUserUpdates(channel);
    };
  };

  const handleViewDetails = async (user: any) => {
    try {
      const userDetails = await adminService.getUserDetails(user.id);
      setSelectedUser(userDetails);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to load user details");
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "suspended" : "active";
      await adminService.updateUserStatus(userId, newStatus);
      alert(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status");
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      alert("Please select users and an action");
      return;
    }

    try {
      if (bulkAction === "activate" || bulkAction === "suspend") {
        await adminService.bulkUpdateStatus(selectedUsers, bulkAction === "activate" ? "active" : "suspended");
        alert(`${selectedUsers.length} users ${bulkAction}d successfully`);
      } else if (bulkAction === "delete") {
        if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`)) {
          await adminService.bulkDeleteUsers(selectedUsers);
          alert(`${selectedUsers.length} users deleted successfully`);
        }
      } else if (bulkAction === "export") {
        handleExportSelected();
      }
      
      setSelectedUsers([]);
      setBulkAction("");
      fetchUsers();
    } catch (error) {
      console.error("Error executing bulk action:", error);
      alert("Failed to execute bulk action");
    }
  };

  const handlePasswordReset = async () => {
    if (!selectedUser || !newPassword) return;
    
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await adminService.resetUserPassword(selectedUser.id, newPassword);
      alert("Password reset successfully!");
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password");
    }
  };

  const handleSendResetEmail = async () => {
    if (!selectedUser) return;

    try {
      const result = await adminService.sendPasswordResetEmail(selectedUser.email, selectedUser.id);
      alert(`Password reset email sent to ${result.email}\n\nReset link: ${result.resetLink}`);
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Failed to send reset email");
    }
  };

  const handleViewActivity = async (user: any) => {
    try {
      const activities = await adminService.getUserActivity(user.id);
      setUserActivities(activities);
      setSelectedUser(user);
      setShowActivityTimeline(true);
    } catch (error) {
      console.error("Error fetching activities:", error);
      alert("Failed to load activity timeline");
    }
  };

  const handleToggle2FA = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.toggle2FA(userId, !currentStatus);
      alert(`2FA ${!currentStatus ? "enabled" : "disabled"} successfully`);
      fetchUsers();
      if (selectedUser?.id === userId) {
        const updated = await adminService.getUserDetails(userId);
        setSelectedUser(updated);
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      alert("Failed to toggle 2FA");
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to impersonate this user? This action will be logged.")) {
      return;
    }

    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in as admin");
        return;
      }

      const impersonation = await adminService.createImpersonationToken(user.id, userId);
      
      // Store impersonation token in session storage
      sessionStorage.setItem("impersonation_token", impersonation.token);
      sessionStorage.setItem("impersonated_user_id", userId);
      
      alert("Impersonation started! You are now viewing as this user. Refresh the page to see their dashboard.");
      
      // Redirect to user dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error impersonating user:", error);
      alert("Failed to start impersonation");
    }
  };

  const handleRunFraudDetection = async (userId: string) => {
    try {
      const fraudReport = await adminService.detectFraud(userId);
      
      let alertMessage = `Fraud Detection Results for User:\n\n`;
      alertMessage += `Risk Score: ${fraudReport.riskScore}/100\n\n`;
      alertMessage += `Indicators:\n`;
      alertMessage += `- Suspicious Login Pattern: ${fraudReport.suspiciousLoginPattern ? "⚠️ YES" : "✅ NO"}\n`;
      alertMessage += `- Self Referral: ${fraudReport.selfReferral ? "⚠️ YES" : "✅ NO"}\n`;
      alertMessage += `- Rapid Withdrawals: ${fraudReport.rapidWithdrawals ? "⚠️ YES" : "✅ NO"}\n\n`;
      
      if (fraudReport.riskScore >= 50) {
        alertMessage += `🚨 HIGH RISK - Recommend immediate review and possible suspension`;
      } else if (fraudReport.riskScore >= 30) {
        alertMessage += `⚠️ MEDIUM RISK - Monitor closely`;
      } else {
        alertMessage += `✅ LOW RISK - No immediate action needed`;
      }
      
      alert(alertMessage);
    } catch (error) {
      console.error("Error running fraud detection:", error);
      alert("Failed to run fraud detection");
    }
  };

  const handleExportSelected = () => {
    const selectedUserData = detailedUsers.filter(u => selectedUsers.includes(u.id));
    
    const csvData = selectedUserData.map(user => ({
      "User ID": user.id,
      "Full Name": user.full_name,
      "Email": user.email,
      "Phone": user.phone || "N/A",
      "Referral Code": user.referral_code,
      "Status": user.status,
      "KYC Status": user.kyc_status,
      "Balance": user.current_balance || 0,
      "Total Deposits": user.total_deposits || 0,
      "Total Withdrawals": user.total_withdrawals || 0,
      "Star Rank": user.star_rank || "N/A",
      "Team Size": user.team_size || 0,
      "Team Volume": user.team_volume || 0,
      "Direct Referrals": user.direct_referrals || 0,
      "Total Commissions": user.total_commissions || 0,
      "2FA Enabled": user.two_factor_enabled ? "Yes" : "No",
      "Fraud Score": user.fraud_score || 0,
      "Flagged for Review": user.is_flagged_for_review ? "Yes" : "No",
      "Registration Date": user.created_at,
      "Last Login": user.last_login || "N/A",
    }));

    exportToCSV(csvData, `sui24_selected_users_${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportAllUsers = () => {
    const csvData = detailedUsers.map(user => ({
      "User ID": user.id,
      "Full Name": user.full_name,
      "Email": user.email,
      "Phone": user.phone || "N/A",
      "Referral Code": user.referral_code,
      "Status": user.status,
      "KYC Status": user.kyc_status,
      "Balance": user.current_balance || 0,
      "Total Deposits": user.total_deposits || 0,
      "Total Withdrawals": user.total_withdrawals || 0,
      "Star Rank": user.star_rank || "N/A",
      "Team Size": user.team_size || 0,
      "Team Volume": user.team_volume || 0,
      "Direct Referrals": user.direct_referrals || 0,
      "Total Commissions": user.total_commissions || 0,
      "2FA Enabled": user.two_factor_enabled ? "Yes" : "No",
      "Fraud Score": user.fraud_score || 0,
      "Flagged for Review": user.is_flagged_for_review ? "Yes" : "No",
      "Registration Date": user.created_at,
      "Last Login": user.last_login || "N/A",
    }));

    exportToCSV(csvData, `sui24_users_${new Date().toISOString().split("T")[0]}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  // Filter users based on search and filters
  const filteredUsers = detailedUsers;

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

  // Mock data for charts (will be replaced with real data)
  const revenueData = [
    { date: "Mon", deposits: 45000, withdrawals: 12000, net: 33000, adminFees: 2250 },
    { date: "Tue", deposits: 52000, withdrawals: 18000, net: 34000, adminFees: 2600 },
    { date: "Wed", deposits: 48000, withdrawals: 15000, net: 33000, adminFees: 2400 },
    { date: "Thu", deposits: 61000, withdrawals: 22000, net: 39000, adminFees: 3050 },
    { date: "Fri", deposits: 55000, withdrawals: 19000, net: 36000, adminFees: 2750 },
    { date: "Sat", deposits: 67000, withdrawals: 25000, net: 42000, adminFees: 3350 },
    { date: "Sun", deposits: 58000, withdrawals: 20000, net: 38000, adminFees: 2900 },
  ];

  const packageDistribution = [
    { name: "Package 1 (30 SUI)", users: 450, value: 45 },
    { name: "Package 2 (100 SUI)", users: 280, value: 28 },
    { name: "Package 3 (250 SUI)", users: 180, value: 18 },
    { name: "Package 4 (750 SUI)", users: 90, value: 9 },
  ];

  const transactionVolume = [
    { type: "Deposits", count: 1250, volume: 385000 },
    { type: "Withdrawals", count: 580, volume: 131000 },
    { type: "P2P Transfers", count: 340, volume: 45000 },
    { type: "ROI Claims", count: 2100, volume: 210000 },
    { type: "Commissions", count: 890, volume: 89000 },
  ];

  const mlmLevelData = Array.from({ length: 24 }, (_, i) => ({
    level: i + 1,
    users: Math.max(100 - i * 4, 5),
    volume: Math.max(50000 - i * 2000, 1000),
    commission: [3.0, 2.0, 1.0, 0.5, 0.5, 0.5, ...Array(12).fill(0.25), 0.5, 0.5, 0.5, 1.0, 2.0, 3.0][i],
  }));

  const platformEarnings = [
    { source: "5% Entry Fee", amount: 19250 },
    { source: "50% Withdrawal Tax", amount: 65500 },
    { source: "P2P Transfer Fee (1%)", amount: 450 },
    { source: "Trading Losses", amount: 12800 },
  ];

  const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

  // Export Handlers
  const handleExportFullReport = () => {
    if (revenueChartRef.current) {
      exportToPDF(
        [
          { title: "Key Metrics", data: [
            { Metric: "Total Users", Value: "1,234" },
            { Metric: "Total Volume", Value: "$860K" },
            { Metric: "Platform Earnings", Value: "$98K" },
            { Metric: "Active Packages", Value: "1,000" },
          ]},
          { title: "Revenue Analytics (Last 7 Days)", data: revenueData },
          { title: "Package Distribution", data: packageDistribution },
          { title: "Transaction Volume", data: transactionVolume },
          { title: "MLM Performance (24 Levels)", data: mlmLevelData },
          { title: "Platform Earnings Breakdown", data: platformEarnings },
        ],
        "SUI24 Admin Dashboard Report"
      );
    }
  };

  const handleExportAllData = () => {
    exportMultipleToCSV(
      [
        { name: "Revenue Analytics", data: revenueData },
        { name: "Package Distribution", data: packageDistribution },
        { name: "Transaction Volume", data: transactionVolume },
        { name: "MLM Performance", data: mlmLevelData },
        { name: "Platform Earnings", data: platformEarnings },
      ],
      "sui24_dashboard_data"
    );
  };

  const handleExportRevenueChart = () => {
    if (revenueChartRef.current) {
      exportChartToPDF(
        revenueChartRef.current,
        "Revenue Analytics - Last 7 Days",
        "sui24_revenue_chart"
      );
    }
  };

  return (
    <>
      <SEO
        title="Admin Dashboard - SUI24"
        description="Comprehensive admin control panel for SUI24 trading platform"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-purple-200 mt-2">Complete platform management and analytics</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-800">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-purple-800 to-purple-900 border-purple-700">
              <div className="flex items-center gap-4">
                <Users className="h-12 w-12 text-purple-400" />
                <div>
                  <p className="text-purple-300 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{detailedUsers.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-800 to-pink-900 border-pink-700">
              <div className="flex items-center gap-4">
                <DollarSign className="h-12 w-12 text-pink-400" />
                <div>
                  <p className="text-pink-300 text-sm">Total Volume</p>
                  <p className="text-3xl font-bold">$860K</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-800 to-pink-900 border-purple-700">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-12 w-12 text-purple-400" />
                <div>
                  <p className="text-purple-300 text-sm">Platform Earnings</p>
                  <p className="text-3xl font-bold">$98K</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-800 to-purple-900 border-pink-700">
              <div className="flex items-center gap-4">
                <Package className="h-12 w-12 text-pink-400" />
                <div>
                  <p className="text-pink-300 text-sm">Active Packages</p>
                  <p className="text-3xl font-bold">1,000</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Export Actions */}
          <Card className="p-6 bg-gradient-to-br from-purple-800/50 to-pink-800/50 border-purple-600">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Dashboard Data
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={handleExportFullReport}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Full Report (PDF)
                </Button>
                <Button
                  onClick={handleExportAllData}
                  variant="outline"
                  className="border-purple-400 text-purple-300 hover:bg-purple-800"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Export All Data (CSV)
                </Button>
                <Button
                  onClick={handleExportRevenueChart}
                  variant="outline"
                  className="border-pink-400 text-pink-300 hover:bg-pink-800"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Revenue Chart (PDF)
                </Button>
              </div>
            </div>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Analytics */}
            <Card className="p-6 bg-purple-900/50 border-purple-700" ref={revenueChartRef}>
              <h3 className="text-xl font-semibold mb-4">Revenue Analytics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9333ea" />
                  <XAxis dataKey="date" stroke="#e9d5ff" />
                  <YAxis stroke="#e9d5ff" />
                  <Tooltip contentStyle={{ backgroundColor: "#581c87", border: "1px solid #9333ea" }} />
                  <Legend />
                  <Line type="monotone" dataKey="deposits" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="withdrawals" stroke="#ec4899" strokeWidth={2} />
                  <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Package Distribution */}
            <Card className="p-6 bg-pink-900/50 border-pink-700">
              <h3 className="text-xl font-semibold mb-4">Package Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#831843", border: "1px solid #ec4899" }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Transaction Volume */}
            <Card className="p-6 bg-purple-900/50 border-purple-700">
              <h3 className="text-xl font-semibold mb-4">Transaction Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#9333ea" />
                  <XAxis dataKey="type" stroke="#e9d5ff" />
                  <YAxis stroke="#e9d5ff" />
                  <Tooltip contentStyle={{ backgroundColor: "#581c87", border: "1px solid #9333ea" }} />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" />
                  <Bar dataKey="volume" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Platform Earnings */}
            <Card className="p-6 bg-pink-900/50 border-pink-700">
              <h3 className="text-xl font-semibold mb-4">Platform Earnings Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformEarnings}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {platformEarnings.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#831843", border: "1px solid #ec4899" }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* User Management Section */}
          <Card className="p-6 bg-purple-900/50 border-purple-700">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  User Management
                </h3>
                <Button
                  onClick={handleExportAllUsers}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Users (CSV)
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-purple-800/50 border-purple-600 text-white placeholder:text-purple-400"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={kycFilter} onValueChange={setKycFilter}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Filter by KYC" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="all">All KYC</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not_verified">Not Verified</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rankFilter} onValueChange={setRankFilter}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Filter by rank" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="all">All Ranks</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7].map(rank => (
                      <SelectItem key={rank} value={`star_${rank}`}>Star {rank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-purple-800/50 border border-purple-600 rounded-lg">
                  <span className="text-purple-200">{selectedUsers.length} users selected</span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48 bg-purple-700 border-purple-500 text-white">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-800 border-purple-600">
                      <SelectItem value="activate">Activate</SelectItem>
                      <SelectItem value="suspend">Suspend</SelectItem>
                      <SelectItem value="export">Export Selected</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Execute
                  </Button>
                  <Button
                    onClick={() => setSelectedUsers([])}
                    variant="outline"
                    className="border-purple-400 text-purple-300 hover:bg-purple-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* User Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-800">
                    <tr>
                      <th className="p-3 text-left">
                        <Checkbox
                          checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={toggleSelectAll}
                          className="border-purple-400"
                        />
                      </th>
                      <th className="p-3 text-left">User Info</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Balance</th>
                      <th className="p-3 text-left">Team</th>
                      <th className="p-3 text-left">2FA</th>
                      <th className="p-3 text-left">Fraud</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-purple-300">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-purple-300">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-purple-700 hover:bg-purple-800/30">
                          <td className="p-3">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                              className="border-purple-400"
                            />
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-semibold">{user.full_name || "N/A"}</div>
                              <div className="text-xs text-purple-300">{user.email}</div>
                              <div className="text-xs text-purple-400">{user.referral_code}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <Badge
                                variant={user.status === "active" ? "default" : "destructive"}
                                className={
                                  user.status === "active"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                }
                              >
                                {user.status}
                              </Badge>
                              <div>
                                <Badge
                                  variant="outline"
                                  className={
                                    user.kyc_status === "verified"
                                      ? "border-green-500 text-green-400"
                                      : user.kyc_status === "pending"
                                      ? "border-yellow-500 text-yellow-400"
                                      : "border-red-500 text-red-400"
                                  }
                                >
                                  {user.kyc_status || "not_verified"}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-green-400">
                              ${user.current_balance?.toFixed(2) || "0.00"}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <div className="font-semibold">{user.star_rank || "N/A"}</div>
                              <div className="text-xs text-purple-300">{user.team_size || 0} users</div>
                              <div className="text-xs text-gray-500">${((user.team_volume || 0) / 1000).toFixed(0)}K</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={user.two_factor_enabled ? "default" : "outline"}
                              className={
                                user.two_factor_enabled
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "border-gray-500 text-gray-400"
                              }
                            >
                              {user.two_factor_enabled ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {user.two_factor_enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="text-sm font-semibold">
                                Score: {user.fraud_score || 0}/100
                              </div>
                              {user.is_flagged_for_review && (
                                <Badge variant="destructive" className="bg-red-600">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(user)}
                                className="border-purple-400 text-purple-300 hover:bg-purple-800"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewActivity(user)}
                                className="border-pink-400 text-pink-300 hover:bg-pink-800"
                                title="View Activity"
                              >
                                <Activity className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRunFraudDetection(user.id)}
                                className="border-red-400 text-red-300 hover:bg-red-800"
                                title="Run Fraud Detection"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={user.status === "active" ? "destructive" : "default"}
                                onClick={() => handleStatusToggle(user.id, user.status)}
                                className={
                                  user.status === "active"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                }
                              >
                                {user.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-center text-purple-300 text-sm">
                Showing {filteredUsers.length} of {detailedUsers.length} users
              </div>
            </div>
          </Card>
        </div>

        {/* User Details Dialog */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-4xl bg-purple-900 border-purple-700 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                User Details: {selectedUser?.full_name}
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                {/* Account Information */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-purple-300">User ID:</span>
                      <p className="font-mono text-xs">{selectedUser.id}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Email:</span>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Phone:</span>
                      <p>{selectedUser.phone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Registration Date:</span>
                      <p>{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Last Login:</span>
                      <p>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">IP Address:</span>
                      <p>{selectedUser.last_ip_address || "N/A"}</p>
                    </div>
                  </div>
                </Card>

                {/* Financial Summary */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-purple-300">Total Deposits:</span>
                      <p className="font-semibold text-green-400">${selectedUser.total_deposits || 0}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Total Withdrawals:</span>
                      <p className="font-semibold text-red-400">${selectedUser.total_withdrawals || 0}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Current Balance:</span>
                      <p className="font-semibold text-blue-400">${selectedUser.current_balance || 0}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Active Packages:</span>
                      <p className="font-semibold">{selectedUser.user_packages?.length || 0}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Total Commissions:</span>
                      <p className="font-semibold text-purple-400">${selectedUser.total_commissions || 0}</p>
                    </div>
                  </div>
                </Card>

                {/* Security Management */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security & Fraud Management
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Two-Factor Authentication</p>
                        <p className="text-xs text-purple-300">
                          {selectedUser.two_factor_enabled ? "Currently enabled" : "Currently disabled"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleToggle2FA(selectedUser.id, selectedUser.two_factor_enabled)}
                        className={
                          selectedUser.two_factor_enabled
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }
                      >
                        {selectedUser.two_factor_enabled ? "Disable 2FA" : "Enable 2FA"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Fraud Risk Score</p>
                        <p className="text-xs text-purple-300">
                          Current score: {selectedUser.fraud_score || 0}/100
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRunFraudDetection(selectedUser.id)}
                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Run Fraud Detection
                      </Button>
                    </div>

                    {selectedUser.is_flagged_for_review && (
                      <Alert className="bg-red-900/50 border-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This user has been flagged for review due to suspicious activity patterns.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </Card>

                {/* Password Management */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Password Management
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-purple-300">Current Password Hash:</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={selectedUser.password_hash || "hashed_password_***"}
                          readOnly
                          className="bg-purple-700/50 border-purple-600 text-white"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setShowPassword(!showPassword)}
                          className="border-purple-500"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-purple-300">Reset Password:</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="password"
                          placeholder="Enter new password (min 6 chars)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-purple-700/50 border-purple-600 text-white"
                        />
                        <Button
                          onClick={handlePasswordReset}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Button
                        onClick={handleSendResetEmail}
                        variant="outline"
                        className="w-full border-purple-400 text-purple-300 hover:bg-purple-800"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Password Reset Email
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Referral Information */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Referral Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-purple-300">Referral Code:</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={selectedUser.referral_code || "N/A"}
                          readOnly
                          className="bg-purple-700/50 border-purple-600 text-white"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedUser.referral_code, "Referral code")}
                          className="border-purple-500"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-purple-300">Referral Link:</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={`https://sui24.trade?ref=${selectedUser.referral_code}`}
                          readOnly
                          className="bg-purple-700/50 border-purple-600 text-white"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(`https://sui24.trade?ref=${selectedUser.referral_code}`, "Referral link")}
                          className="border-purple-500"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-purple-300">Direct Referrals:</span>
                        <p className="font-semibold text-lg">{selectedUser.direct_referrals || 0}</p>
                      </div>
                      <div>
                        <span className="text-purple-300">Total Team Size:</span>
                        <p className="font-semibold text-lg">{selectedUser.team_size || 0}</p>
                      </div>
                      <div>
                        <span className="text-purple-300">Team Volume:</span>
                        <p className="font-semibold text-lg text-green-400">${selectedUser.team_volume || 0}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* MLM Performance */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    MLM Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-purple-300">Star Rank:</span>
                      <p className="font-semibold text-lg text-yellow-400">{selectedUser.star_rank || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-purple-300">Total Commissions Earned:</span>
                      <p className="font-semibold text-lg text-green-400">${selectedUser.total_commissions || 0}</p>
                    </div>
                  </div>
                </Card>

                {/* Admin Actions */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Admin Actions
                  </h4>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleImpersonateUser(selectedUser.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Login as User (Impersonate)
                    </Button>
                    <Button
                      onClick={() => handleStatusToggle(selectedUser.id, selectedUser.status)}
                      className={
                        selectedUser.status === "active"
                          ? "flex-1 bg-red-600 hover:bg-red-700"
                          : "flex-1 bg-green-600 hover:bg-green-700"
                      }
                    >
                      {selectedUser.status === "active" ? "Suspend Account" : "Activate Account"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Activity Timeline Dialog */}
        <Dialog open={showActivityTimeline} onOpenChange={setShowActivityTimeline}>
          <DialogContent className="max-w-4xl bg-purple-900 border-purple-700 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Activity Timeline: {selectedUser?.full_name}
              </DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                {/* User Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-purple-800/50 border-purple-700">
                    <p className="text-sm text-purple-300">Total Deposits</p>
                    <p className="text-2xl font-bold text-green-400">${selectedUser.total_deposits || 0}</p>
                  </Card>
                  <Card className="p-4 bg-purple-800/50 border-purple-700">
                    <p className="text-sm text-purple-300">Total Commissions</p>
                    <p className="text-2xl font-bold text-purple-400">${selectedUser.total_commissions || 0}</p>
                  </Card>
                  <Card className="p-4 bg-purple-800/50 border-purple-700">
                    <p className="text-sm text-purple-300">Direct Referrals</p>
                    <p className="text-2xl font-bold text-pink-400">{selectedUser.direct_referrals || 0}</p>
                  </Card>
                </div>

                {/* Activity Breakdown */}
                <Card className="p-4 bg-purple-800/50 border-purple-700">
                  <h4 className="text-lg font-semibold mb-3">Activity Breakdown</h4>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-purple-300">Logins</p>
                      <p className="font-semibold">{userActivities.filter(a => a.activity_type === "login").length}</p>
                    </div>
                    <div>
                      <p className="text-purple-300">Deposits</p>
                      <p className="font-semibold">{userActivities.filter(a => a.activity_type === "deposit").length}</p>
                    </div>
                    <div>
                      <p className="text-purple-300">ROI Claims</p>
                      <p className="font-semibold">{userActivities.filter(a => a.activity_type === "roi_claim").length}</p>
                    </div>
                    <div>
                      <p className="text-purple-300">Withdrawals</p>
                      <p className="font-semibold">{userActivities.filter(a => a.activity_type === "withdrawal").length}</p>
                    </div>
                  </div>
                </Card>

                {/* Timeline */}
                <div className="space-y-3">
                  {userActivities.length === 0 ? (
                    <Card className="p-8 bg-purple-800/30 border-purple-700 text-center">
                      <Clock className="h-12 w-12 mx-auto text-purple-400 mb-2" />
                      <p className="text-purple-300">No activity recorded yet</p>
                    </Card>
                  ) : (
                    userActivities.map((activity, index) => (
                      <Card key={index} className="p-4 bg-purple-800/50 border-purple-700">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${
                            activity.activity_type === "login" ? "bg-blue-600" :
                            activity.activity_type === "deposit" ? "bg-green-600" :
                            activity.activity_type === "withdrawal" ? "bg-red-600" :
                            activity.activity_type === "roi_claim" ? "bg-yellow-600" :
                            activity.activity_type === "commission" ? "bg-purple-600" :
                            "bg-gray-600"
                          }`}>
                            <Activity className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold">{activity.description}</p>
                                <p className="text-sm text-purple-300">
                                  {new Date(activity.created_at).toLocaleString()}
                                </p>
                              </div>
                              <Badge className={
                                activity.activity_type === "login" ? "bg-blue-600" :
                                activity.activity_type === "deposit" ? "bg-green-600" :
                                activity.activity_type === "withdrawal" ? "bg-red-600" :
                                activity.activity_type === "roi_claim" ? "bg-yellow-600" :
                                activity.activity_type === "commission" ? "bg-purple-600" :
                                "bg-gray-600"
                              }>
                                {activity.activity_type}
                              </Badge>
                            </div>
                            {activity.metadata && (
                              <div className="mt-2 text-xs text-purple-400">
                                {JSON.stringify(activity.metadata)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                <Button
                  onClick={() => {
                    const csvData = userActivities.map(a => ({
                      "Timestamp": new Date(a.created_at).toLocaleString(),
                      "Activity Type": a.activity_type,
                      "Description": a.description,
                      "IP Address": a.ip_address || "N/A",
                    }));
                    exportToCSV(csvData, `sui24_user_activity_${selectedUser.id}_${new Date().toISOString().split("T")[0]}`);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Activity Timeline (CSV)
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}