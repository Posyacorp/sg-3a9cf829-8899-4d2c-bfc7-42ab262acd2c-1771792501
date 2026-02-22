import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, Wallet, Clock, Users, Gift, ArrowUpRight, 
  ArrowDownRight, Copy, CheckCircle, AlertCircle, DollarSign, ArrowLeftRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface WalletBalance {
  main: number;
  roi: number;
  earning: number;
  p2p: number;
}

interface ActivePackage {
  id: string;
  name: string;
  deposit: number;
  maxRoi: number;
  currentRoi: number;
  purchased: number;
  lastClaim: number;
  nextClaim: number;
  status: "active" | "completed" | "locked";
}

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "roi" | "commission" | "p2p";
  amount: number;
  status: "pending" | "completed" | "rejected";
  timestamp: number;
  hash?: string;
}

export default function Dashboard() {
  const [wallets, setWallets] = useState<WalletBalance>({
    main: 150.5,
    roi: 45.8,
    earning: 23.2,
    p2p: 12.0
  });

  const [activePackages, setActivePackages] = useState<ActivePackage[]>([
    {
      id: "1",
      name: "Bronze",
      deposit: 100,
      maxRoi: 230,
      currentRoi: 45.8,
      purchased: Date.now() - 1000 * 60 * 60 * 24 * 3,
      lastClaim: Date.now() - 1000 * 60 * 60 * 2,
      nextClaim: Date.now() + 1000 * 60 * 60,
      status: "active"
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "deposit",
      amount: 100,
      status: "completed",
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3,
      hash: "0x1234...5678"
    },
    {
      id: "2",
      type: "roi",
      amount: 5.2,
      status: "completed",
      timestamp: Date.now() - 1000 * 60 * 60 * 3
    }
  ]);

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [canClaim, setCanClaim] = useState(false);
  const [referralLink] = useState("https://sui24.trade/?ref=USER123");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const pkg = activePackages[0];
      if (pkg && pkg.status === "active") {
        const remaining = pkg.nextClaim - Date.now();
        setTimeRemaining(remaining);
        setCanClaim(remaining <= 0 && remaining > -1800000); // 30 min window
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activePackages]);

  const claimReward = () => {
    if (!canClaim) return;

    // Random reward between 1-10% of package deposit
    const pkg = activePackages[0];
    const rewardPercent = Math.random() * 9 + 1; // 1-10%
    const reward = (pkg.deposit * rewardPercent) / 100;
    
    const newCurrentRoi = pkg.currentRoi + rewardPercent;
    
    if (newCurrentRoi >= pkg.maxRoi) {
      // Package completed
      setActivePackages([{
        ...pkg,
        currentRoi: pkg.maxRoi,
        status: "completed"
      }]);
    } else {
      setActivePackages([{
        ...pkg,
        currentRoi: newCurrentRoi,
        lastClaim: Date.now(),
        nextClaim: Date.now() + 1000 * 60 * 60 * 3 // 3 hours
      }]);
    }

    setWallets({
      ...wallets,
      roi: wallets.roi + reward
    });

    setTransactions([{
      id: Date.now().toString(),
      type: "roi",
      amount: reward,
      status: "completed",
      timestamp: Date.now()
    }, ...transactions]);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO title="Dashboard - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <header className="border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">SUI24</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/trade" className="text-gray-300 hover:text-white transition-colors">Trade</Link>
                <Link href="/packages" className="text-gray-300 hover:text-white transition-colors">Packages</Link>
                <Link href="/dashboard" className="text-white font-semibold">Dashboard</Link>
              </nav>

              <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Wallet Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Main Wallet</div>
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold">{wallets.main.toFixed(2)} SUI</div>
              <div className="text-xs text-gray-500 mt-1">≈ ${(wallets.main * 3.5).toFixed(2)} USD</div>
            </Card>

            <Card className="p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">ROI Wallet</div>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold">{wallets.roi.toFixed(2)} SUI</div>
              <div className="text-xs text-gray-500 mt-1">≈ ${(wallets.roi * 3.5).toFixed(2)} USD</div>
            </Card>

            <Card className="p-6 border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Earning Wallet</div>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold">{wallets.earning.toFixed(2)} SUI</div>
              <div className="text-xs text-gray-500 mt-1">≈ ${(wallets.earning * 3.5).toFixed(2)} USD</div>
            </Card>

            <Card className="p-6 border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">P2P Wallet</div>
                <ArrowLeftRight className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-2xl font-bold">{wallets.p2p.toFixed(2)} SUI</div>
              <div className="text-xs text-gray-500 mt-1">≈ ${(wallets.p2p * 3.5).toFixed(2)} USD</div>
            </Card>
          </div>

          {/* Active Package & Task Claim */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white mb-6">Active Package</h2>
              
              {activePackages.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No active package</p>
                  <Link href="/packages">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                      Buy Package
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activePackages.map((pkg) => (
                    <div key={pkg.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{pkg.name} Package</h3>
                          <p className="text-sm text-gray-400">{pkg.deposit} SUI Deposit</p>
                        </div>
                        <Badge className={
                          pkg.status === "active" ? "bg-green-500/20 text-green-400" :
                          pkg.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                          "bg-gray-500/20 text-gray-400"
                        }>
                          {pkg.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">ROI Progress</span>
                            <span className="text-white font-semibold">
                              {pkg.currentRoi.toFixed(2)}% / {pkg.maxRoi}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${(pkg.currentRoi / pkg.maxRoi) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-slate-900/50 rounded">
                            <span className="text-xs text-gray-400">Total Earned</span>
                            <p className="text-lg font-bold text-green-400">
                              {((pkg.deposit * pkg.currentRoi) / 100).toFixed(2)} SUI
                            </p>
                          </div>
                          <div className="p-3 bg-slate-900/50 rounded">
                            <span className="text-xs text-gray-400">Remaining</span>
                            <p className="text-lg font-bold text-white">
                              {((pkg.deposit * (pkg.maxRoi - pkg.currentRoi)) / 100).toFixed(2)} SUI
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white mb-6">Task Claim</h2>
              
              {activePackages.length === 0 || activePackages[0].status !== "active" ? (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No active tasks</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center p-8 bg-slate-950/50 rounded-lg">
                    {canClaim ? (
                      <>
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <p className="text-green-400 text-lg font-bold mb-2">Ready to Claim!</p>
                        <p className="text-sm text-gray-400 mb-4">30 minute claim window active</p>
                      </>
                    ) : timeRemaining < -1800000 ? (
                      <>
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-400 text-lg font-bold mb-2">Missed Claim Window</p>
                        <p className="text-sm text-gray-400 mb-4">Reward donated to fund</p>
                      </>
                    ) : (
                      <>
                        <Clock className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <p className="text-4xl font-black text-white mb-2">
                          {formatTime(timeRemaining)}
                        </p>
                        <p className="text-sm text-gray-400">Next claim available in</p>
                      </>
                    )}
                  </div>

                  <Button 
                    onClick={claimReward}
                    disabled={!canClaim}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canClaim ? "Claim Reward Now" : "Wait for Next Claim"}
                  </Button>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      💡 <strong>Tip:</strong> Click every 3 hours within the 30-minute window to maximize your earnings!
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl mb-8">
            <h2 className="text-xl font-black text-white mb-4">Your Referral Link</h2>
            <div className="flex gap-3">
              <input 
                type="text" 
                value={referralLink} 
                readOnly 
                className="flex-1 px-4 py-3 bg-slate-950 border border-purple-500/30 rounded-lg text-white"
              />
              <Button 
                onClick={copyReferralLink}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </Card>

          {/* Transactions */}
          <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
                <TabsTrigger value="withdraw">Withdrawals</TabsTrigger>
                <TabsTrigger value="roi">ROI</TabsTrigger>
                <TabsTrigger value="commission">Commission</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "deposit" ? "bg-green-500/20" :
                            tx.type === "withdraw" ? "bg-red-500/20" :
                            tx.type === "roi" ? "bg-blue-500/20" :
                            tx.type === "commission" ? "bg-purple-500/20" :
                            "bg-yellow-500/20"
                          }`}>
                            {tx.type === "deposit" ? <ArrowDownRight className="w-5 h-5 text-green-400" /> :
                             tx.type === "withdraw" ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                             <TrendingUp className="w-5 h-5 text-blue-400" />}
                          </div>
                          <div>
                            <p className="text-white font-semibold capitalize">{tx.type}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                            {tx.hash && (
                              <p className="text-xs text-gray-500">{tx.hash}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            tx.type === "deposit" || tx.type === "roi" || tx.type === "commission" 
                              ? "text-green-400" 
                              : "text-red-400"
                          }`}>
                            {tx.type === "deposit" || tx.type === "roi" || tx.type === "commission" ? "+" : "-"}
                            {tx.amount} SUI
                          </p>
                          <Badge className={
                            tx.status === "completed" ? "bg-green-500/20 text-green-400" :
                            tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                          }>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
}