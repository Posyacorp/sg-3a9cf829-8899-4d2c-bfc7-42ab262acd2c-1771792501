import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { useRouter } from "next/router";
import { authService } from "@/services/authService";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Shield,
  Search,
  Download,
  Settings,
  BarChart3,
  FileText,
  Trash2,
  X,
  Star,
  Bookmark,
  Save,
  Globe,
  Play,
  Table,
} from "lucide-react";

type Period = "24h" | "7d" | "30d" | "90d" | "1y";

export default function AdminDashboard() {
  const router = useRouter();
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
  const [sortBy, setSortBy] = useState<"date" | "balance" | "team_volume" | "earnings">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const revenueChartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null); // Renamed from user to avoid confusion
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]); // Added users state
  const [showBulkActionModal, setShowBulkActionModal] = useState(false); // Added missing state

  // New bulk action states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkModalType, setBulkModalType] = useState<"credit" | "debit" | "kyc" | "role" | "rank" | "2fa" | "notify" | null>(null);
  const [bulkAmount, setBulkAmount] = useState<string | number>("");
  const [bulkWalletType, setBulkWalletType] = useState("main_wallet");
  const [bulkKycStatus, setBulkKycStatus] = useState("verified");
  const [bulkRole, setBulkRole] = useState("user");
  const [bulkStarRank, setBulkStarRank] = useState("1");
  const [bulk2FAEnabled, setBulk2FAEnabled] = useState(true);
  const [bulkNotificationTitle, setBulkNotificationTitle] = useState("");
  const [bulkNotificationMessage, setBulkNotificationMessage] = useState("");

  // Filter Preset states
  const [filterPresets, setFilterPresets] = useState<any[]>([]);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [showManagePresetsDialog, setShowManagePresetsDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetIsPublic, setNewPresetIsPublic] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const filters = {
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
        kycStatus: kycFilter !== "all" ? kycFilter : undefined,
        starRank: rankFilter !== "all" ? rankFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        dateRange: dateRangeFilter !== "all" ? dateRangeFilter : undefined,
        sortBy,
        sortOrder,
      };
      const users = await adminService.getAllUsers(filters);
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch filter presets
  const fetchFilterPresets = async () => {
    if (!currentUser?.id) return;
    try {
      const presets = await adminService.getFilterPresets(currentUser.id);
      setFilterPresets(presets);
    } catch (error) {
      console.error("Error fetching filter presets:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFilterPresets();
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, statusFilter, kycFilter, rankFilter, roleFilter, dateRangeFilter, sortBy, sortOrder, isAdmin]);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const user = await authService.getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has admin or master_admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "master_admin")) {
      router.push("/dashboard");
      return;
    }

    setIsAdmin(true);
    setCurrentUser(user);
    setLoading(false);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await fetchUsers();
      // Here you would typically fetch other dashboard metrics
      // For now we're using mock data for charts, but users are real
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, selectedPeriod]);

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
      switch (bulkAction) {
        case "activate":
        case "suspend":
          await adminService.bulkUpdateStatus(selectedUsers, bulkAction === "activate" ? "active" : "suspended");
          alert(`${selectedUsers.length} users ${bulkAction}d successfully`);
          break;
        
        case "delete":
          if (confirm(`Are you sure you want to delete ${selectedUsers.length} users? This cannot be undone.`)) {
            await adminService.bulkDeleteUsers(selectedUsers);
            alert(`${selectedUsers.length} users deleted successfully`);
          } else {
            return;
          }
          break;
        
        case "export":
          handleExportSelected();
          return; // Don't refresh or clear selection
        
        case "verify_kyc":
          setBulkModalType("kyc");
          setShowBulkModal(true);
          return;
        
        case "change_role":
          setBulkModalType("role");
          setShowBulkModal(true);
          return;
        
        case "update_rank":
          setBulkModalType("rank");
          setShowBulkModal(true);
          return;
        
        case "toggle_2fa":
          setBulkModalType("2fa");
          setShowBulkModal(true);
          return;
        
        case "credit_wallet":
          setBulkModalType("credit");
          setShowBulkModal(true);
          return;
        
        case "debit_wallet":
          setBulkModalType("debit");
          setShowBulkModal(true);
          return;
        
        case "send_notification":
          setBulkModalType("notify");
          setShowBulkModal(true);
          return;
        
        default:
          alert("Unknown action");
          return;
      }
      
      setSelectedUsers([]);
      setBulkAction("");
      fetchUsers();
    } catch (error) {
      console.error("Error executing bulk action:", error);
      alert("Failed to execute bulk action");
    }
  };

  const handleBulkModalAction = async () => {
    try {
      setShowBulkActionModal(false);

      switch (bulkAction) {
        case "activate":
          await adminService.bulkUpdateStatus(selectedUsers, "active");
          break;
        case "suspend":
          await adminService.bulkUpdateStatus(selectedUsers, "suspended");
          break;
        case "ban":
          await adminService.bulkUpdateStatus(selectedUsers, "banned");
          break;
        case "verify_kyc":
          await adminService.bulkUpdateKYCStatus(selectedUsers, "verified");
          break;
        case "reject_kyc":
          await adminService.bulkUpdateKYCStatus(selectedUsers, "rejected");
          break;
        case "reset_kyc":
          await adminService.bulkUpdateKYCStatus(selectedUsers, "not_verified");
          break;
        case "promote_admin":
          await adminService.bulkUpdateRole(selectedUsers, "admin");
          break;
        case "promote_master":
          await adminService.bulkUpdateRole(selectedUsers, "master_admin");
          break;
        case "demote_user":
          await adminService.bulkUpdateRole(selectedUsers, "user");
          break;
        case "credit":
          if (!bulkAmount || Number(bulkAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
          }
          await adminService.bulkCreditWallet(selectedUsers, Number(bulkAmount), bulkWalletType);
          alert(`${bulkAmount} SUI credited to ${bulkWalletType} for ${selectedUsers.length} users`);
          break;
        
        case "debit":
          if (!bulkAmount || Number(bulkAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
          }
          await adminService.bulkDebitWallet(selectedUsers, Number(bulkAmount), bulkWalletType);
          alert(`${bulkAmount} SUI debited from ${bulkWalletType} for ${selectedUsers.length} users`);
          break;
        
        case "enable_2fa":
          await adminService.bulkToggle2FA(selectedUsers, true);
          break;
        case "disable_2fa":
          await adminService.bulkToggle2FA(selectedUsers, false);
          break;
        case "update_rank":
          if (bulkStarRank) {
            await adminService.bulkUpdateStarRank(selectedUsers, parseInt(bulkStarRank));
          }
          break;
        case "send_notification":
          if (bulkNotificationTitle && bulkNotificationMessage) {
            await adminService.bulkSendNotification(
              selectedUsers,
              bulkNotificationTitle,
              bulkNotificationMessage
            );
          }
          break;
        case "delete":
          await adminService.bulkDeleteUsers(selectedUsers);
          break;
      }

      // Reset states
      setSelectedUsers([]);
      setBulkAction("");
      setBulkAmount("");
      setBulkWalletType("");
      setBulkStarRank("");
      setBulkNotificationTitle("");
      setBulkNotificationMessage("");
      
      // Refresh users
      fetchUsers();
      alert("Bulk action completed successfully!");
    } catch (error) {
      console.error("Error executing bulk modal action:", error);
      alert("Failed to execute action");
    }
  };

  // ==================== FILTER PRESET HANDLERS ====================

  // Apply a saved preset
  const applyFilterPreset = (preset: any) => {
    const filters = preset.filters;
    setSearchQuery(filters.search || "");
    setStatusFilter(filters.statusFilter || "all");
    setKycFilter(filters.kycFilter || "all");
    setRankFilter(filters.rankFilter || "all");
    setRoleFilter(filters.roleFilter || "all");
    setDateRangeFilter(filters.dateRangeFilter || "all");
    setSortBy(filters.sortBy || "created_at");
    setSortOrder(filters.sortOrder || "desc");
  };

  // Save current filters as a preset
  const handleSavePreset = async () => {
    if (!newPresetName.trim() || !currentUser?.id) {
      alert("Please enter a preset name");
      return;
    }

    try {
      const currentFilters = {
        search: searchQuery,
        statusFilter,
        kycFilter,
        rankFilter,
        roleFilter,
        dateRangeFilter,
        sortBy,
        sortOrder,
      };

      await adminService.saveFilterPreset(
        currentUser.id,
        newPresetName,
        currentFilters,
        newPresetIsPublic
      );

      setShowSavePresetDialog(false);
      setNewPresetName("");
      setNewPresetIsPublic(false);
      fetchFilterPresets();
      alert("Filter preset saved successfully!");
    } catch (error) {
      console.error("Error saving preset:", error);
      alert("Failed to save preset");
    }
  };

  // Update an existing preset
  const handleUpdatePreset = async (presetId: string, updates: any) => {
    try {
      await adminService.updateFilterPreset(presetId, updates);
      fetchFilterPresets();
      alert("Preset updated successfully!");
    } catch (error) {
      console.error("Error updating preset:", error);
      alert("Failed to update preset");
    }
  };

  // Delete a preset
  const handleDeletePreset = async (presetId: string) => {
    if (!confirm("Are you sure you want to delete this preset?")) return;

    try {
      await adminService.deleteFilterPreset(presetId);
      fetchFilterPresets();
      alert("Preset deleted successfully!");
    } catch (error) {
      console.error("Error deleting preset:", error);
      alert("Failed to delete preset");
    }
  };

  // Set a preset as default
  const handleSetDefaultPreset = async (presetId: string) => {
    if (!currentUser?.id) return;

    try {
      await adminService.setDefaultPreset(currentUser.id, presetId);
      fetchFilterPresets();
      alert("Default preset updated!");
    } catch (error) {
      console.error("Error setting default preset:", error);
      alert("Failed to set default preset");
    }
  };

  // Get currently active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== "all") count++;
    if (kycFilter !== "all") count++;
    if (rankFilter !== "all") count++;
    if (roleFilter !== "all") count++;
    if (dateRangeFilter !== "all") count++;
    return count;
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const newStatus = "suspended";
      await adminService.updateUserStatus(userId, newStatus);
      alert("User suspended successfully");
      fetchUsers();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status");
    }
  };

  const executeBulkModalAction = async () => {
    try {
      switch (bulkModalType) {
        case "kyc":
          await adminService.bulkVerifyKYC(selectedUsers, bulkKycStatus);
          alert(`KYC status updated to "${bulkKycStatus}" for ${selectedUsers.length} users`);
          break;
        
        case "role":
          await adminService.bulkChangeRole(selectedUsers, bulkRole);
          alert(`Role changed to "${bulkRole}" for ${selectedUsers.length} users`);
          break;
        
        case "rank":
          await adminService.bulkUpdateStarRank(selectedUsers, parseInt(bulkStarRank));
          alert(`Star rank updated to ${bulkStarRank} for ${selectedUsers.length} users`);
          break;
        
        case "2fa":
          await adminService.bulkToggle2FA(selectedUsers, bulk2FAEnabled);
          alert(`2FA ${bulk2FAEnabled ? "enabled" : "disabled"} for ${selectedUsers.length} users`);
          break;
        
        case "credit":
          if (!bulkAmount || Number(bulkAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
          }
          await adminService.bulkCreditWallet(selectedUsers, Number(bulkAmount), bulkWalletType);
          alert(`${bulkAmount} SUI credited to ${bulkWalletType} for ${selectedUsers.length} users`);
          break;
        
        case "debit":
          if (!bulkAmount || Number(bulkAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
          }
          await adminService.bulkDebitWallet(selectedUsers, Number(bulkAmount), bulkWalletType);
          alert(`${bulkAmount} SUI debited from ${bulkWalletType} for ${selectedUsers.length} users`);
          break;
        
        case "notify":
          if (!bulkNotificationTitle || !bulkNotificationMessage) {
            alert("Please enter both title and message");
            return;
          }
          await adminService.bulkSendNotification(selectedUsers, bulkNotificationTitle, bulkNotificationMessage);
          alert(`Notification sent to ${selectedUsers.length} users`);
          break;
      }

      // Reset and refresh
      setShowBulkModal(false);
      setBulkModalType(null);
      setSelectedUsers([]);
      setBulkAction("");
      setBulkAmount("");
      setBulkNotificationTitle("");
      setBulkNotificationMessage("");
      fetchUsers();
    } catch (error) {
      console.error("Error executing bulk modal action:", error);
      alert("Failed to execute action");
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

  // Key metrics
  const totalUsers = 1247;
  const totalVolume = 3456789; // in SUI
  const totalPlatformEarnings = 245678; // in SUI
  const activePackages = 892;

  const platformEarningsBreakdown = [
    { name: "Withdrawal Tax", amount: 125000 },
    { name: "P2P Fees", amount: 45000 },
    { name: "Package Fees", amount: 65000 },
    { name: "Trading Spread", amount: 10678 },
  ];

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
          { title: "Platform Earnings Breakdown", data: platformEarningsBreakdown },
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
        { name: "Platform Earnings", data: platformEarningsBreakdown },
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

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

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
            <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-purple-400" />
                <span className="text-sm text-gray-400">Total Users</span>
              </div>
              <div className="text-3xl font-bold">{totalUsers.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-2">+12% from last month</div>
            </Card>

            <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <span className="text-sm text-gray-400">Total Volume</span>
              </div>
              <div className="text-3xl font-bold">{(totalVolume / 1000000).toFixed(2)}M SUI</div>
              <div className="text-xs text-gray-500 mt-1">≈ ${((totalVolume * 3.5) / 1000000).toFixed(2)}M USD</div>
              <div className="text-xs text-green-400 mt-1">+8% from last month</div>
            </Card>

            <Card className="p-6 border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-sm text-gray-400">Platform Earnings</span>
              </div>
              <div className="text-3xl font-bold">{(totalPlatformEarnings / 1000).toFixed(0)}K SUI</div>
              <div className="text-xs text-gray-500 mt-1">≈ ${((totalPlatformEarnings * 3.5) / 1000).toFixed(0)}K USD</div>
              <div className="text-xs text-green-400 mt-1">+15% from last month</div>
            </Card>

            <Card className="p-6 border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-pink-400" />
                <span className="text-sm text-gray-400">Active Packages</span>
              </div>
              <div className="text-3xl font-bold">{activePackages.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-2">+10% from last month</div>
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
                    data={platformEarningsBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {platformEarningsBreakdown.map((entry, index) => (
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
                      <SelectItem key={rank} value={rank.toString()}>Star {rank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="master_admin">Master Admin</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Registration date" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="date">Registration Date</SelectItem>
                    <SelectItem value="balance">Current Balance</SelectItem>
                    <SelectItem value="team_volume">Team Volume</SelectItem>
                    <SelectItem value="earnings">Total Earnings</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent className="bg-purple-800 border-purple-600">
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Display */}
              {(searchQuery || statusFilter !== "all" || kycFilter !== "all" || rankFilter !== "all" || roleFilter !== "all" || dateRangeFilter !== "all") && (
                <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
                  <span className="text-sm font-medium">Active Filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Status: {statusFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                    </Badge>
                  )}
                  {kycFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      KYC: {kycFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setKycFilter("all")} />
                    </Badge>
                  )}
                  {rankFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Rank: Star {rankFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setRankFilter("all")} />
                    </Badge>
                  )}
                  {roleFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Role: {roleFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setRoleFilter("all")} />
                    </Badge>
                  )}
                  {dateRangeFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      Date: {dateRangeFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRangeFilter("all")} />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setKycFilter("all");
                      setRankFilter("all");
                      setRoleFilter("all");
                      setDateRangeFilter("all");
                    }}
                    className="h-7"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {/* Filter Presets Section */}
              <div className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Quick Filters:</span>
                </div>
                
                {/* Preset Buttons */}
                <div className="flex flex-wrap gap-2">
                  {filterPresets.slice(0, 6).map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyFilterPreset(preset)}
                      className="h-8 gap-2 hover:bg-primary/10 hover:border-primary/50"
                    >
                      {preset.is_default && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                      {preset.is_public && <Globe className="h-3 w-3 text-muted-foreground" />}
                      {preset.preset_name}
                    </Button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSavePresetDialog(true)}
                    className="h-8 gap-2"
                    disabled={getActiveFilterCount() === 0}
                  >
                    <Save className="h-4 w-4" />
                    Save Current
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManagePresetsDialog(true)}
                    className="h-8 gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Manage ({filterPresets.length})
                  </Button>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-purple-800/50 border border-purple-600 rounded-lg">
                  <span className="text-purple-200">{selectedUsers.length} users selected</span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-64 bg-purple-700 border-purple-500 text-white">
                      <SelectValue placeholder="Select action..." />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-800 border-purple-600">
                      <SelectItem value="activate">✅ Activate Users</SelectItem>
                      <SelectItem value="suspend">🚫 Suspend Users</SelectItem>
                      <SelectItem value="verify_kyc">✓ Verify KYC</SelectItem>
                      <SelectItem value="change_role">👤 Change Role</SelectItem>
                      <SelectItem value="update_rank">⭐ Update Star Rank</SelectItem>
                      <SelectItem value="toggle_2fa">🔐 Toggle 2FA</SelectItem>
                      <SelectItem value="credit_wallet">💰 Credit Wallets</SelectItem>
                      <SelectItem value="debit_wallet">💸 Debit Wallets</SelectItem>
                      <SelectItem value="send_notification">📧 Send Notification</SelectItem>
                      <SelectItem value="export">📥 Export Selected</SelectItem>
                      <SelectItem value="delete">🗑️ Delete Users</SelectItem>
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
                          <td className="px-4 py-3">
                            <div className="font-semibold text-green-400">
                              ${user.current_balance?.toFixed(2) || "0.00"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">{(user.team_volume / 1000).toFixed(0)}K SUI</div>
                            <div className="text-xs text-gray-500">Team: {user.team_size}</div>
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

          {/* Bulk Action Modal */}
          <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
            <DialogContent className="bg-purple-900 border-purple-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {bulkModalType === "credit" && "Bulk Credit Wallets"}
                  {bulkModalType === "debit" && "Bulk Debit Wallets"}
                  {bulkModalType === "kyc" && "Bulk Verify KYC"}
                  {bulkModalType === "role" && "Bulk Change Role"}
                  {bulkModalType === "rank" && "Bulk Update Star Rank"}
                  {bulkModalType === "2fa" && "Bulk Toggle 2FA"}
                  {bulkModalType === "notify" && "Send Bulk Notification"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Alert className="bg-purple-800/50 border-purple-600">
                  <AlertDescription>
                    This action will affect <strong>{selectedUsers.length}</strong> selected users
                  </AlertDescription>
                </Alert>

                {(bulkModalType === "credit" || bulkModalType === "debit") && (
                  <>
                    <div>
                      <label className="text-sm text-purple-300 mb-2 block">Amount (SUI)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={bulkAmount}
                        onChange={(e) => setBulkAmount(e.target.value)}
                        className="bg-purple-800/50 border-purple-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 mb-2 block">Wallet Type</label>
                      <Select value={bulkWalletType} onValueChange={setBulkWalletType}>
                        <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-800 border-purple-600">
                          <SelectItem value="main_wallet">Main Wallet</SelectItem>
                          <SelectItem value="roi_wallet">ROI Wallet</SelectItem>
                          <SelectItem value="earning_wallet">Earning Wallet</SelectItem>
                          <SelectItem value="p2p_wallet">P2P Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {bulkModalType === "kyc" && (
                  <div>
                    <label className="text-sm text-purple-300 mb-2 block">KYC Status</label>
                    <Select value={bulkKycStatus} onValueChange={setBulkKycStatus}>
                      <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-800 border-purple-600">
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bulkModalType === "role" && (
                  <div>
                    <label className="text-sm text-purple-300 mb-2 block">New Role</label>
                    <Select value={bulkRole} onValueChange={setBulkRole}>
                      <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-800 border-purple-600">
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bulkModalType === "rank" && (
                  <div>
                    <label className="text-sm text-purple-300 mb-2 block">Star Rank</label>
                    <Select value={bulkStarRank} onValueChange={setBulkStarRank}>
                      <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-800 border-purple-600">
                        {[1, 2, 3, 4, 5, 6, 7].map(rank => (
                          <SelectItem key={rank} value={rank.toString()}>Star {rank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bulkModalType === "2fa" && (
                  <div>
                    <label className="text-sm text-purple-300 mb-2 block">2FA Action</label>
                    <Select value={bulk2FAEnabled ? "enable" : "disable"} onValueChange={(val) => setBulk2FAEnabled(val === "enable")}>
                      <SelectTrigger className="bg-purple-800/50 border-purple-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-purple-800 border-purple-600">
                        <SelectItem value="enable">Enable 2FA</SelectItem>
                        <SelectItem value="disable">Disable 2FA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {bulkModalType === "notify" && (
                  <>
                    <div>
                      <label className="text-sm text-purple-300 mb-2 block">Notification Title</label>
                      <Input
                        placeholder="Enter title"
                        value={bulkNotificationTitle}
                        onChange={(e) => setBulkNotificationTitle(e.target.value)}
                        className="bg-purple-800/50 border-purple-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-purple-300 mb-2 block">Message</label>
                      <textarea
                        placeholder="Enter message"
                        value={bulkNotificationMessage}
                        onChange={(e) => setBulkNotificationMessage(e.target.value)}
                        rows={4}
                        className="w-full p-3 bg-purple-800/50 border border-purple-600 text-white rounded-lg"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={executeBulkModalAction}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Execute Action
                  </Button>
                  <Button
                    onClick={() => {
                      setShowBulkModal(false);
                      setBulkModalType(null);
                    }}
                    variant="outline"
                    className="border-purple-400 text-purple-300 hover:bg-purple-800"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Save Filter Preset Dialog */}
          <Dialog open={showSavePresetDialog} onOpenChange={setShowSavePresetDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Save Filter Preset</DialogTitle>
                <DialogDescription>
                  Save your current filter combination for quick access later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Preset Name</Label>
                  <Input
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="e.g., High Value Suspended Users"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preset-public"
                    checked={newPresetIsPublic}
                    onCheckedChange={(checked) => setNewPresetIsPublic(checked as boolean)}
                  />
                  <Label htmlFor="preset-public" className="text-sm cursor-pointer">
                    Make this preset public (visible to all admins)
                  </Label>
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm font-medium">Current Filters:</p>
                  {searchQuery && <p className="text-xs text-muted-foreground">• Search: {searchQuery}</p>}
                  {statusFilter !== "all" && <p className="text-xs text-muted-foreground">• Status: {statusFilter}</p>}
                  {kycFilter !== "all" && <p className="text-xs text-muted-foreground">• KYC: {kycFilter}</p>}
                  {rankFilter !== "all" && <p className="text-xs text-muted-foreground">• Rank: Star {rankFilter}</p>}
                  {roleFilter !== "all" && <p className="text-xs text-muted-foreground">• Role: {roleFilter}</p>}
                  {dateRangeFilter !== "all" && <p className="text-xs text-muted-foreground">• Date: {dateRangeFilter}</p>}
                  <p className="text-xs text-muted-foreground">• Sort: {sortBy} ({sortOrder})</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSavePresetDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Manage Filter Presets Dialog */}
          <Dialog open={showManagePresetsDialog} onOpenChange={setShowManagePresetsDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Filter Presets</DialogTitle>
                <DialogDescription>
                  View, edit, and manage all your saved filter presets.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {filterPresets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No saved presets yet</p>
                    <p className="text-sm">Save your first preset to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filterPresets.map((preset) => (
                      <Card key={preset.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{preset.preset_name}</h4>
                              {preset.is_default && (
                                <Badge variant="default" className="gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Default
                                </Badge>
                              )}
                              {preset.is_public && (
                                <Badge variant="secondary" className="gap-1">
                                  <Globe className="h-3 w-3" />
                                  Public
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {preset.filters.search && (
                                <Badge variant="outline" className="text-xs">Search: {preset.filters.search}</Badge>
                              )}
                              {preset.filters.statusFilter && preset.filters.statusFilter !== "all" && (
                                <Badge variant="outline" className="text-xs">Status: {preset.filters.statusFilter}</Badge>
                              )}
                              {preset.filters.kycFilter && preset.filters.kycFilter !== "all" && (
                                <Badge variant="outline" className="text-xs">KYC: {preset.filters.kycFilter}</Badge>
                              )}
                              {preset.filters.rankFilter && preset.filters.rankFilter !== "all" && (
                                <Badge variant="outline" className="text-xs">Rank: Star {preset.filters.rankFilter}</Badge>
                              )}
                              {preset.filters.roleFilter && preset.filters.roleFilter !== "all" && (
                                <Badge variant="outline" className="text-xs">Role: {preset.filters.roleFilter}</Badge>
                              )}
                              {preset.filters.dateRangeFilter && preset.filters.dateRangeFilter !== "all" && (
                                <Badge variant="outline" className="text-xs">Date: {preset.filters.dateRangeFilter}</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Sort: {preset.filters.sortBy} ({preset.filters.sortOrder})
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Created: {new Date(preset.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                applyFilterPreset(preset);
                                setShowManagePresetsDialog(false);
                              }}
                              className="w-full"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                            {preset.user_id === currentUser?.id && !preset.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefaultPreset(preset.id)}
                                className="w-full"
                              >
                                <Star className="h-3 w-3 mr-1" />
                                Set Default
                              </Button>
                            )}
                            {preset.user_id === currentUser?.id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePreset(preset.id)}
                                className="w-full text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowManagePresetsDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}