import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, DollarSign, Clock, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PredictionMarket {
  id: string;
  question: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  endDate: number;
  totalShares: number;
  status: "active" | "closed" | "resolved";
  result?: "yes" | "no";
}

export default function Predictions() {
  const [markets, setMarkets] = useState<PredictionMarket[]>([
    {
      id: "1",
      question: "Will Bitcoin reach $100,000 by end of Q1 2026?",
      category: "Crypto",
      yesPrice: 0.65,
      noPrice: 0.35,
      volume: 125000,
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 45,
      totalShares: 500000,
      status: "active"
    },
    {
      id: "2",
      question: "Will Ethereum exceed 5000 USDT in February 2026?",
      category: "Crypto",
      yesPrice: 0.48,
      noPrice: 0.52,
      volume: 89000,
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 15,
      totalShares: 350000,
      status: "active"
    },
    {
      id: "3",
      question: "Will SUI coin reach $10 by March 2026?",
      category: "Crypto",
      yesPrice: 0.72,
      noPrice: 0.28,
      volume: 156000,
      endDate: Date.now() + 1000 * 60 * 60 * 24 * 30,
      totalShares: 600000,
      status: "active"
    }
  ]);

  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [betSide, setBetSide] = useState<"yes" | "no">("yes");
  const [betAmount, setBetAmount] = useState("");

  const placeBet = () => {
    if (!selectedMarket || !betAmount) {
      alert("Please select a market and enter bet amount");
      return;
    }

    const amount = parseFloat(betAmount);
    const price = betSide === "yes" ? selectedMarket.yesPrice : selectedMarket.noPrice;
    const shares = amount / price;

    alert(`Bet placed: ${shares.toFixed(2)} shares at ${price} ${betSide.toUpperCase()}`);
    setBetAmount("");
    setSelectedMarket(null);
  };

  const formatTimeRemaining = (endDate: number) => {
    const remaining = endDate - Date.now();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <>
      <SEO title="Prediction Markets - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <header className="border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">SUI24</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/trade" className="text-gray-300 hover:text-white transition-colors">Trade</Link>
                <Link href="/packages" className="text-gray-300 hover:text-white transition-colors">Packages</Link>
                <Link href="/predictions" className="text-white font-semibold">Predictions</Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              </nav>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-green-400 font-bold">150.5 SUI</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-4">
              <span className="text-purple-300 text-sm font-semibold">🎯 Polymarket-Style Prediction Markets</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Trade Crypto Predictions
            </h1>
            <p className="text-gray-400 text-lg">
              Buy and sell shares on future crypto events
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Markets List */}
            <div className="lg:col-span-2 space-y-4">
              {markets.map((market) => (
                <Card 
                  key={market.id}
                  className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all cursor-pointer"
                  onClick={() => setSelectedMarket(market)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-2">
                          {market.category}
                        </Badge>
                        <h3 className="text-lg font-bold text-white mb-2">{market.question}</h3>
                      </div>
                      <Badge className={
                        market.status === "active" ? "bg-green-500/20 text-green-400" :
                        market.status === "closed" ? "bg-gray-500/20 text-gray-400" :
                        "bg-blue-500/20 text-blue-400"
                      }>
                        {market.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-green-400 text-sm font-semibold">YES</span>
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-2xl font-black text-white">${market.yesPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 mt-1">{(market.yesPrice * 100).toFixed(0)}% chance</p>
                      </div>

                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-red-400 text-sm font-semibold">NO</span>
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        </div>
                        <p className="text-2xl font-black text-white">${market.noPrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 mt-1">{(market.noPrice * 100).toFixed(0)}% chance</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          <DollarSign className="w-4 h-4" />
                          <span>{market.volume.toLocaleString()} SUI</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{market.totalShares.toLocaleString()} shares</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-purple-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeRemaining(market.endDate)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Bet Placement */}
            <div>
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl sticky top-4">
                <h2 className="text-xl font-black text-white mb-4">Place Bet</h2>
                
                {selectedMarket ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-950/50 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Selected Market</p>
                      <p className="text-white font-semibold text-sm">{selectedMarket.question}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => setBetSide("yes")}
                        className={`h-16 ${
                          betSide === "yes" 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-slate-950 hover:bg-slate-900 border border-green-500/30"
                        }`}
                      >
                        <div className="text-center">
                          <p className="text-sm">YES</p>
                          <p className="text-lg font-bold">${selectedMarket.yesPrice.toFixed(2)}</p>
                        </div>
                      </Button>

                      <Button
                        onClick={() => setBetSide("no")}
                        className={`h-16 ${
                          betSide === "no" 
                            ? "bg-red-500 hover:bg-red-600" 
                            : "bg-slate-950 hover:bg-slate-900 border border-red-500/30"
                        }`}
                      >
                        <div className="text-center">
                          <p className="text-sm">NO</p>
                          <p className="text-lg font-bold">${selectedMarket.noPrice.toFixed(2)}</p>
                        </div>
                      </Button>
                    </div>

                    <div>
                      <label className="text-gray-400 text-sm">Amount (SUI)</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="bg-slate-950 border-purple-500/30 text-white mt-2"
                      />
                    </div>

                    {betAmount && (
                      <div className="p-3 bg-slate-950/50 rounded-lg space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Shares:</span>
                          <span className="text-white font-semibold">
                            {(parseFloat(betAmount) / (betSide === "yes" ? selectedMarket.yesPrice : selectedMarket.noPrice)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Profit:</span>
                          <span className="text-green-400 font-semibold">
                            {(parseFloat(betAmount) * (betSide === "yes" ? (1 - selectedMarket.yesPrice) / selectedMarket.yesPrice : (1 - selectedMarket.noPrice) / selectedMarket.noPrice)).toFixed(2)} SUI
                          </span>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={placeBet}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12"
                    >
                      Place Bet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select a market to place a bet</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}