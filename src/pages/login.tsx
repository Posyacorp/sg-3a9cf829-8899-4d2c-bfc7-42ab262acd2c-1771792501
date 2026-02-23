import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const testConnection = async () => {
    setConnectionStatus('checking');
    toast({
      title: "Testing Connection...",
      description: "Checking Supabase connection",
    });

    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error("Connection test failed:", error);
        setConnectionStatus('disconnected');
        toast({
          variant: "destructive",
          title: "Connection Failed ❌",
          description: "Unable to reach authentication server",
        });
      } else {
        console.log("Connection test successful:", data);
        setConnectionStatus('connected');
        toast({
          title: "Connection Successful ✅",
          description: "Authentication server is reachable",
        });
      }
    } catch (err) {
      console.error("Connection exception:", err);
      setConnectionStatus('disconnected');
      toast({
        variant: "destructive",
        title: "Connection Error ❌",
        description: "Network error - please check your internet",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);
    
    console.log("🔐 Login attempt started...");
    console.log("📧 Email:", email);
    console.log("🌐 Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Test connection first
    try {
      const { error: connectionError } = await supabase.from('profiles').select('count').limit(1);
      if (connectionError) {
        console.error("❌ Pre-login connection test failed:", connectionError);
        setError("Cannot connect to authentication server. Please check your internet connection and try again.");
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Unable to reach authentication server",
        });
        return;
      }
      console.log("✅ Pre-login connection test passed");
    } catch (connErr) {
      console.error("❌ Connection exception:", connErr);
      setError("Network error - unable to reach server. Please check your internet connection.");
      setIsLoading(false);
      return;
    }
    
    // Show loading toast
    toast({
      title: "Signing in...",
      description: "Please wait while we verify your credentials",
    });
    
    const { user, error: authError } = await authService.signIn(email, password);

    if (authError) {
      console.error("❌ Login failed:", authError);
      setError(authError.message);
      setIsLoading(false);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: authError.message,
      });
    } else if (user) {
      console.log("✅ Login successful!");
      console.log("👤 User:", user.email);
      setSuccess(true);
      
      // Show success toast
      toast({
        title: "Login Successful! 🎉",
        description: "Redirecting to your dashboard...",
      });
      
      // Check user role and redirect accordingly
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const isAdmin = profile?.role === 'admin' || profile?.role === 'master_admin';
        
        setTimeout(() => {
          console.log("🔄 Redirecting to dashboard...");
          router.push(isAdmin ? "/admin/dashboard" : "/dashboard");
        }, 1500);
      } catch (roleErr) {
        console.error("Role check error:", roleErr);
        // Default to user dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } else {
      console.error("❌ Unexpected error: No user returned");
      setError("Login failed. Please try again.");
      setIsLoading(false);
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <>
      <SEO title="Login - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-white">SUI24</span>
          </Link>

          <Card className="p-8 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to access your account</p>
            </div>

            {/* Connection Status Indicator */}
            {connectionStatus && (
              <Alert className={`mb-6 ${connectionStatus === 'connected' ? 'bg-green-500/10 border-green-500/50 text-green-400' : connectionStatus === 'disconnected' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-blue-500/10 border-blue-500/50 text-blue-400'}`}>
                {connectionStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                {connectionStatus === 'connected' && <Wifi className="h-4 w-4" />}
                {connectionStatus === 'disconnected' && <WifiOff className="h-4 w-4" />}
                <AlertDescription>
                  {connectionStatus === 'checking' && "Testing connection..."}
                  {connectionStatus === 'connected' && "✅ Connected to authentication server"}
                  {connectionStatus === 'disconnected' && "❌ Cannot reach authentication server"}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="mb-6 bg-green-500/10 border-green-500/50 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold">Login Successful! 🎉</div>
                  <div className="text-sm mt-1">Redirecting to your dashboard...</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && !success && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">{error}</div>
                  <div className="text-sm space-y-1">
                    <div>Common issues:</div>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Check your email and password</li>
                      <li>Make sure your account is verified</li>
                      <li>Check your internet connection</li>
                      <li>Try the "Test Connection" button below</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 bg-slate-950 border-purple-500/30 text-white"
                    required
                    disabled={isLoading || success}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 bg-slate-950 border-purple-500/30 text-white"
                    required
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    disabled={isLoading || success}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    className="w-4 h-4" 
                    disabled={isLoading || success} 
                  />
                  <Label htmlFor="remember" className="text-gray-400 text-sm">Remember me</Label>
                </div>
                <Link href="/forgot-password" className="text-purple-400 text-sm hover:text-purple-300">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : success ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Success! Redirecting...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Test Connection Button */}
            {error && !isLoading && !success && (
              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={testConnection}
                  disabled={connectionStatus === 'checking'}
                >
                  {connectionStatus === 'checking' ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testing Connection...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      Test Connection
                    </span>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => {
                    setError("");
                    setPassword("");
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Admin Quick Login Hint */}
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-400 text-center">
                <strong>Admin?</strong> Use your admin credentials to access the dashboard
              </p>
            </div>

            {/* Network diagnostic info */}
            <div className="mt-6 p-4 bg-slate-950/50 rounded-lg text-xs text-gray-500">
              <p className="font-semibold mb-1">Troubleshooting Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Clear browser cache if the issue persists</li>
                <li>Click "Test Connection" to verify server status</li>
                <li>Check browser console (F12) for detailed logs</li>
              </ul>
            </div>

            {/* Console Log Indicator (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-xs text-blue-400">
                <div className="font-semibold mb-1">🔧 Developer Mode</div>
                <div>Check browser console (F12) for detailed logs</div>
                <div className="mt-2 font-mono text-[10px] text-gray-500">
                  Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}