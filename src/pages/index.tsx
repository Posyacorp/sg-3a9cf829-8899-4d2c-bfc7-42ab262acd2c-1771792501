import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, 
  Rocket, 
  Users, 
  Shield, 
  Zap, 
  ArrowUpRight,
  Wallet,
  Activity,
  Trophy,
  Star,
  ChevronRight,
  ArrowDownRight
} from "lucide-react";

interface PriceTicker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function Home() {
  const [suiPrice, setSuiPrice] = useState({ price: 0, change: 0, loading: true });

  // Fetch real-time SUI price from CoinGecko API
  useEffect(() => {
    const fetchSuiPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await response.json();
        
        if (data.sui) {
          setSuiPrice({
            price: data.sui.usd,
            change: data.sui.usd_24h_change || 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch SUI price:', error);
        // Fallback to approximate price if API fails
        setSuiPrice({ price: 0.90, change: 0, loading: false });
      }
    };

    fetchSuiPrice();
    // Update price every 30 seconds
    const interval = setInterval(fetchSuiPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const [priceChange, setPriceChange] = useState<number>(0);
  const [tickers, setTickers] = useState<PriceTicker[]>([
    { symbol: "SUI", price: 0.92, change: 5.2, changePercent: 5.2 },
    { symbol: "BTC", price: 98420, change: 1250, changePercent: 1.3 },
    { symbol: "ETH", price: 3680, change: -45, changePercent: -1.2 },
    { symbol: "SOL", price: 189, change: 8.5, changePercent: 4.7 }
  ]);

  useEffect(() => {
    // Simulate real-time price updates for other coins
    const interval = setInterval(() => {
      setTickers(prev => prev.map(ticker => {
        const randomChange = (Math.random() - 0.5) * 2;
        const newPrice = ticker.price + randomChange;
        const change = newPrice - ticker.price;
        const changePercent = (change / ticker.price) * 100;
        
        // Don't simulate SUI price in tickers, let the main API handle it
        if (ticker.symbol === "SUI") {
           // Optional: You could sync the ticker SUI price with the real suiPrice state here if you wanted,
           // but for now, we'll just let it drift slightly or remove this block to prevent errors.
           // We will just return the ticker updated with random noise for the "ticker tape" effect,
           // BUT we will NOT call setSuiPrice() here.
        }
        
        return {
          ...ticker,
          price: newPrice,
          change,
          changePercent
        };
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Rocket,
      title: "1000x Leverage",
      description: "Trade crypto futures with maximum leverage"
    },
    {
      icon: Users,
      title: "24-Level MLM",
      description: "Earn passive income from 24 levels deep"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Multi-wallet system with advanced security"
    },
    {
      icon: Zap,
      title: "Instant Rewards",
      description: "ROI rewards every 3 hours with task completion"
    }
  ];

  const packages = [
    { amount: 30, roi: 220, duration: "Variable" },
    { amount: 100, roi: 230, duration: "Variable" },
    { amount: 250, roi: 240, duration: "Variable" },
    { amount: 750, roi: 250, duration: "Variable" }
  ];

  return (
    <>
      <SEO 
        title="SUI24 - 1000x Leverage Trading & Passive Income Platform"
        description="Trade crypto futures with 1000x leverage and earn passive income through our 24-level MLM system. Start with just 30 SUI."
        image="/og-image.png"
      />
      
      <div className="min-h-screen gradient-bg relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: "2s"}}></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: "4s"}}></div>
        </div>

        {/* Live Price Ticker */}
        <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center gap-8 ticker-scroll">
            {[...tickers, ...tickers].map((ticker, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 py-3 whitespace-nowrap">
                <span className="text-white/70 font-medium">{ticker.symbol}/USDT</span>
                <span className="text-white font-bold">${ticker.price.toFixed(2)}</span>
                <span className={`text-sm font-semibold ${ticker.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live SUI Price Ticker */}
        <div className="fixed top-20 left-0 right-0 z-40 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4">
            <div className="glass-card rounded-2xl p-4 pointer-events-auto animate-float">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-purple-300 font-medium">SUI Live Price:</span>
                </div>
                
                {suiPrice.loading ? (
                  <div className="animate-pulse flex gap-2">
                    <div className="h-6 w-24 bg-purple-500/20 rounded"></div>
                    <div className="h-6 w-16 bg-purple-500/20 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      ${suiPrice.price.toFixed(4)}
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      suiPrice.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {suiPrice.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {suiPrice.change >= 0 ? '+' : ''}{suiPrice.change.toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-white">SUI24</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/login">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm sm:text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm sm:text-base">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative z-10 pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
              {/* Live SUI Price Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-effect">
                <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                <span className="text-white/70 font-medium">SUI Live Price:</span>
                <span className="text-2xl font-bold text-white">${suiPrice.price.toFixed(4)}</span>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${suiPrice.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {suiPrice.change >= 0 ? '+' : ''}{suiPrice.change.toFixed(2)}%
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass-effect">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <span className="text-sm sm:text-base text-white/90 font-semibold">🚀 1000x Leverage Trading Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight">
                <span className="text-white">Trade Crypto</span>
                <br />
                <span className="text-white">Futures</span>
                <br />
                <span className="gradient-text">Earn Passive</span>
                <br />
                <span className="gradient-text">Income</span>
              </h1>

              <p className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed px-4">
                Experience high-leverage crypto trading with our innovative 24-level MLM system. 
                Start earning passive income with just 30 SUI.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 px-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl shadow-2xl shadow-purple-500/50">
                    Start Trading Now
                    <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/trade" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-xl">
                    Try Demo
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 sm:pt-12 max-w-3xl mx-auto">
                {[
                  { label: "Active Users", value: "12,847" },
                  { label: "Total Volume", value: "$45M+" },
                  { label: "Avg ROI", value: "240%" },
                  { label: "Packages", value: "9" }
                ].map((stat, idx) => (
                  <Card key={idx} className="glass-effect border-white/10 p-4 sm:p-6">
                    <div className="text-2xl sm:text-3xl font-black gradient-text">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative z-10 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-center mb-8 sm:mb-12 text-white">
              Why Choose <span className="gradient-text">SUI24</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {features.map((feature, idx) => (
                <Card key={idx} className="glass-effect border-white/10 p-6 sm:p-8 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-white/60">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Packages Preview */}
        <section className="relative z-10 py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black text-center mb-8 sm:mb-12 text-white">
              Investment <span className="gradient-text">Packages</span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {packages.map((pkg, idx) => (
                <Card key={idx} className="glass-effect border-white/10 p-6 sm:p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-center mb-4 sm:mb-6">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-black gradient-text mb-2">{pkg.amount} SUI</div>
                    <div className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6">Minimum Investment</div>
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/60">ROI:</span>
                        <span className="text-green-400 font-bold">{pkg.roi}%</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/60">Duration:</span>
                        <span className="text-white font-semibold">{pkg.duration}</span>
                      </div>
                    </div>
                    <Link href="/packages">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-sm sm:text-base">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-12">
              <Link href="/packages">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold">
                  View All 9 Packages
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <Card className="glass-effect border-white/10 p-8 sm:p-12 max-w-4xl mx-auto text-center">
              <Star className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-6 sm:mb-8" />
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
                Ready to Start <span className="gradient-text">Earning?</span>
              </h2>
              <p className="text-base sm:text-xl text-white/70 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of traders earning passive income with SUI24. 
                Start with just 30 SUI and unlock up to 300% ROI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 rounded-xl shadow-2xl shadow-purple-500/50">
                    Create Account
                    <Wallet className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/trade" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white/10 font-semibold text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-6 rounded-xl">
                    Try Demo First
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-sm py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-white">SUI24</span>
                </div>
                <p className="text-xs sm:text-sm text-white/60">
                  The ultimate crypto trading and passive income platform.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                  <li><Link href="/trade" className="hover:text-white transition-colors">Trading</Link></li>
                  <li><Link href="/packages" className="hover:text-white transition-colors">Packages</Link></li>
                  <li><Link href="/predictions" className="hover:text-white transition-colors">Predictions</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Account</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                  <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
              <p className="text-xs sm:text-sm text-white/60">
                © 2026 SUI24.trade - All rights reserved
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}