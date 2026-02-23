import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertTriangle, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 Admin Setup Page Mounted");
    setMounted(true);
    console.log("📊 Initial state:", { setupComplete, loading, mounted: true });
  }, []);

  useEffect(() => {
    console.log("🔄 Setup complete changed:", setupComplete);
  }, [setupComplete]);

  const createAdminAccount = async () => {
    console.log("🚀 Create admin account started");
    
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Supabase Auth account
      console.log("⏳ Step 1: Creating Supabase Auth account...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) {
        console.error("❌ Auth error:", authError);
        throw authError;
      }
      if (!authData.user) {
        console.error("❌ No user returned from signUp");
        throw new Error("Failed to create user");
      }

      console.log("✅ Step 1: Auth account created:", authData.user.id);

      // Step 2: Update profile to master_admin role
      console.log("⏳ Step 2: Updating profile to master_admin...");
      const { error: profileError } = await (supabase as any)
        .from("profiles")
        .update({
          role: "master_admin",
          full_name: fullName,
        })
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("❌ Profile update error:", profileError);
        throw profileError;
      }

      console.log("✅ Step 2: Profile updated to master_admin");

      // Step 3: Create or update users table entry
      console.log("⏳ Step 3: Creating users table entry...");
      const referralCode = `ADMIN${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const { error: usersError } = await (supabase as any)
        .from("users")
        .upsert({
          id: authData.user.id,
          email,
          referral_code: referralCode,
        });

      if (usersError) {
        console.error("❌ Users table error:", usersError);
        throw usersError;
      }

      console.log("✅ Step 3: Users table entry created");

      // Step 4: Initialize wallets
      console.log("⏳ Step 4: Initializing wallets...");
      const { error: walletsError } = await (supabase as any)
        .from("wallets")
        .upsert({
          user_id: authData.user.id,
          main_balance: 0,
          roi_balance: 0,
          commission_balance: 0,
          p2p_balance: 0,
        });

      if (walletsError) {
        console.error("❌ Wallets error:", walletsError);
        throw walletsError;
      }

      console.log("✅ Step 4: Wallets initialized");
      console.log("🎉 Admin account creation complete!");

      setSetupComplete(true);

      toast({
        title: "🎉 Admin Account Created!",
        description: "You can now login with your admin credentials",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        console.log("🔄 Redirecting to login...");
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      console.error("❌ Setup error:", error);
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const successVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        delay: 0.2,
      },
    },
  };

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  if (setupComplete) {
    return (
      <>
        <SEO title="Admin Setup Complete - Sui24" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="success"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-md"
            >
              <Card className="w-full p-8 bg-white/10 backdrop-blur-lg border-white/20">
                <div className="text-center space-y-6">
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Setup Complete! 🎉
                    </h2>
                    <p className="text-gray-300">
                      Your admin account has been created successfully.
                    </p>
                    <motion.p
                      className="text-gray-400 text-sm mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      Redirecting to login page...
                    </motion.p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                    >
                      Go to Login
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Admin Setup - Sui24" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <Card className="w-full p-8 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="space-y-6">
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center space-y-2">
                <motion.div
                  className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Shield className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Account Setup
                </h1>
                <p className="text-gray-400 text-sm">
                  Create your master admin account
                </p>
              </motion.div>

              {/* Warning */}
              <motion.div
                variants={itemVariants}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-200">
                  <p className="font-semibold mb-1">Security Notice</p>
                  <p className="text-yellow-300/80">
                    This page should only be used once to create the initial admin account.
                    Store credentials securely.
                  </p>
                </div>
              </motion.div>

              {/* Form */}
              <div className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="fullName" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Admin Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sui24.trade"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50"
                  />
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={createAdminAccount}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                        </motion.div>
                        Creating Admin Account...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Create Admin Account
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              {/* Info */}
              <motion.div
                variants={itemVariants}
                className="text-center text-xs text-gray-400 space-y-1"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  🔒 All credentials are encrypted and stored securely
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  📧 A confirmation email will be sent to the provided address
                </motion.p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}