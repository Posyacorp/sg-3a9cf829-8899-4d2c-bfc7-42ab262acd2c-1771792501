import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Mail, ArrowLeft, CheckCircle2, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/authService";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    console.log("🔍 Forgot Password Page Mounted");
    setMounted(true);
  }, []);

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const emailError = touched ? validateEmail(email) : undefined;
  const isFormValid = !validateEmail(email);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 Password reset requested for:", email);
    
    // Mark as touched for validation
    setTouched(true);
    setError("");

    // Validate email
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    const { error } = await authService.resetPassword(email);

    if (error) {
      console.error("❌ Password reset error:", error);
      
      // Handle rate limiting
      if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
        setError("Too many reset attempts. Please wait a few minutes and try again.");
      } else if (error.message?.includes("not found")) {
        // Security: Don't reveal if email exists or not
        console.log("✅ Email not found, but showing success for security");
        setIsSent(true);
      } else {
        setError(error.message || "Failed to send reset email. Please try again.");
      }
      setIsLoading(false);
    } else {
      console.log("✅ Password reset email sent successfully");
      setIsSent(true);
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

  // Don't render until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  if (isSent) {
    return (
      <>
        <SEO title="Check Your Email - Sui24" />
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
                      Check Your Email! 📧
                    </h2>
                    <p className="text-gray-300 mb-2">
                      We've sent a password reset link to:
                    </p>
                    <p className="text-white font-semibold break-all px-4">
                      {email}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left"
                  >
                    <p className="text-blue-400 text-sm">
                      💡 <strong>Next Steps:</strong>
                    </p>
                    <ul className="text-blue-300 text-sm mt-2 space-y-1 list-disc list-inside">
                      <li>Check your email inbox</li>
                      <li>Click the reset link (valid for 1 hour)</li>
                      <li>Create your new password</li>
                      <li>Login with your new credentials</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="space-y-3"
                  >
                    <Link href="/login">
                      <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                        Return to Login
                      </Button>
                    </Link>

                    <motion.p
                      className="text-xs text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.4 }}
                    >
                      Didn't receive the email? Check your spam folder or{" "}
                      <button
                        onClick={() => {
                          setIsSent(false);
                          setEmail("");
                        }}
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        try again
                      </button>
                    </motion.p>
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
                  <Shield className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white">
                  Reset Your Password
                </h1>
                <p className="text-gray-400 text-sm">
                  Enter your email to receive a password reset link
                </p>
              </motion.div>

              {/* Info Box */}
              <motion.div
                variants={itemVariants}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">🔐 Secure Reset Process</p>
                  <p className="text-blue-300/80">
                    We'll send you a secure link to reset your password. The link expires in 1 hour for security.
                  </p>
                </div>
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

              {/* Form */}
              <form onSubmit={handleReset} className="space-y-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@sui24.trade"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      className={`pl-11 bg-white/5 border-white/10 text-white placeholder:text-gray-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/50 ${
                        emailError ? "border-red-500 focus:ring-red-500/50" : 
                        touched && isFormValid ? "border-green-500" : ""
                      }`}
                      required
                    />
                    {touched && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailError ? (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        ) : isFormValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {emailError && touched && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                          <Mail className="w-4 h-4" />
                        </motion.div>
                        Sending Reset Link...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Back to Login */}
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <Link href="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </motion.div>

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
                  🔒 Your data is protected with industry-standard encryption
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  📧 Reset link expires in 1 hour for your security
                </motion.p>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}