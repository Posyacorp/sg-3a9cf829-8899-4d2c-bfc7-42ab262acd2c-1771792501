import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get referral code from URL
    const ref = router.query.ref as string;
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }));
    }
  }, [router.query]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!formData.referralCode) {
      alert("Referral code is mandatory. You cannot join without an inviter.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Validate Referral Code
      const { data: referrer, error: refError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", formData.referralCode)
        .single();

      if (refError || !referrer) {
        alert("Invalid referral code. Please check and try again.");
        setIsLoading(false);
        return;
      }

      // 2. Sign up with Supabase Auth
      const { error } = await authService.signUp(
        formData.email, 
        formData.password, 
        formData.referralCode, // Pass the referral code
        {
          full_name: formData.username,
          referral_code: formData.referralCode,
          referred_by: referrer.id
        }
      );

      if (error) {
        alert(error.message);
      } else {
        alert("Signup successful! Please check your email to confirm your account.");
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO title="Sign Up - Sui24" />
      
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
              <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
              <p className="text-gray-400">Join Sui24 and start earning</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-11 bg-slate-950 border-purple-500/30 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-11 bg-slate-950 border-purple-500/30 text-white"
                    required
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
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 pr-11 bg-slate-950 border-purple-500/30 text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-11 pr-11 bg-slate-950 border-purple-500/30 text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="referralCode" className="text-gray-300">Referral Code (Optional)</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Enter referral code"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                    className="pl-11 bg-slate-950 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12 text-lg"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}