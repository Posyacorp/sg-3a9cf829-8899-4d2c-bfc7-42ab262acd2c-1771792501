import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { Loader2, AlertCircle, CheckCircle2, Wifi, WifiOff, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [testingConnection, setTestingConnection] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1);
      if (error) throw error;
      setConnectionStatus("connected");
      console.log("✅ Supabase connected successfully");
    } catch (err) {
      console.error("❌ Connection test failed:", err);
      setConnectionStatus("disconnected");
    } finally {
      setTestingConnection(false);
    }
  };

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    setValidationErrors(errors);
    return !errors.email && !errors.password;
  };

  // Handle field blur (touched state)
  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate on blur
    if (field === "email") {
      setValidationErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setValidationErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  // Handle field change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (touched.email) {
      setValidationErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (touched.password) {
      setValidationErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return !validateEmail(email) && !validatePassword(password) && connectionStatus === "connected";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    if (connectionStatus !== "connected") {
      setError("Authentication server is not reachable. Please test connection first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 Login attempt started...");
      console.log("📧 Email:", email);

      // Pre-login connection test
      const { error: testError } = await supabase.from("profiles").select("count").limit(1);
      if (testError) {
        throw new Error("Connection test failed. Please check your internet connection.");
      }
      console.log("✅ Pre-login connection test passed");

      // Attempt login with retry logic
      let loginError: any = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        console.log(`🔄 Login attempt ${attempt}/2`);
        
        const result = await authService.signIn(email, password);
        
        if (result.error) {
          loginError = result.error;
          console.error(`❌ Attempt ${attempt} failed:`, result.error);
          
          if (attempt < 2) {
            console.log("⏳ Retrying in 1 second...");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          console.log("✅ Login successful!");
          loginError = null;
          break;
        }
      }

      if (loginError) {
        throw loginError;
      }

      // Get user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", email)
        .single();

      // Redirect based on role
      if (profile?.role === "master_admin" || profile?.role === "admin") {
        console.log("🔐 Admin user detected, redirecting to admin dashboard");
        router.push("/admin/dashboard");
      } else {
        console.log("👤 Regular user, redirecting to user dashboard");
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before logging in. Check your inbox for the verification link.";
      } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
        errorMessage = "Network error: Unable to connect to authentication server. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Login - Sui24"
        description="Login to your Sui24 account to access trading, predictions, and MLM features"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 bg-gray-900/50 backdrop-blur border-purple-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-400">Login to your Sui24 account</p>
            </div>

            {/* Connection Status */}
            <div className="mb-6">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                connectionStatus === "connected" 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : connectionStatus === "disconnected"
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-blue-500/10 border border-blue-500/20"
              }`}>
                {connectionStatus === "checking" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                {connectionStatus === "connected" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {connectionStatus === "disconnected" && <AlertCircle className="w-4 h-4 text-red-400" />}
                <span className={`text-sm ${
                  connectionStatus === "connected" ? "text-green-400" : 
                  connectionStatus === "disconnected" ? "text-red-400" : 
                  "text-blue-400"
                }`}>
                  {connectionStatus === "checking" && "Checking connection..."}
                  {connectionStatus === "connected" && "✓ Connected to authentication server"}
                  {connectionStatus === "disconnected" && "⚠ Cannot reach authentication server"}
                </span>
              </div>
              
              {connectionStatus === "disconnected" && (
                <Button
                  type="button"
                  onClick={testConnection}
                  disabled={testingConnection}
                  variant="outline"
                  className="w-full mt-3 border-blue-500/20 hover:bg-blue-500/10"
                >
                  {testingConnection ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">
                  {error}
                  {error.includes("Network error") && (
                    <div className="mt-2 text-xs text-red-300">
                      <p className="font-semibold mb-1">Common issues:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Check your email and password</li>
                        <li>Make sure your account is verified</li>
                        <li>Check your internet connection</li>
                        <li>Try disabling VPN if enabled</li>
                        <li>Clear browser cache and try again</li>
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@sui24.trade"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur("email")}
                    disabled={loading}
                    className={`pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 ${
                      touched.email && validationErrors.email 
                        ? "border-red-500 focus:border-red-500" 
                        : touched.email && !validationErrors.email 
                        ? "border-green-500 focus:border-green-500" 
                        : ""
                    }`}
                    autoComplete="email"
                  />
                  {touched.email && !validationErrors.email && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
                  )}
                </div>
                {touched.email && validationErrors.email && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur("password")}
                    disabled={loading}
                    className={`pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 ${
                      touched.password && validationErrors.password 
                        ? "border-red-500 focus:border-red-500" 
                        : touched.password && !validationErrors.password 
                        ? "border-green-500 focus:border-green-500" 
                        : ""
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {touched.password && validationErrors.password && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Validation Summary */}
              {(touched.email || touched.password) && !isFormValid() && (
                <div className="text-xs text-gray-400 text-center">
                  {!email && !password && "Please fill in all fields"}
                  {connectionStatus !== "connected" && "Please ensure connection is active"}
                </div>
              )}
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                  Sign Up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}