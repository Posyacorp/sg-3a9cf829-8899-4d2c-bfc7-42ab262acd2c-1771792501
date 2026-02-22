import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { User, Shield, Key, Wallet, Mail, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, updateUserProfile } from "@/services/userService";
import { walletService } from "@/services/walletService";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { success, user, error } = await getCurrentUser();
      if (!success || !user) {
        toast({
          title: "Error fetching profile",
          description: error,
          variant: "destructive",
        });
        return;
      }

      setProfile(user);
      setFullName(user.full_name || "");
      setUsername(user.username || "");

      const walletRes = await walletService.getUserWallet(user.id);
      if (walletRes.success) {
        setWallet(walletRes.wallet);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { success, error } = await updateUserProfile({
        full_name: fullName,
        username: username,
      });

      if (success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        fetchProfileData(); // Refresh data
      } else {
        toast({
          title: "Update failed",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="My Profile - Sui24" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 pb-12">
        <header className="border-b border-purple-500/20 backdrop-blur-xl bg-slate-950/50 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">My Profile</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* User Info Card */}
            <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                    {profile?.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{profile?.email}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        {profile?.role?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={
                        profile?.status === 'active' ? "border-green-500/50 text-green-400" : "border-red-500/50 text-red-400"
                      }>
                        {profile?.status?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-400">Joined</p>
                   <p className="text-white">{new Date(profile?.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="email" 
                      value={profile?.email || ""} 
                      disabled 
                      className="pl-9 bg-slate-950/50 border-purple-500/20 text-gray-400 cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="fullname" className="text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="fullname" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-9 bg-slate-950 border-purple-500/20 text-white focus:border-purple-500" 
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username" className="text-gray-300">Username (Unique)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input 
                      id="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a unique username"
                      className="pl-9 bg-slate-950 border-purple-500/20 text-white focus:border-purple-500" 
                    />
                  </div>
                  <p className="text-xs text-gray-500">Required for P2P transfers.</p>
                </div>

                <Button type="submit" disabled={saving} className="w-full bg-purple-600 hover:bg-purple-700">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white mr-2"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Financial Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Deposited</span>
                    <span className="text-white font-mono">{wallet?.total_deposited || 0} SUI</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Withdrawn</span>
                    <span className="text-white font-mono">{wallet?.total_withdrawn || 0} SUI</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Security</h3>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Referral Code</span>
                    <Badge variant="secondary" className="font-mono">{profile?.referral_code}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">KYC Status</span>
                    <Badge variant={profile?.kyc_verified ? "default" : "outline"} className={profile?.kyc_verified ? "bg-green-600" : "text-yellow-400 border-yellow-400/50"}>
                      {profile?.kyc_verified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Password Reset Link */}
             <Card className="p-6 bg-slate-900/50 border-purple-500/20 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h3 className="font-semibold text-white">Password</h3>
                      <p className="text-sm text-gray-400">Change your account password</p>
                    </div>
                  </div>
                  <Link href="/forgot-password">
                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                      Reset Password
                    </Button>
                  </Link>
                </div>
             </Card>

          </div>
        </div>
      </div>
    </>
  );
}