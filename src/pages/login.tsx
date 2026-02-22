import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    console.log("Login attempt started...");
    
    const { user, error: authError } = await authService.signIn(email, password);

    if (authError) {
      console.error("Login failed:", authError);
      setError(authError.message);
      setIsLoading(false);
    } else if (user) {
      console.log("Login successful, redirecting...");
      router.push("/dashboard");
    } else {
      setError("Login failed. Please try again.");
      setIsLoading(false);
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

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" className="w-4 h-4" disabled={isLoading} />
                  <Label htmlFor="remember" className="text-gray-400 text-sm">Remember me</Label>
                </div>
                <Link href="/forgot-password" className="text-purple-400 text-sm hover:text-purple-300">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Network diagnostic info */}
            <div className="mt-6 p-4 bg-slate-950/50 rounded-lg text-xs text-gray-500">
              <p className="font-semibold mb-1">Troubleshooting Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Clear browser cache if the issue persists</li>
                <li>Ensure Supabase is accessible in your region</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}