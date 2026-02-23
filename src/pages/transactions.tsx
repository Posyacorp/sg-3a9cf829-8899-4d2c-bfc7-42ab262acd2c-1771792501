import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Filter,
  Download,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Package,
  Eye,
  RefreshCw,
  X,
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface Transaction {
  id: string;
  type: "deposit" | "withdrawal" | "roi" | "commission" | "package_purchase" | "p2p_transfer";
  amount: number;
  status: "pending" | "completed" | "failed" | "cancelled";
  created_at: string;
  description?: string;
  hash?: string;
  from_user?: string;
  to_user?: string;
  package_name?: string;
}

interface FilterState {
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  search: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
}

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
    search: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalROI: 0,
    totalCommissions: 0,
    pendingCount: 0,
  });

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      await loadTransactions(session.user.id);
    } catch (error) {
      console.error("Auth error:", error);
      router.push("/login");
    }
  };

  // Load transactions
  const loadTransactions = async (userId: string) => {
    try {
      setLoading(true);

      // Load all transaction types
      const { data: depositsData } = await (supabase as any)
        .from("deposits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: withdrawalsData } = await (supabase as any)
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: commissionsData } = await (supabase as any)
        .from("commissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: packagesData } = await (supabase as any)
        .from("user_packages")
        .select("*, packages(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Transform data into unified transaction format
      const allTransactions: Transaction[] = [];

      // Add deposits
      depositsData?.forEach((d: any) => {
        allTransactions.push({
          id: d.id,
          type: "deposit",
          amount: d.amount,
          status: d.status,
          created_at: d.created_at,
          description: `Deposit via ${d.wallet_address}`,
          hash: d.transaction_hash,
        });
      });

      // Add withdrawals
      withdrawalsData?.forEach((w: any) => {
        allTransactions.push({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          status: w.status,
          created_at: w.created_at,
          description: `Withdrawal to ${w.wallet_address}`,
          hash: w.transaction_hash,
        });
      });

      // Add commissions
      commissionsData?.forEach((c: any) => {
        allTransactions.push({
          id: c.id,
          type: "commission",
          amount: c.amount,
          status: "completed",
          created_at: c.created_at,
          description: `${c.commission_type} commission from Level ${c.level}`,
        });
      });

      // Add package purchases
      packagesData?.forEach((p: any) => {
        allTransactions.push({
          id: p.id,
          type: "package_purchase",
          amount: p.amount_invested,
          status: "completed",
          created_at: p.created_at,
          description: `Purchased ${p.packages?.name || "Package"}`,
          package_name: p.packages?.name,
        });
      });

      // Sort by date (newest first)
      allTransactions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransactions(allTransactions);
      setFilteredTransactions(allTransactions);
      calculateStats(allTransactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (txns: Transaction[]) => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalROI: 0,
      totalCommissions: 0,
      pendingCount: 0,
    };

    txns.forEach((tx) => {
      if (tx.status === "completed") {
        if (tx.type === "deposit") stats.totalDeposits += tx.amount;
        if (tx.type === "withdrawal") stats.totalWithdrawals += tx.amount;
        if (tx.type === "roi") stats.totalROI += tx.amount;
        if (tx.type === "commission") stats.totalCommissions += tx.amount;
      }
      if (tx.status === "pending") stats.pendingCount++;
    });

    setStats(stats);
  };

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (tx) => new Date(tx.created_at) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (tx) => new Date(tx.created_at) <= new Date(filters.dateTo)
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.description?.toLowerCase().includes(searchLower) ||
          tx.hash?.toLowerCase().includes(searchLower) ||
          tx.type.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (filters.sortBy === "date") {
        const comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return filters.sortOrder === "asc" ? comparison : -comparison;
      } else {
        const comparison = a.amount - b.amount;
        return filters.sortOrder === "asc" ? comparison : -comparison;
      }
    });

    setFilteredTransactions(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      dateFrom: "",
      dateTo: "",
      search: "",
      sortBy: "date",
      sortOrder: "desc",
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredTransactions.map((tx) => ({
      Date: format(new Date(tx.created_at), "MMM dd, yyyy HH:mm"),
      Type: tx.type.replace("_", " ").toUpperCase(),
      Amount: `${tx.amount} SUI`,
      Status: tx.status.toUpperCase(),
      Description: tx.description || "-",
      Hash: tx.hash || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `sui24_transactions_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  // Get transaction icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownRight className="h-5 w-5 text-green-500" />;
      case "withdrawal":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case "roi":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "commission":
        return <Users className="h-5 w-5 text-purple-500" />;
      case "package_purchase":
        return <Package className="h-5 w-5 text-orange-500" />;
      case "p2p_transfer":
        return <DollarSign className="h-5 w-5 text-teal-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500"><AlertCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Transaction History | SUI24"
        description="View your complete transaction history with advanced filtering"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredTransactions.length} of {transactions.length} transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  disabled={filteredTransactions.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {stats.totalDeposits.toFixed(2)} SUI
                  </p>
                </div>
                <ArrowDownRight className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {stats.totalWithdrawals.toFixed(2)} SUI
                  </p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Total ROI</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalROI.toFixed(2)} SUI
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Commissions</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {stats.totalCommissions.toFixed(2)} SUI
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {stats.pendingCount}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
          </div>

          {/* Filters Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Type Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Transaction Type
                      </label>
                      <Select
                        value={filters.type}
                        onValueChange={(value) => setFilters({ ...filters, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="deposit">Deposit</SelectItem>
                          <SelectItem value="withdrawal">Withdrawal</SelectItem>
                          <SelectItem value="roi">ROI</SelectItem>
                          <SelectItem value="commission">Commission</SelectItem>
                          <SelectItem value="package_purchase">Package Purchase</SelectItem>
                          <SelectItem value="p2p_transfer">P2P Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Status
                      </label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) => setFilters({ ...filters, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Search */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search by description, hash..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Date From */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Date From
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Date To */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Date To
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Sort By
                      </label>
                      <div className="flex gap-2">
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value: "date" | "amount") =>
                            setFilters({ ...filters, sortBy: value })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="amount">Amount</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setFilters({
                              ...filters,
                              sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                            })
                          }
                        >
                          {filters.sortOrder === "asc" ? "↑" : "↓"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transactions List */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No transactions found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {getTransactionIcon(tx.type)}
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {tx.type.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                            {tx.description}
                          </p>
                          {tx.hash && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-xs">
                              {tx.hash}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-semibold ${
                              tx.type === "deposit" || tx.type === "roi" || tx.type === "commission"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {tx.type === "deposit" || tx.type === "roi" || tx.type === "commission"
                              ? "+"
                              : "-"}
                            {tx.amount.toFixed(2)} SUI
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(tx.created_at), "MMM dd, yyyy")}
                          <br />
                          <span className="text-xs">{format(new Date(tx.created_at), "HH:mm")}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransaction(tx)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                    {tx.id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {getTransactionIcon(tx.type)}
                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                      {tx.type.replace("_", " ")}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {tx.amount.toFixed(2)} SUI
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                  <div className="mt-1">{getStatusBadge(tx.status)}</div>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                                  <p className="text-sm text-gray-900 dark:text-white">
                                    {format(new Date(tx.created_at), "MMMM dd, yyyy 'at' HH:mm")}
                                  </p>
                                </div>
                                {tx.description && (
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                                    <p className="text-sm text-gray-900 dark:text-white">{tx.description}</p>
                                  </div>
                                )}
                                {tx.hash && (
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Hash</p>
                                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                                      {tx.hash}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}