import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
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
  const [referralCodeStatus, setReferralCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [referralCodeError, setReferralCodeError] = useState("");
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    const checkFirstUser = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .neq('role', 'admin')
          .neq('role', 'master_admin');

        if (error) {
          console.error("Error checking user count:", error);
          return;
        }

        setIsFirstUser(count === 0);
      } catch (error) {
        console.error("Exception checking first user:", error);
      }
    };

    checkFirstUser();
  }, []);

  useEffect(() => {
    const ref = router.query.ref as string;
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref.toUpperCase() }));
      setIsReferralLocked(true);
    }
  }, [router.query]);

  useEffect(() => {
    const referralCode = formData.referralCode;
    
    if (isFirstUser) {
      setReferralCodeStatus('idle');
      setReferralCodeError("");
      return;
    }

    if (!referralCode || referralCode.trim().length === 0) {
      setReferralCodeStatus('idle');
      setReferralCodeError("Referral code is required");
      return;
    }

    const timeoutId = setTimeout(async () => {
      setReferralCodeStatus('checking');
      setReferralCodeError("");

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('referral_code', referralCode.trim())
          .maybeSingle();

        if (error) {
          console.error("Referral code validation error:", error);
          setReferralCodeStatus('invalid');
          setReferralCodeError("Error checking referral code");
          return;
        }

        if (!data) {
          setReferralCodeStatus('invalid');
          setReferralCodeError("Invalid referral code");
        } else {
          setReferralCodeStatus('valid');
          setReferralCodeError("");
        }
      } catch (error) {
        console.error("Referral code validation exception:", error);
        setReferralCodeStatus('invalid');
        setReferralCodeError("Error validating referral code");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.referralCode, isFirstUser]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const DEFAULT_ADMIN_REFERRAL = "SUI406086";
      let referralCodeToUse = formData.referralCode.trim();

      if (isFirstUser) {
        referralCodeToUse = DEFAULT_ADMIN_REFERRAL;
      } else {
        if (!referralCodeToUse) {
          alert("Referral code is required");
          setIsLoading(false);
          return;
        }
        
        if (referralCodeStatus !== 'valid') {
          alert("Please enter a valid referral code");
          setIsLoading(false);
          return;
        }
      }

      const { data: referrer, error: refError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCodeToUse)
        .single();

      if (refError || !referrer) {
        alert("Unable to find referrer. Please contact support.");
        setIsLoading(false);
        return;
      }

      const { error } = await authService.signUp(
        formData.email, 
        formData.password, 
        referralCodeToUse,
        {
          full_name: formData.username,
          referral_code: referralCodeToUse,
          referred_by: referrer.id
        }
      );

      if (error) {
        alert(error.message);
      } else {
        // TEMPORARY: Email verification bypassed
        alert("Signup successful! You can now login immediately.");
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

              {!isFirstUser && (
                <div>
                  <Label htmlFor="referralCode" className="text-gray-300">
                    Referral Code <span className="text-red-400">*</span>
                    {isReferralLocked && (
                      <span className="ml-2 text-xs text-purple-400">(Auto-filled from link)</span>
                    )}
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter referral code"
                      value={formData.referralCode}
                      onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                      className={`pl-11 pr-11 bg-slate-950 text-white ${
                        isReferralLocked 
                          ? 'border-purple-500/50 cursor-not-allowed opacity-80' 
                          : 'border-purple-500/30'
                      } ${
                        referralCodeStatus === 'valid' ? 'border-green-500/50' : 
                        referralCodeStatus === 'invalid' ? 'border-red-500/50' : ''
                      }`}
                      disabled={isLoading}
                      readOnly={isReferralLocked}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {referralCodeStatus === 'checking' && (
                        <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                      )}
                      {referralCodeStatus === 'valid' && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                      {referralCodeStatus === 'invalid' && (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  {isReferralLocked && (
                    <p className="text-purple-400 text-sm mt-1">🔒 Referral code locked from your invite link</p>
                  )}
                  {referralCodeError && !isReferralLocked && formData.referralCode && (
                    <p className="text-red-400 text-sm mt-1">{referralCodeError}</p>
                  )}
                  {referralCodeStatus === 'valid' && !isReferralLocked && (
                    <p className="text-green-400 text-sm mt-1">✓ Valid referral code</p>
                  )}
                </div>
              )}

              {isFirstUser && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    🎉 <strong>First User Signup!</strong> You will be automatically assigned to admin's referral tree.
                  </p>
                </div>
              )}

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