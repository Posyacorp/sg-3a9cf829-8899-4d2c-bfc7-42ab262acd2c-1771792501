import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Gift, Zap, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Package {
  id: number;
  name: string;
  deposit: number;
  maxRoi: number;
  color: string;
  icon: string;
}

const packages: Package[] = [
  { id: 1, name: "Starter", deposit: 30, maxRoi: 220, color: "purple", icon: "🌟" },
  { id: 2, name: "Bronze", deposit: 100, maxRoi: 230, color: "orange", icon: "🥉" },
  { id: 3, name: "Silver", deposit: 250, maxRoi: 240, color: "gray", icon: "🥈" },
  { id: 4, name: "Gold", deposit: 750, maxRoi: 250, color: "yellow", icon: "🥇" },
  { id: 5, name: "Platinum", deposit: 2500, maxRoi: 260, color: "blue", icon: "💎" },
  { id: 6, name: "Diamond", deposit: 5000, maxRoi: 270, color: "cyan", icon: "💠" },
  { id: 7, name: "Elite", deposit: 7500, maxRoi: 280, color: "indigo", icon: "👑" },
  { id: 8, name: "Master", deposit: 10000, maxRoi: 290, color: "pink", icon: "⭐" },
  { id: 9, name: "Legend", deposit: 15000, maxRoi: 300, color: "red", icon: "🔥" }
];

export default function PackagesPage() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isLoggedIn] = useState(false);

  return (
    <>
      <SEO 
        title="Investment Packages - Sui24"
        description="Choose your investment package and start earning up to 300% ROI through task-based rewards"
      />
      
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
                <Link href="/packages" className="text-white font-semibold">Packages</Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              </nav>

              <div className="flex items-center gap-3">
                {!isLoggedIn ? (
                  <>
                    <Link href="/login">
                      <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <span className="text-green-400 font-bold">150.5 SUI</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
              <span className="text-purple-300 text-sm font-semibold">💰 Task-Based ROI System</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              Investment Packages
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Earn up to 300% ROI through simple activity tasks. Click every 3 hours to receive random rewards.
            </p>
          </div>

          {/* How It Works */}
          <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2">1. Buy Package</h3>
              <p className="text-gray-400 text-sm">Choose and purchase your investment package</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold mb-2">2. Wait 1 Hour</h3>
              <p className="text-gray-400 text-sm">Package activates after 1 hour</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-bold mb-2">3. Click Task</h3>
              <p className="text-gray-400 text-sm">Click every 3 hours (30min window)</p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl text-center">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-white font-bold mb-2">4. Earn ROI</h3>
              <p className="text-gray-400 text-sm">Receive random rewards up to 10%/day</p>
            </Card>
          </div>

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id}
                className={`p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all cursor-pointer ${
                  selectedPackage?.id === pkg.id ? "ring-2 ring-purple-500" : ""
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-4xl mb-2">{pkg.icon}</div>
                    <h3 className="text-2xl font-black text-white">{pkg.name}</h3>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    Package {pkg.id}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Deposit Required</span>
                    <p className="text-3xl font-black text-white mt-1">
                      {pkg.deposit} <span className="text-lg text-purple-400">SUI</span>
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-lg">
                    <span className="text-gray-400 text-sm">Maximum ROI</span>
                    <p className="text-3xl font-black text-green-400 mt-1">
                      {pkg.maxRoi}%
                    </p>
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Daily Reward</span>
                      <span className="text-white font-semibold">Up to 10%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Task Frequency</span>
                      <span className="text-white font-semibold">Every 3 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Return</span>
                      <span className="text-green-400 font-bold">{pkg.deposit * (pkg.maxRoi / 100)} SUI</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
                    onClick={() => {
                      if (!isLoggedIn) {
                        window.location.href = "/signup";
                      }
                    }}
                  >
                    {isLoggedIn ? "Buy Package" : "Sign Up to Buy"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* MLM Benefits */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="p-8 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
              <div className="text-center mb-8">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-2">24-Level MLM Commission</h2>
                <p className="text-gray-400">Earn commissions from your entire network</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-white font-bold mb-3">ROI-to-ROI Commission</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">Level 1</span>
                      <span className="text-green-400 font-bold">3.0%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">Level 2</span>
                      <span className="text-green-400 font-bold">2.0%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">Level 3</span>
                      <span className="text-green-400 font-bold">1.0%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">Level 4-6</span>
                      <span className="text-green-400 font-bold">0.5% each</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">Level 7-18</span>
                      <span className="text-green-400 font-bold">0.25% each</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">Level 22-24</span>
                      <span className="text-green-400 font-bold">Up to 3.0%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-bold mb-3">Star Rank System</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">⭐ Star 1 (100 SUI)</span>
                      <span className="text-green-400 font-bold">3%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">⭐⭐ Star 2 (500 SUI)</span>
                      <span className="text-green-400 font-bold">6%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">⭐⭐⭐ Star 3 (2.5K SUI)</span>
                      <span className="text-green-400 font-bold">9%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">⭐⭐⭐⭐ Star 4 (12.5K SUI)</span>
                      <span className="text-green-400 font-bold">12%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">⭐⭐⭐⭐⭐ Star 5 (75K SUI)</span>
                      <span className="text-green-400 font-bold">15%</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-950/50 rounded">
                      <span className="text-gray-400">🌟 Star 6-7</span>
                      <span className="text-green-400 font-bold">Up to 21%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}