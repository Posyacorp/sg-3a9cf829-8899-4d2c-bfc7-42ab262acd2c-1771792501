import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  Wallet,
  X
} from "lucide-react";

interface Trade {
  id: string;
  asset: string;
  type: "long" | "short";
  entryPrice: number;
  amount: number;
  leverage: number;
  pnl: number;
  timestamp: number;
}

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export default function Trade() {
  // Trading State
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [demoBalance, setDemoBalance] = useState(10000);
  const [amount, setAmount] = useState("");
  const [leverageValue, setLeverageValue] = useState(10);
  const [isLong, setIsLong] = useState(true);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>([]);
  
  // Asset State
  const [selectedAsset, setSelectedAsset] = useState<Asset>({ 
    symbol: "SUI/USDT", 
    name: "Sui Network", 
    price: 1.45, 
    change24h: 2.5 
  });

  // Advanced Settings
  const [tp, setTp] = useState("");
  const [sl, setSl] = useState("");
  const [autoTpSl, setAutoTpSl] = useState(false);

  // Mock Assets
  const assets: Asset[] = [
    { symbol: "SUI/USDT", name: "Sui Network", price: 1.45, change24h: 2.5 },
    { symbol: "BTC/USDT", name: "Bitcoin", price: 64230.50, change24h: 1.2 },
    { symbol: "ETH/USDT", name: "Ethereum", price: 3450.20, change24h: -0.5 },
    { symbol: "SOL/USDT", name: "Solana", price: 145.80, change24h: 4.2 },
  ];

  // Price Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedAsset(prev => ({
        ...prev,
        price: prev.price * (1 + (Math.random() * 0.002 - 0.001))
      }));

      // Update PnL for active trades
      setActiveTrades(trades => trades.map(trade => {
        const currentPrice = selectedAsset.price; // Simplified: using current asset price for all for demo
        const priceDiff = (currentPrice - trade.entryPrice) / trade.entryPrice;
        const pnlPercent = trade.type === "long" ? priceDiff : -priceDiff;
        const pnl = trade.amount * trade.leverage * pnlPercent;
        return { ...trade, pnl };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAsset.price]);

  const handleOpenTrade = () => {
    if (!amount || isNaN(Number(amount))) return;
    const tradeAmount = Number(amount);
    
    if (mode === "demo" && tradeAmount > demoBalance) {
      alert("Insufficient demo balance");
      return;
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      asset: selectedAsset.symbol,
      type: isLong ? "long" : "short",
      entryPrice: selectedAsset.price,
      amount: tradeAmount,
      leverage: leverageValue,
      pnl: 0,
      timestamp: Date.now()
    };

    setActiveTrades([newTrade, ...activeTrades]);
    
    if (mode === "demo") {
      setDemoBalance(prev => prev - tradeAmount);
    }
    
    setAmount("");
  };

  const handleCloseTrade = (tradeId: string) => {
    const trade = activeTrades.find(t => t.id === tradeId);
    if (!trade) return;

    if (mode === "demo") {
      setDemoBalance(prev => prev + trade.amount + trade.pnl);
    }

    setTradeHistory([trade, ...tradeHistory]);
    setActiveTrades(activeTrades.filter(t => t.id !== tradeId));
  };

  return (
    <>
      <SEO title="Trade Futures - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pb-20">
        <header className="border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-white">Futures Trading</h1>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-purple-500/20">
                <button 
                  onClick={() => setMode("real")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${mode === "real" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  Real
                </button>
                <button 
                  onClick={() => setMode("demo")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${mode === "demo" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  Demo
                </button>
              </div>
            </div>
            
            {mode === "demo" && (
              <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                <Wallet className="w-4 h-4" />
                <span className="font-mono font-bold">${demoBalance.toFixed(2)}</span>
              </div>
            )}
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
          {/* Left Column: Chart & Asset Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {assets.map(asset => (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all min-w-[160px] ${
                    selectedAsset.symbol === asset.symbol 
                      ? "bg-purple-500/20 border-purple-500 text-white" 
                      : "bg-slate-900/50 border-white/5 hover:border-purple-500/30 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    selectedAsset.symbol === asset.symbol ? "bg-purple-500 text-white" : "bg-slate-800 text-gray-400"
                  }`}>
                    {asset.symbol.split("/")[0][0]}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sm">{asset.symbol}</div>
                    <div className={asset.change24h >= 0 ? "text-green-400 text-xs" : "text-red-400 text-xs"}>
                      {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Chart Area */}
            <Card className="bg-slate-900/50 border-purple-500/20 p-6 h-[400px] relative overflow-hidden">
              <div className="absolute top-6 left-6 z-10">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl font-black text-white">${selectedAsset.price.toFixed(4)}</h2>
                  <span className={`flex items-center text-sm font-bold ${selectedAsset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {selectedAsset.change24h >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {selectedAsset.change24h}%
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{selectedAsset.name} Price</p>
              </div>
              
              {/* Simplified Chart Visualization */}
              <div className="absolute inset-0 flex items-end opacity-20">
                <div className="w-full h-full bg-gradient-to-t from-purple-500/20 to-transparent"></div>
              </div>
              <div className="w-full h-full flex items-end justify-between gap-1 pt-20">
                 {Array.from({ length: 40 }).map((_, i) => (
                   <div 
                    key={i} 
                    className="w-full bg-purple-500/30 rounded-t-sm hover:bg-purple-500/60 transition-all"
                    style={{ height: `${30 + Math.random() * 50}%` }}
                   ></div>
                 ))}
              </div>
            </Card>

            {/* Active Positions */}
            <Card className="bg-slate-900/50 border-purple-500/20 overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ActivityIcon /> Active Positions
                  <Badge variant="secondary" className="ml-2">{activeTrades.length}</Badge>
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-gray-400">
                    <tr>
                      <th className="p-4">Asset</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Entry</th>
                      <th className="p-4">PnL</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeTrades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No active trades
                        </td>
                      </tr>
                    ) : (
                      activeTrades.map(trade => (
                        <tr key={trade.id} className="text-gray-300 hover:bg-white/5">
                          <td className="p-4 font-bold text-white">{trade.asset} <span className="text-xs text-gray-500 ml-1">{trade.leverage}x</span></td>
                          <td className="p-4">
                            <Badge variant={trade.type === "long" ? "default" : "destructive"} className={trade.type === "long" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                              {trade.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4">${trade.amount}</td>
                          <td className="p-4">${trade.entryPrice.toFixed(4)}</td>
                          <td className={`p-4 font-mono font-bold ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {trade.pnl >= 0 ? "+" : ""}{trade.pnl.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" className="h-8 border-red-500/50 text-red-400 hover:bg-red-500/10" onClick={() => handleCloseTrade(trade.id)}>
                              Close
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Column: Trade Controls */}
          <div className="space-y-6">
            <Card className="bg-slate-900/50 border-purple-500/20 p-6 backdrop-blur-xl sticky top-24">
              <Tabs defaultValue="long" onValueChange={(v) => setIsLong(v === "long")}>
                <TabsList className="w-full grid grid-cols-2 bg-slate-950 border border-white/10 mb-6">
                  <TabsTrigger value="long" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Long</TabsTrigger>
                  <TabsTrigger value="short" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Short</TabsTrigger>
                </TabsList>
                
                <div className="space-y-6">
                  {/* Leverage */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Leverage</span>
                      <span className="text-white font-bold">{leverageValue}x</span>
                    </div>
                    <Slider 
                      value={[leverageValue]} 
                      onValueChange={(v) => setLeverageValue(v[0])}
                      max={100} 
                      min={1} 
                      step={1}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1x</span>
                      <span>50x</span>
                      <span>100x</span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label className="text-gray-400">Amount (USD)</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-slate-950 border-white/10 text-lg font-mono pl-4 pr-12 h-12"
                      />
                      <span className="absolute right-4 top-3 text-gray-500 text-sm font-bold">USDT</span>
                    </div>
                    <div className="flex gap-2">
                      {[10, 25, 50, 100].map(pct => (
                        <button 
                          key={pct}
                          onClick={() => setAmount(mode === "demo" ? (demoBalance * pct / 100).toFixed(0) : "0")}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-1 rounded text-gray-400"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TP/SL Toggle */}
                  <div className="flex items-center justify-between py-2">
                    <Label className="text-gray-400 cursor-pointer" htmlFor="tpsl">TP/SL</Label>
                    <Switch id="tpsl" checked={autoTpSl} onCheckedChange={setAutoTpSl} />
                  </div>

                  {autoTpSl && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Take Profit</Label>
                        <Input 
                          placeholder={selectedAsset.price.toFixed(2)} 
                          value={tp}
                          onChange={(e) => setTp(e.target.value)}
                          className="bg-slate-950 border-white/10 h-9 text-sm" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">Stop Loss</Label>
                        <Input 
                          placeholder={selectedAsset.price.toFixed(2)}
                          value={sl}
                          onChange={(e) => setSl(e.target.value)} 
                          className="bg-slate-950 border-white/10 h-9 text-sm" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="bg-slate-950/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Entry Price</span>
                      <span className="text-white">${selectedAsset.price.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Position Size</span>
                      <span className="text-white">${(Number(amount || 0) * leverageValue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Liquidation</span>
                      <span className="text-orange-400">
                        ${(isLong 
                          ? selectedAsset.price * (1 - 1/leverageValue) 
                          : selectedAsset.price * (1 + 1/leverageValue)
                        ).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fees (0.1%)</span>
                      <span className="text-white">${(Number(amount || 0) * leverageValue * 0.001).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full h-14 text-lg font-bold ${
                      isLong 
                        ? "bg-green-600 hover:bg-green-700 shadow-[0_0_20px_rgba(22,163,74,0.3)]" 
                        : "bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    }`}
                    onClick={handleOpenTrade}
                  >
                    {isLong ? "Open Long" : "Open Short"}
                  </Button>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function ActivityIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5 text-purple-400"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}