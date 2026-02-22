import { SEO } from "@/components/SEO";
import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await authService.resetPassword(email);

    if (error) {
      alert(error.message);
    } else {
      setIsSent(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      <SEO title="Reset Password - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-white">SUI24</span>
          </Link>

          <Card className="p-8 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
            {isSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                <p className="text-gray-400 mb-6">
                  We've sent a password reset link to <span className="text-white">{email}</span>
                </p>
                <Link href="/login">
                  <Button className="w-full bg-slate-800 hover:bg-slate-700">
                    Return to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                  <p className="text-gray-400">Enter your email to receive instructions</p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
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
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg"
                  >
                    {isLoading ? "Sending Link..." : "Send Reset Link"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}