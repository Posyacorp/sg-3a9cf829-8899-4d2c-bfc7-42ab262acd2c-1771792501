import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { TrendingUp, Lock, Eye, EyeOff, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });

  useEffect(() => {
    console.log("🔍 Reset Password Page Mounted");
    setMounted(true);

    // Check if we have a valid reset token in the URL
    const checkToken = async () => {
      const hash = window.location.hash;
      console.log("🔑 Checking URL hash:", hash);

      if (!hash || !hash.includes("access_token")) {
        console.error("❌ No access token found in URL");
        setError("Invalid or expired reset link. Please request a new one.");
        setCheckingToken(false);
        return;
      }

      // Token exists, mark as valid
      console.log("✅ Valid reset token found");
      setTokenValid(true);
      setCheckingToken(false);
    };

    checkToken();
  }, []);

  // Password validation
  const validatePassword = (pwd: string): string | undefined => {
    if (!pwd) return "Password is required";
    if (pwd.length < 8) return "Password must be at least 8 characters";
    return undefined;
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPwd: string): string | undefined => {
    if (!confirmPwd) return "Please confirm your password";
    if (confirmPwd !== password) return "Passwords do not match";
    return undefined;
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    if (strength <= 2) return { strength: 33, label: "Weak", color: "red" };
    if (strength <= 3) return { strength: 66, label: "Medium", color: "yellow" };
    return { strength: 100, label: "Strong", color: "green" };
  };

  const passwordError = touched.password ? validatePassword(password) : undefined;
  const confirmError = touched.confirmPassword ? validateConfirmPassword(confirmPassword) : undefined;
  const passwordStrength = password ? getPasswordStrength(password) : null;
  const isFormValid = !validatePassword(password) && !validateConfirmPassword(confirmPassword);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 Password reset submission started");
    setError("");

    // Mark all as touched
    setTouched({ password: true, confirmPassword: true });

    // Validation
    const pwdError = validatePassword(password);
    const confError = validateConfirmPassword(confirmPassword);

    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (confError) {
      setError(confError);
      return;
    }

    setIsLoading(true);

    try {
      // Update password using Supabase
      const { error } = await authService.updatePassword(password);

      if (error) {
        console.error("❌ Password update error:", error);
        throw error;
      }

      console.log("✅ Password updated successfully");
      setIsSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        console.log("🔄 Redirecting to login...");
        router.push("/login");
      }, 3000);

    } catch (error: any) {
      console.error("❌ Reset error:", error);
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
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
        ease: [0.34, 1.56, 0.64, 1],
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

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Checking token state
  if (checkingToken) {
    return (
      <>
        <SEO title="Verifying Reset Link - Sui24" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto"
              >
                <Lock className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white">
                Verifying Reset Link...
              </h2>
              <p className="text-gray-400 text-sm">
                Please wait while we verify your password reset link
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  // Invalid token state
  if (!tokenValid) {
    return (
      <>
        <SEO title="Invalid Reset Link - Sui24" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <motion.div
            variants={successVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            <Link href="/" className="flex items-center justify-center gap-2 mb-8">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="w-7 h-7 text-white" />
              </motion.div>
              <span className="text-3xl font-black text-white">SUI24</span>
            </Link>

            <Card className="w-full p-8 bg-white/10 backdrop-blur-lg border-white/20">
              <div className="text-center space-y-6">
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto"
                >
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Invalid Reset Link
                  </h2>
                  <p className="text-gray-300">
                    {error || "This password reset link is invalid or has expired."}
                  </p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-left">
                  <p className="text-yellow-400 text-sm">
                    💡 <strong>What to do next:</strong>
                  </p>
                  <ul className="text-yellow-300 text-sm mt-2 space-y-1 list-disc list-inside">
                    <li>Request a new password reset link</li>
                    <li>Check that you clicked the latest email link</li>
                    <li>Links expire after 1 hour for security</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Link href="/forgot-password">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      Request New Reset Link
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/5">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <>
        <SEO title="Password Reset Successful - Sui24" />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key="success"
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="w-full max-w-md"
            >
              <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <TrendingUp className="w-7 h-7 text-white" />
                </motion.div>
                <span className="text-3xl font-black text-white">SUI24</span>
              </Link>

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
                      Password Reset Successful! 🎉
                    </h2>
                    <p className="text-gray-300">
                      Your password has been updated successfully.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
                  >
                    <p className="text-green-400 text-sm">
                      ✅ <strong>All Set!</strong>
                    </p>
                    <p className="text-green-300 text-sm mt-2">
                      You can now login with your new password.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      Go to Login
                    </Button>
                  </motion.div>

                  <motion.p
                    className="text-xs text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.4 }}
                  >
                    Redirecting automatically in 3 seconds...
                  </motion.p>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </>
    );
  }

  // Main reset form
  return (
    <>
      <SEO title="Reset Password - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrendingUp className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-3xl font-black text-white">SUI24</span>
          </Link>

          <Card className="p-8 bg-white/10 backdrop-blur-lg border-white/20">
            <div className="space-y-6">
              {/* Header */}
              <motion.div variants={itemVariants} className="text-center space-y-2">
                <motion.div
                  className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Lock className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white">
                  Create New Password
                </h1>
                <p className="text-gray-400 text-sm">
                  Choose a strong password for your account
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Info Box */}
              <motion.div
                variants={itemVariants}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">🔐 Password Requirements</p>
                  <ul className="text-blue-300/80 space-y-1 list-disc list-inside">
                    <li>At least 8 characters long</li>
                    <li>Mix of letters, numbers recommended</li>
                    <li>Unique to this platform</li>
                  </ul>
                </div>
              </motion.div>

              {/* Form */}
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="password" className="text-white">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                      className={`pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 ${
                        passwordError ? "border-red-500 focus:ring-red-500/50" : 
                        touched.password && !passwordError ? "border-green-500" : ""
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordError && touched.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </motion.p>
                  )}
                  {/* Password Strength Indicator */}
                  {password && passwordStrength && !passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Password Strength:</span>
                        <span className={`font-semibold ${
                          passwordStrength.color === "green" ? "text-green-400" :
                          passwordStrength.color === "yellow" ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.strength}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-full ${
                            passwordStrength.color === "green" ? "bg-green-500" :
                            passwordStrength.color === "yellow" ? "bg-yellow-500" :
                            "bg-red-500"
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                      className={`pl-11 pr-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 ${
                        confirmError ? "border-red-500 focus:ring-red-500/50" : 
                        touched.confirmPassword && !confirmError && confirmPassword ? "border-green-500" : ""
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {touched.confirmPassword && !confirmError && confirmPassword && (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {confirmError && touched.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {confirmError}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: isFormValid ? 1.02 : 1 }}
                  whileTap={{ scale: isFormValid ? 0.98 : 1 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="mr-2"
                        >
                          <Lock className="w-4 h-4" />
                        </motion.div>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Info */}
              <motion.div
                variants={itemVariants}
                className="text-center text-xs text-gray-400 space-y-1 pt-4 border-t border-white/10"
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  🔒 Your password is encrypted and secure
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  💡 Remember your password for future logins
                </motion.p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}