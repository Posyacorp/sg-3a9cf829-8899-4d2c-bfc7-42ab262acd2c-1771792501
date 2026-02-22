import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { Shield, UserCog, Crown, CheckCircle, XCircle } from "lucide-react";

export default function AdminSetup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "master_admin">("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [existingAdmins, setExistingAdmins] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchAdmins();
  }, []);

  const checkAuth = async () => {
    const user = await authService.getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user is master_admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "master_admin") {
      // If no master admin exists yet, allow first setup
      const { data: admins } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "master_admin");

      if (admins && admins.length > 0) {
        router.push("/dashboard");
        return;
      }
    }

    setCurrentUser(user);
  };

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, created_at")
      .in("role", ["admin", "master_admin"])
      .order("created_at", { ascending: false });

    setExistingAdmins(data || []);
  };

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Find user by email
      const { data: profiles, error: findError } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("email", email)
        .single();

      if (findError || !profiles) {
        setMessage({ type: "error", text: "User not found with this email" });
        setLoading(false);
        return;
      }

      // Update role in profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", profiles.id);

      if (updateError) {
        setMessage({ type: "error", text: `Failed to update profile: ${updateError.message}` });
        setLoading(false);
        return;
      }

      // Update users table (role is only in profiles now, skipping users table update for role)
      /* 
      await supabase
        .from("users")
        .update({ role })
        .eq("id", profiles.id);
      */

      setMessage({ 
        type: "success", 
        text: `Successfully promoted ${email} to ${role === "master_admin" ? "Master Admin" : "Admin"}` 
      });
      
      setEmail("");
      fetchAdmins();
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }

    setLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Create new admin account
      const { user, error } = await authService.signUp(email, password, `ADMIN${Date.now()}`);

      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
        return;
      }

      if (!user) {
        setMessage({ type: "error", text: "Failed to create user" });
        setLoading(false);
        return;
      }

      // Update role
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", user.id);

      if (updateError) {
        setMessage({ type: "error", text: `User created but failed to set admin role: ${updateError.message}` });
        setLoading(false);
        return;
      }

      // Update users table (role is only in profiles now, skipping users table update for role)
      /*
      await supabase
        .from("users")
        .update({ role })
        .eq("id", user.id);
      */

      setMessage({ 
        type: "success", 
        text: `Successfully created new ${role === "master_admin" ? "Master Admin" : "Admin"} account` 
      });
      
      setEmail("");
      setPassword("");
      fetchAdmins();
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }

    setLoading(false);
  };

  const handleRevokeAdmin = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to revoke admin access for ${userEmail}?`)) {
      return;
    }

    try {
      // Update role back to user
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: "user" })
        .eq("id", userId);

      if (updateError) {
        setMessage({ type: "error", text: `Failed to revoke access: ${updateError.message}` });
        return;
      }

      // Update users table (role is only in profiles now, skipping users table update for role)
      /*
      await supabase
        .from("users")
        .update({ role: "user" })
        .eq("id", userId);
      */

      setMessage({ type: "success", text: `Successfully revoked admin access for ${userEmail}` });
      fetchAdmins();
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  };

  return (
    <>
      <SEO 
        title="Admin Setup - Sui24"
        description="Configure admin accounts for Sui24 platform"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h1 className="text-4xl font-bold mb-2">Admin Account Setup</h1>
              <p className="text-gray-400">Manage platform administrators</p>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === "success" ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50"
              }`}>
                {message.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <p className={message.type === "success" ? "text-green-300" : "text-red-300"}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Promote Existing User */}
              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <UserCog className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-semibold">Promote Existing User</h2>
                </div>
                
                <form onSubmit={handlePromoteUser} className="space-y-4">
                  <div>
                    <Label htmlFor="promote-email">User Email</Label>
                    <Input
                      id="promote-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="promote-role">Admin Role</Label>
                    <Select value={role} onValueChange={(value: "admin" | "master_admin") => setRole(value)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Processing..." : "Promote User"}
                  </Button>
                </form>
              </Card>

              {/* Create New Admin */}
              <Card className="bg-white/5 border-white/10 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-semibold">Create New Admin</h2>
                </div>
                
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <Label htmlFor="new-email">Admin Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@sui24.trade"
                      required
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-password">Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Strong password"
                      required
                      minLength={6}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="new-role">Admin Role</Label>
                    <Select value={role} onValueChange={(value: "admin" | "master_admin") => setRole(value)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Creating..." : "Create Admin Account"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Existing Admins List */}
            <Card className="bg-white/5 border-white/10 p-6">
              <h2 className="text-xl font-semibold mb-4">Current Administrators</h2>
              
              {existingAdmins.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No administrators found</p>
              ) : (
                <div className="space-y-3">
                  {existingAdmins.map((admin) => (
                    <div 
                      key={admin.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div>
                        <p className="font-medium">{admin.email}</p>
                        <p className="text-sm text-gray-400">{admin.full_name || "No name set"}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {new Date(admin.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          admin.role === "master_admin" 
                            ? "bg-yellow-500/20 text-yellow-300" 
                            : "bg-blue-500/20 text-blue-300"
                        }`}>
                          {admin.role === "master_admin" ? "Master Admin" : "Admin"}
                        </span>
                        {currentUser?.id !== admin.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeAdmin(admin.id, admin.email)}
                            className="border-red-500/50 text-red-300 hover:bg-red-500/10"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/dashboard")}
                className="border-white/20 text-gray-300 hover:bg-white/5"
              >
                Go to Admin Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}