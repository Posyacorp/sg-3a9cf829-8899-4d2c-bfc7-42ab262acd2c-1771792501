import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Trade {
  id: string;
  asset: string;
  direction: "up" | "down";
  amount: number;
  leverage: number;
  entryPrice: number;
  tp: number;
  sl: number;
  timestamp: number;
  result?: "win" | "loss";
  profit?: number;
}

export default function Trade() {
  const [balance, setBalance] = useState(1000);
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [leverage] = useState(1000);
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [autoTpSl, setAutoTpSl] = useState(false);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  const [mode, setMode] = useState<"demo" | "live">("demo");

  const prices = {
    BTC: 95432.50,
    ETH: 3287.20,
    SUI: 4.32,
    SOL: 187.45
  };

  const [currentPrices, setCurrentPrices] = useState(prices);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrices(prev => ({
        BTC: prev.BTC + (Math.random() - 0.5) * 100,
        ETH: prev.ETH + (Math.random() - 0.5) * 10,
        SUI: prev.SUI + (Math.random() - 0.5) * 0.1,
        SOL: prev.SOL + (Math.random() - 0.5) * 5
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const placeTrade = (direction: "up" | "down") => {
    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0 || tradeAmount > balance) {
      alert("Invalid trade amount");
      return;
    }

    const entryPrice = currentPrices[selectedAsset as keyof typeof currentPrices];
    const newTrade: Trade = {
      id: Date.now().toString(),
      asset: selectedAsset,
      direction,
      amount: tradeAmount,
      leverage,
      entryPrice,
      tp: tp ? parseFloat(tp) : 0,
      sl: sl ? parseFloat(sl) : 0,
      timestamp: Date.now()
    };

    setActiveTrades([...activeTrades, newTrade]);
    setBalance(balance - tradeAmount);
    setAmount("");
  };

  const closeTrade = (tradeId: string, isWin: boolean) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade) return;

    const profitMultiplier = isWin ? 1.5 : -1; // Simplified profit calculation
    const profit = trade.amount * profitMultiplier;
    
    const completedTrade = {
      ...trade,
      result: isWin ? "win" as const : "loss" as const,
      profit
    };

    setTradeHistory([completedTrade, ...tradeHistory]);
    setActiveTrades(activeTrades.filter(t => t.id !== tradeId));
    setBalance(balance + trade.amount + profit);
  };

  return (
    <>
      <SEO title="Trade - Sui24" />
      
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
              
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-900/50 border border-purple-500/30 rounded-lg">
                  <span className="text-purple-300 text-sm font-semibold">
                    {mode === "demo" ? "DEMO" : "LIVE"} Mode
                  </span>
                </div>
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-green-400 text-lg font-bold">${balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Trading Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Chart */}
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedAsset}/USDT</h2>
                    <p className="text-2xl text-green-400 font-bold mt-1">
                      ${currentPrices[selectedAsset as keyof typeof currentPrices].toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {Object.keys(prices).map((asset) => (
                      <Button
                        key={asset}
                        onClick={() => setSelectedAsset(asset)}
                        variant={selectedAsset === asset ? "default" : "outline"}
                        className={selectedAsset === asset ? "bg-purple-500 hover:bg-purple-600" : "border-purple-500/50"}
                      >
                        {asset}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Simplified Chart Visual */}
                <div className="h-64 bg-slate-950/50 rounded-lg flex items-center justify-center border border-purple-500/10">
                  <BarChart3 className="w-16 h-16 text-purple-500/30" />
                  <p className="text-gray-500 ml-4">Price Chart Visualization</p>
                </div>
              </Card>

              {/* Active Trades */}
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Active Trades</h3>
                <div className="space-y-3">
                  {activeTrades.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active trades</p>
                  ) : (
                    activeTrades.map((trade) => (
                      <div key={trade.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              trade.direction === "up" ? "bg-green-500/20" : "bg-red-500/20"
                            }`}>
                              {trade.direction === "up" ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-white font-bold">{trade.asset}/USDT</p>
                              <p className="text-sm text-gray-400">
                                {trade.leverage}x Leverage • ${trade.amount}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">${trade.entryPrice.toFixed(2)}</p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => closeTrade(trade.id, true)}
                                className="bg-green-500 hover:bg-green-600 text-xs"
                              >
                                Close Win
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => closeTrade(trade.id, false)}
                                variant="destructive"
                                className="text-xs"
                              >
                                Close Loss
                              </Button>
                            </div>
                          </div>
                        </div>
                        {trade.tp > 0 && (
                          <p className="text-xs text-green-400">TP: ${trade.tp.toFixed(2)}</p>
                        )}
                        {trade.sl > 0 && (
                          <p className="text-xs text-red-400">SL: ${trade.sl.toFixed(2)}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Order Panel */}
            <div className="space-y-6">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Place Order</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Amount (USDT)</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-slate-950 border-purple-500/30 text-white mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Leverage</Label>
                    <div className="px-4 py-3 bg-slate-950 border border-purple-500/30 rounded-lg mt-2">
                      <span className="text-white font-bold text-lg">{leverage}x</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300">Take Profit</Label>
                      <Input
                        type="number"
                        placeholder="TP Price"
                        value={tp}
                        onChange={(e) => setTp(e.target.value)}
                        className="bg-slate-950 border-purple-500/30 text-white mt-2"
                        disabled={autoTpSl}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Stop Loss</Label>
                      <Input
                        type="number"
                        placeholder="SL Price"
                        value={sl}
                        onChange={(e) => setSl(e.target.value)}
                        className="bg-slate-950 border-purple-500/30 text-white mt-2"
                        disabled={autoTpSl}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="auto-tpsl"
                      checked={autoTpSl}
                      onChange={(e) => setAutoTpSl(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="auto-tpsl" className="text-gray-300 text-sm">
                      Auto TP/SL
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      onClick={() => placeTrade("up")}
                      className="bg-green-500 hover:bg-green-600 h-12 text-lg font-bold"
                    >
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Long
                    </Button>
                    <Button
                      onClick={() => placeTrade("down")}
                      variant="destructive"
                      className="h-12 text-lg font-bold"
                    >
                      <TrendingDown className="w-5 h-5 mr-2" />
                      Short
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Trade History */}
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <h3 className="text-xl font-bold text-white mb-4">Recent Trades</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tradeHistory.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="p-3 bg-slate-950/50 rounded-lg border border-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{trade.asset}/USDT</p>
                          <p className="text-xs text-gray-400">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${trade.result === "win" ? "text-green-400" : "text-red-400"}`}>
                            {trade.profit && trade.profit > 0 ? "+" : ""}
                            ${trade.profit?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">{trade.result?.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}