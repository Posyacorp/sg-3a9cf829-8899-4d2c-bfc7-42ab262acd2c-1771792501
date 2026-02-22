import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Users, DollarSign, Activity, Package, 
  CheckCircle, XCircle, Clock, ArrowUpRight, Settings,
  Eye, Edit, Trash2, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  username: string;
  email: string;
  totalDeposit: number;
  totalWithdraw: number;
  activePackages: number;
  referrals: number;
  status: "active" | "suspended" | "banned";
  registered: number;
}

interface PendingTransaction {
  id: string;
  userId: string;
  username: string;
  type: "deposit" | "withdraw";
  amount: number;
  wallet: string;
  hash?: string;
  timestamp: number;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalProfit: number;
  adminWallet: number;
}

export default function AdminDashboard() {
  const [stats] = useState<AdminStats>({
    totalUsers: 1247,
    activeUsers: 892,
    totalDeposits: 458920.50,
    totalWithdrawals: 234567.30,
    pendingDeposits: 15,
    pendingWithdrawals: 8,
    totalProfit: 112176.60,
    adminWallet: 89543.25
  });

  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "user123",
      email: "user123@email.com",
      totalDeposit: 5000,
      totalWithdraw: 2500,
      activePackages: 2,
      referrals: 15,
      status: "active",
      registered: Date.now() - 1000 * 60 * 60 * 24 * 30
    },
    {
      id: "2",
      username: "trader456",
      email: "trader456@email.com",
      totalDeposit: 10000,
      totalWithdraw: 5000,
      activePackages: 3,
      referrals: 45,
      status: "active",
      registered: Date.now() - 1000 * 60 * 60 * 24 * 60
    }
  ]);

  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([
    {
      id: "1",
      userId: "user1",
      username: "user123",
      type: "deposit",
      amount: 100,
      wallet: "main",
      hash: "0x1234567890abcdef",
      timestamp: Date.now() - 1000 * 60 * 30
    },
    {
      id: "2",
      userId: "user2",
      username: "trader456",
      type: "withdraw",
      amount: 500,
      wallet: "roi",
      timestamp: Date.now() - 1000 * 60 * 45
    }
  ]);

  const approveTransaction = (txId: string) => {
    setPendingTransactions(pendingTransactions.filter(tx => tx.id !== txId));
    alert("Transaction approved and processed");
  };

  const rejectTransaction = (txId: string) => {
    setPendingTransactions(pendingTransactions.filter(tx => tx.id !== txId));
    alert("Transaction rejected");
  };

  const updateUserStatus = (userId: string, status: "active" | "suspended" | "banned") => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
    alert(`User status updated to ${status}`);
  };

  return (
    <>
      <SEO title="Admin Dashboard - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <header className="border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">ADMIN PANEL</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
                  Admin Wallet: {stats.adminWallet.toFixed(2)} SUI
                </Badge>
                <Link href="/admin/settings">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Users</span>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">+{stats.activeUsers} active</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-green-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Deposits</span>
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalDeposits.toFixed(0)} SUI</p>
              <p className="text-xs text-yellow-400 mt-1">{stats.pendingDeposits} pending</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-red-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Withdrawals</span>
                <DollarSign className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalWithdrawals.toFixed(0)} SUI</p>
              <p className="text-xs text-yellow-400 mt-1">{stats.pendingWithdrawals} pending</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-blue-500/20 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Platform Profit</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalProfit.toFixed(0)} SUI</p>
              <p className="text-xs text-gray-400 mt-1">5% fees + 50% tax</p>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="w-full grid grid-cols-4 bg-slate-900/50">
              <TabsTrigger value="pending">Pending Transactions</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="packages">Package Management</TabsTrigger>
              <TabsTrigger value="settings">Platform Settings</TabsTrigger>
            </TabsList>

            {/* Pending Transactions */}
            <TabsContent value="pending">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">Pending Transactions</h2>
                <div className="space-y-4">
                  {pendingTransactions.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No pending transactions</p>
                    </div>
                  ) : (
                    pendingTransactions.map((tx) => (
                      <div key={tx.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge className={
                                tx.type === "deposit" 
                                  ? "bg-green-500/20 text-green-400" 
                                  : "bg-red-500/20 text-red-400"
                              }>
                                {tx.type.toUpperCase()}
                              </Badge>
                              <span className="text-white font-semibold">{tx.username}</span>
                            </div>
                            <div className="text-sm text-gray-400 space-y-1">
                              <p>Amount: <span className="text-white font-bold">{tx.amount} SUI</span></p>
                              <p>Wallet: <span className="text-purple-400">{tx.wallet}</span></p>
                              {tx.hash && <p>Hash: <span className="text-gray-500 font-mono text-xs">{tx.hash}</span></p>}
                              <p>Time: {new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => approveTransaction(tx.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => rejectTransaction(tx.id)}
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* User Management */}
            <TabsContent value="users">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white">User Management</h2>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Search users..."
                      className="bg-slate-950 border-purple-500/30 text-white w-64"
                    />
                    <Button className="bg-purple-500 hover:bg-purple-600">
                      <Users className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold">{user.username}</span>
                            <Badge className={
                              user.status === "active" ? "bg-green-500/20 text-green-400" :
                              user.status === "suspended" ? "bg-yellow-500/20 text-yellow-400" :
                              "bg-red-500/20 text-red-400"
                            }>
                              {user.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                            <div>
                              <span className="text-xs">Email:</span>
                              <p className="text-white">{user.email}</p>
                            </div>
                            <div>
                              <span className="text-xs">Deposits:</span>
                              <p className="text-green-400 font-bold">{user.totalDeposit} SUI</p>
                            </div>
                            <div>
                              <span className="text-xs">Withdrawals:</span>
                              <p className="text-red-400 font-bold">{user.totalWithdraw} SUI</p>
                            </div>
                            <div>
                              <span className="text-xs">Referrals:</span>
                              <p className="text-purple-400 font-bold">{user.referrals}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-500/50 text-purple-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/50 text-blue-300"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {user.status === "active" ? (
                            <Button
                              size="sm"
                              onClick={() => updateUserStatus(user.id, "suspended")}
                              variant="outline"
                              className="border-yellow-500/50 text-yellow-300"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => updateUserStatus(user.id, "active")}
                              variant="outline"
                              className="border-green-500/50 text-green-300"
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Package Management */}
            <TabsContent value="packages">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">Package Configuration</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: "Starter", deposit: 30, roi: 220 },
                    { name: "Bronze", deposit: 100, roi: 230 },
                    { name: "Silver", deposit: 250, roi: 240 },
                    { name: "Gold", deposit: 750, roi: 250 },
                    { name: "Platinum", deposit: 2500, roi: 260 },
                    { name: "Diamond", deposit: 5000, roi: 270 },
                    { name: "Elite", deposit: 7500, roi: 280 },
                    { name: "Master", deposit: 10000, roi: 290 },
                    { name: "Legend", deposit: 15000, roi: 300 }
                  ].map((pkg, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                        <Button size="sm" variant="outline" className="border-purple-500/50">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Deposit:</span>
                          <span className="text-white font-semibold">{pkg.deposit} SUI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max ROI:</span>
                          <span className="text-green-400 font-semibold">{pkg.roi}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Platform Settings */}
            <TabsContent value="settings">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">Platform Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-slate-950/50 rounded-lg space-y-4">
                    <h3 className="text-lg font-bold text-white">Fee Configuration</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Platform Entry Fee</label>
                        <Input defaultValue="5" className="bg-slate-900 border-purple-500/30 text-white mt-2" />
                        <p className="text-xs text-gray-500 mt-1">Percentage taken on package purchase</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Withdrawal Tax</label>
                        <Input defaultValue="50" className="bg-slate-900 border-purple-500/30 text-white mt-2" />
                        <p className="text-xs text-gray-500 mt-1">Percentage taken on external withdrawals</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">P2P Transfer Fee</label>
                        <Input defaultValue="1" className="bg-slate-900 border-purple-500/30 text-white mt-2" />
                        <p className="text-xs text-gray-500 mt-1">Percentage taken on P2P transfers</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Max Daily ROI</label>
                        <Input defaultValue="10" className="bg-slate-900 border-purple-500/30 text-white mt-2" />
                        <p className="text-xs text-gray-500 mt-1">Maximum ROI percentage per day</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-lg space-y-4">
                    <h3 className="text-lg font-bold text-white">Admin Wallet Address</h3>
                    <Input 
                      defaultValue="0xSUI24AdminWalletAddress123456789" 
                      className="bg-slate-900 border-purple-500/30 text-white font-mono"
                    />
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12">
                    Save Settings
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}