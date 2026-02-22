import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, 
  Send, Plus, History, Copy, CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface WalletBalance {
  main: number;
  roi: number;
  earning: number;
  p2p: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  wallet: string;
  status: string;
  timestamp: number;
  hash?: string;
  fee?: number;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState({
    main: 0,
    roi: 0,
    earning: 0,
    p2p: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", type: "Deposit", amount: 100, wallet: "Main", status: "Completed", timestamp: Date.now() - 86400000 * 2, hash: "0x1234...5678" },
    { id: "2", type: "ROI Claim", amount: 8.5, wallet: "ROI", status: "Completed", timestamp: Date.now() - 86400000, hash: "0xabcd...efgh" },
    { id: "3", type: "Commission", amount: 12.3, wallet: "Earning", status: "Completed", timestamp: Date.now() - 86400000, hash: "0x9876...5432" },
    { id: "4", type: "P2P Transfer", amount: 50, wallet: "P2P", status: "Completed", timestamp: Date.now(), hash: "0xijkl...mnop" },
    { id: "5", type: "Withdrawal", amount: 75, wallet: "Main", status: "Pending", timestamp: Date.now(), hash: "Pending..." },
  ]);

  const [activeTab, setActiveTab] = useState("overview");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositHash, setDepositHash] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawWallet, setWithdrawWallet] = useState("main");
  const [p2pRecipient, setP2pRecipient] = useState("");
  const [p2pAmount, setP2pAmount] = useState("");
  const [depositAddress] = useState("0xf57c83c39866238fe4860ef426426d170c3b6f6b");
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: "deposit",
      amount,
      wallet: "main",
      status: "pending",
      timestamp: Date.now()
    };

    setTransactions([newTx, ...transactions]);
    setDepositAmount("");
    alert("Deposit request submitted. Please send SUI to the address and provide transaction hash to admin.");
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    const walletBalance = wallets[withdrawWallet as keyof WalletBalance];
    if (amount > walletBalance) {
      alert("Insufficient balance");
      return;
    }

    // 50% admin tax for external withdrawal
    const fee = amount * 0.5;
    const netAmount = amount - fee;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: "withdraw",
      amount,
      wallet: withdrawWallet,
      status: "pending",
      timestamp: Date.now(),
      fee
    };

    setTransactions([newTx, ...transactions]);
    setWallets({
      ...wallets,
      [withdrawWallet]: walletBalance - amount
    });
    setWithdrawAmount("");
    
    alert(`Withdrawal initiated. Net amount after 50% fee: ${netAmount.toFixed(2)} SUI`);
  };

  const handleP2PTransfer = () => {
    const amount = parseFloat(p2pAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    if (!p2pRecipient) {
      alert("Please enter recipient username");
      return;
    }

    // 1% P2P fee
    const fee = amount * 0.01;
    const totalDeduction = amount + fee;

    if (totalDeduction > wallets.p2p) {
      alert("Insufficient P2P wallet balance");
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      type: "p2p",
      amount,
      wallet: "p2p",
      status: "completed",
      timestamp: Date.now(),
      fee
    };

    setTransactions([newTx, ...transactions]);
    setWallets({
      ...wallets,
      p2p: wallets.p2p - totalDeduction
    });
    
    setP2pAmount("");
    setP2pRecipient("");
    
    alert(`P2P transfer successful. Fee: ${fee.toFixed(2)} SUI`);
  };

  const totalBalance = wallets.main + wallets.roi + wallets.earning + wallets.p2p;

  return (
    <>
      <SEO title="Wallets - Sui24" />
      
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
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/wallets" className="text-white font-semibold">Wallets</Link>
              </nav>

              <Button variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Total Balance */}
          <Card className="p-8 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl mb-8">
            <div className="text-center">
              <p className="text-gray-400 mb-2">Total Balance</p>
              <h1 className="text-5xl font-black text-white mb-6">
                {totalBalance.toFixed(2)} <span className="text-purple-400">SUI</span>
              </h1>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Main Wallet</span>
                  <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-bold">{wallets.main.toFixed(2)} SUI</div>
                <div className="text-sm text-gray-500 mt-1">≈ ${(wallets.main * 3.5).toFixed(2)} USD</div>
                <p className="text-xs text-gray-500 mt-1">Deposit Wallet</p>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">ROI Wallet</span>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-3xl font-bold">{wallets.roi.toFixed(2)} SUI</div>
                <div className="text-sm text-gray-500 mt-1">≈ ${(wallets.roi * 3.5).toFixed(2)} USD</div>
                <p className="text-xs text-gray-500 mt-1">Task Rewards</p>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Earning Wallet</span>
                  <ArrowUpRight className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold">{wallets.earning.toFixed(2)} SUI</div>
                <div className="text-sm text-gray-500 mt-1">≈ ${(wallets.earning * 3.5).toFixed(2)} USD</div>
                <p className="text-xs text-gray-500 mt-1">MLM Commission</p>
              </div>

              <div className="p-4 bg-slate-950/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">P2P Wallet</span>
                  <Send className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-3xl font-bold">{wallets.p2p.toFixed(2)} SUI</div>
                <div className="text-sm text-gray-500 mt-1">≈ ${(wallets.p2p * 3.5).toFixed(2)} USD</div>
                <p className="text-xs text-gray-500 mt-1">P2P Transfer</p>
              </div>
            </div>
          </Card>

          {/* Wallet Operations */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full grid grid-cols-4 bg-slate-900/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              <TabsTrigger value="p2p">P2P Transfer</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">Transaction History</h2>
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "deposit" ? "bg-green-500/20" :
                            tx.type === "withdraw" ? "bg-red-500/20" :
                            tx.type === "p2p" ? "bg-yellow-500/20" :
                            "bg-blue-500/20"
                          }`}>
                            {tx.type === "deposit" ? <ArrowDownRight className="w-5 h-5 text-green-400" /> :
                             tx.type === "withdraw" ? <ArrowUpRight className="w-5 h-5 text-red-400" /> :
                             <Send className="w-5 h-5 text-yellow-400" />}
                          </div>
                          <div>
                            <p className="text-white font-semibold capitalize">{tx.type}</p>
                            <p className="text-sm text-gray-400">{tx.wallet} wallet</p>
                            <p className="text-xs text-gray-500">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                            {tx.hash && (
                              <p className="text-xs text-gray-500">{tx.hash}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            tx.type === "deposit" ? "text-green-400" : "text-red-400"
                          }`}>
                            {tx.type === "deposit" ? "+" : "-"}{tx.amount.toFixed(2)} SUI
                          </p>
                          {tx.fee && (
                            <p className="text-xs text-red-400">Fee: {tx.fee.toFixed(2)} SUI</p>
                          )}
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
              </Card>
            </TabsContent>

            <TabsContent value="deposit">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">Deposit SUI</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm mb-2">
                      💡 <strong>Note:</strong> Minimum deposit is 30 SUI. After deposit, admin will verify and credit your wallet.
                    </p>
                  </div>

                  <Card className="p-6">
                    <h3 className="text-xl font-bold mb-4">Deposit SUI</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Deposit Address (SUI Network)
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={depositAddress}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(depositAddress);
                              alert("Address copied to clipboard!");
                            }}
                            variant="outline"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-yellow-400 mt-2">
                          ⚠️ Only send SUI to this address. Minimum deposit: 30 SUI
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Amount (SUI)</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Minimum 30 SUI"
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Transaction Hash (After sending)</Label>
                    <Input
                      type="text"
                      placeholder="Paste transaction hash here"
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                  </div>

                  <Button 
                    onClick={handleDeposit}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Submit Deposit Request
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="withdraw">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">Withdraw SUI</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm mb-2">
                      ⚠️ <strong>Warning:</strong> 50% admin tax applies to external withdrawals. Internal P2P transfers have only 1% fee.
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-300">Select Wallet</Label>
                    <select
                      value={withdrawWallet}
                      onChange={(e) => setWithdrawWallet(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-purple-500/30 rounded-lg text-white mt-2"
                    >
                      <option value="main">Main Wallet ({wallets.main.toFixed(2)} SUI)</option>
                      <option value="roi">ROI Wallet ({wallets.roi.toFixed(2)} SUI)</option>
                      <option value="earning">Earning Wallet ({wallets.earning.toFixed(2)} SUI)</option>
                      <option value="p2p">P2P Wallet ({wallets.p2p.toFixed(2)} SUI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Withdraw Amount (SUI)</label>
                    <Input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter SUI amount"
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                    {withdrawAmount && (
                      <p className="text-sm text-gray-400 mt-2">
                        You will receive: <span className="text-green-400 font-bold">
                          {(parseFloat(withdrawAmount) * 0.5).toFixed(2)} SUI
                        </span> (after 50% fee)
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-300">Your SUI Wallet Address</Label>
                    <Input
                      type="text"
                      placeholder="Enter your SUI wallet address"
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                  </div>

                  <Button 
                    onClick={handleWithdraw}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-12"
                  >
                    <ArrowUpRight className="w-5 h-5 mr-2" />
                    Withdraw SUI
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="p2p">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h2 className="text-2xl font-black text-white mb-6">P2P Transfer</h2>
                
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-sm mb-2">
                      💰 <strong>Info:</strong> 1% fee applies to P2P transfers. Receiver can use max 70% for packages (30% must be fresh deposit).
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-300">P2P Wallet Balance</Label>
                    <div className="p-4 bg-slate-950 border border-purple-500/30 rounded-lg mt-2">
                      <p className="text-2xl font-bold text-white">{wallets.p2p.toFixed(2)} SUI</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Recipient Username</Label>
                    <Input
                      type="text"
                      placeholder="Enter recipient's username"
                      value={p2pRecipient}
                      onChange={(e) => setP2pRecipient(e.target.value)}
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Transfer Amount (SUI)</label>
                    <Input
                      type="number"
                      value={p2pAmount}
                      onChange={(e) => setP2pAmount(e.target.value)}
                      placeholder="Enter SUI amount"
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                    {p2pAmount && (
                      <p className="text-sm text-gray-400 mt-2">
                        Fee: <span className="text-yellow-400 font-bold">
                          {(parseFloat(p2pAmount) * 0.01).toFixed(2)} SUI
                        </span> | Total deduction: <span className="text-red-400 font-bold">
                          {(parseFloat(p2pAmount) * 1.01).toFixed(2)} SUI
                        </span>
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={handleP2PTransfer}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 h-12"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send P2P Transfer
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