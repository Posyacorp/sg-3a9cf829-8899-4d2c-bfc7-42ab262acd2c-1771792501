import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Activity, Users, Wallet, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [demoBalance] = useState(1000);

  return (
    <>
      <SEO 
        title="Sui24 - 1000x Crypto Futures Trading & MLM Investment Platform"
        description="Trade crypto futures with 1000x leverage, earn ROI through packages, and build your network with 24-level MLM commission structure"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        {/* Header */}
        <header className="border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">SUI24</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/trade" className="text-gray-300 hover:text-white transition-colors">Trade</Link>
                <Link href="/packages" className="text-gray-300 hover:text-white transition-colors">Packages</Link>
                <Link href="/prediction" className="text-gray-300 hover:text-white transition-colors">Predictions</Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              </nav>

              <div className="flex items-center gap-3">
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
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <span className="text-purple-300 text-sm font-semibold">🚀 1000x Leverage Trading Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-white leading-tight">
              Trade Crypto Futures
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Earn Passive Income
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience high-leverage crypto trading with our advanced prediction system. 
              Invest in packages and earn ROI through task-based rewards with 24-level MLM structure.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/trade">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8">
                  Start Trading Demo
                </Button>
              </Link>
              <Link href="/packages">
                <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8">
                  View Packages
                </Button>
              </Link>
            </div>

            {/* Demo Balance Display */}
            <div className="inline-block px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <span className="text-green-400 text-lg font-bold">Demo Balance: ${demoBalance.toLocaleString()} USDT</span>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1000x Leverage</h3>
              <p className="text-gray-400">
                Maximize your profits with industry-leading leverage on BTC, ETH, SUI, and SOL
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Task-Based ROI</h3>
              <p className="text-gray-400">
                Earn up to 300% returns through simple activity tasks every 3 hours
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">24-Level MLM</h3>
              <p className="text-gray-400">
                Build your network and earn commissions from 24 levels of referrals
              </p>
            </Card>

            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multi-Wallet System</h3>
              <p className="text-gray-400">
                Manage funds across Main, ROI, Earning, and P2P wallets with ease
              </p>
            </Card>
          </div>
        </section>

        {/* Investment Packages Preview */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Investment Packages</h2>
            <p className="text-gray-400 text-lg">Choose your package and start earning passive income</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: "Starter", deposit: 30, roi: 220, color: "purple" },
              { name: "Bronze", deposit: 100, roi: 230, color: "orange" },
              { name: "Silver", deposit: 250, roi: 240, color: "gray" },
              { name: "Gold", deposit: 750, roi: 250, color: "yellow" },
              { name: "Platinum", deposit: 2500, roi: 260, color: "blue" },
              { name: "Diamond", deposit: 5000, roi: 270, color: "cyan" }
            ].map((pkg) => (
              <Card key={pkg.name} className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/40 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-white">{pkg.name}</h3>
                  <Gift className="w-8 h-8 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400 text-sm">Deposit Required</span>
                    <p className="text-3xl font-bold text-white">{pkg.deposit} <span className="text-lg text-purple-400">SUI</span></p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-sm">Maximum ROI</span>
                    <p className="text-2xl font-bold text-green-400">{pkg.roi}%</p>
                  </div>
                  <div className="pt-2">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Select Package
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-4xl font-black text-white mb-2">1000x</p>
              <p className="text-gray-400">Max Leverage</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white mb-2">24</p>
              <p className="text-gray-400">MLM Levels</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white mb-2">300%</p>
              <p className="text-gray-400">Max ROI</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-black text-white mb-2">4</p>
              <p className="text-gray-400">Crypto Assets</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 backdrop-blur-xl bg-slate-950/50 py-8">
          <div className="container mx-auto px-4 text-center text-gray-400">
            <p>&copy; 2026 Sui24.trade - All rights reserved</p>
          </div>
        </footer>
      </div>
    </>
  );
}