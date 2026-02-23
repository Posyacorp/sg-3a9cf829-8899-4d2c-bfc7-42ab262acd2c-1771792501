import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit2,
  Save,
  X,
  Copy,
  Check,
  Camera,
  Lock,
  Bell,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Package,
  Wallet,
  QrCode,
  LogOut,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  referral_code: string;
  created_at: string;
  email_notifications: boolean;
  language: string;
  timezone: string;
}

interface UserStats {
  totalDeposits: number;
  totalWithdrawals: number;
  activePackages: number;
  totalEarnings: number;
  currentRank: string;
  totalReferrals: number;
  activeDownline: number;
}

export default function Profile() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    activePackages: 0,
    totalEarnings: 0,
    currentRank: "Star 1",
    totalReferrals: 0,
    activeDownline: 0
  });

  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      await loadProfile(session.user.id);
      await loadStats(session.user.id);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          email_notifications: data.email_notifications ?? true,
          language: data.language || "en",
          timezone: data.timezone || "UTC"
        });
        setEditedProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      // Load user packages
      // Casting to any to avoid TS2589 (excessively deep type instantiation)
      const packagesResponse = await (supabase
        .from("user_packages")
        .select("current_roi_earned")
        .eq("user_id", userId)
        .eq("status", "active") as any);
      
      const packages = packagesResponse.data;

      // Load transactions
      const depositsResponse = await (supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "deposit")
        .eq("status", "completed") as any);
      
      const deposits = depositsResponse.data;

      const withdrawalsResponse = await (supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "withdrawal")
        .eq("status", "completed") as any);
      
      const withdrawals = withdrawalsResponse.data;

      // Load referrals
      const referralsResponse = await (supabase
        .from("profiles")
        .select("id, referral_code")
        .eq("referred_by", userId) as any);
      
      const referrals = referralsResponse.data;

      const totalDeposits = deposits?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0;
      const totalWithdrawals = withdrawals?.reduce((sum: number, w: any) => sum + Number(w.amount), 0) || 0;
      const totalEarnings = packages?.reduce((sum: number, p: any) => sum + Number(p.current_roi_earned || 0), 0) || 0;

      setStats({
        totalDeposits,
        totalWithdrawals,
        activePackages: packages?.length || 0,
        totalEarnings,
        currentRank: calculateRank(totalDeposits),
        totalReferrals: referrals?.length || 0,
        activeDownline: referrals?.filter((r: any) => r.referral_code).length || 0
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const calculateRank = (volume: number): string => {
    if (volume >= 2250000) return "Star 7";
    if (volume >= 375000) return "Star 6";
    if (volume >= 75000) return "Star 5";
    if (volume >= 12500) return "Star 4";
    if (volume >= 2500) return "Star 3";
    if (volume >= 500) return "Star 2";
    if (volume >= 100) return "Star 1";
    return "Unranked";
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          bio: editedProfile.bio,
          email_notifications: editedProfile.email_notifications,
          language: editedProfile.language,
          timezone: editedProfile.timezone,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);

      toast({
        title: "Success! ✅",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Success! ✅",
        description: "Password changed successfully",
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    }
  };

  const copyReferralLink = () => {
    if (!profile) return;
    
    const referralLink = `${window.location.origin}/signup?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    
    toast({
      title: "Copied! ✅",
      description: "Referral link copied to clipboard",
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${profile.referral_code}`;

  return (
    <>
      <SEO title="My Profile - Sui24" />
      
      <div className="min-h-screen gradient-bg">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white">SUI24</span>
              </Link>

              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white mb-2">My Profile</h1>
            <p className="text-white/60">Manage your account settings and personal information</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Overview */}
              <Card className="glass-effect border-white/10 p-6">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                      {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center text-white">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-1">{profile.full_name || "User"}</h2>
                  <p className="text-white/60 text-sm mb-4">{profile.email}</p>

                  <div className="flex items-center justify-center gap-2 text-sm text-white/60 mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/60 text-sm">Account Status</span>
                      <span className="text-green-400 font-semibold">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/60 text-sm">Current Rank</span>
                      <span className="gradient-text font-bold">{stats.currentRank}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats Card */}
              <Card className="glass-effect border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-purple-400" />
                      <span className="text-white/60 text-sm">Total Deposits</span>
                    </div>
                    <span className="text-white font-semibold">{stats.totalDeposits.toFixed(2)} SUI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-white/60 text-sm">Total Earnings</span>
                    </div>
                    <span className="text-green-400 font-semibold">{stats.totalEarnings.toFixed(2)} SUI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span className="text-white/60 text-sm">Active Packages</span>
                    </div>
                    <span className="text-white font-semibold">{stats.activePackages}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span className="text-white/60 text-sm">Total Referrals</span>
                    </div>
                    <span className="text-white font-semibold">{stats.totalReferrals}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Edit Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="glass-effect border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Personal Information</h3>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedProfile(profile);
                        }}
                        variant="outline"
                        className="border-white/20 text-white"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white/80">Full Name</Label>
                    <Input
                      value={editedProfile.full_name || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2 bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white/80">Email Address</Label>
                    <Input
                      value={profile.email}
                      disabled
                      className="mt-2 bg-white/5 border-white/10 text-white/60"
                    />
                  </div>

                  <div>
                    <Label className="text-white/80">Phone Number</Label>
                    <Input
                      value={editedProfile.phone || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+1 (555) 000-0000"
                      className="mt-2 bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white/80">Language</Label>
                    <select
                      value={editedProfile.language || "en"}
                      onChange={(e) => setEditedProfile({ ...editedProfile, language: e.target.value })}
                      disabled={!isEditing}
                      className="mt-2 w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-white/80">Bio</Label>
                    <Textarea
                      value={editedProfile.bio || ""}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      className="mt-2 bg-white/5 border-white/10 text-white resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Referral Section */}
              <Card className="glass-effect border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Referral Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-white/80">Your Referral Code</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={profile.referral_code}
                        readOnly
                        className="bg-white/5 border-white/10 text-white font-mono text-lg"
                      />
                      <Button
                        onClick={copyReferralLink}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80">Your Referral Link</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={referralLink}
                        readOnly
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                      <Button
                        onClick={copyReferralLink}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-purple-400" />
                        <span className="text-white/60 text-sm">Total Referrals</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-pink-400" />
                        <span className="text-white/60 text-sm">Active Downline</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{stats.activeDownline}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Security Settings */}
              <Card className="glass-effect border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                
                {!showPasswordChange ? (
                  <Button
                    onClick={() => setShowPasswordChange(true)}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white/80">New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80">Confirm New Password</Label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="mt-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handlePasswordChange}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Update Password
                      </Button>
                      <Button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }}
                        variant="outline"
                        className="border-white/20 text-white"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Notification Settings */}
              <Card className="glass-effect border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white font-semibold">Email Notifications</div>
                        <div className="text-white/60 text-sm">Receive updates via email</div>
                      </div>
                    </div>
                    <Switch
                      checked={editedProfile.email_notifications ?? true}
                      onCheckedChange={(checked) => {
                        setEditedProfile({ ...editedProfile, email_notifications: checked });
                        if (!isEditing) {
                          setIsEditing(true);
                        }
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}