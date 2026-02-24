import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Package = Database['public']['Tables']['packages']['Row'];
type UserPackage = Database['public']['Tables']['user_packages']['Row'];

export const packageService = {
  // Get all available packages
  async getPackages() {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("is_active", true)
      .order("amount", { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get user's active packages
  async getUserPackages(userId: string) {
    const { data, error } = await supabase
      .from("user_packages")
      .select(`
        *,
        packages (
          name,
          roi_percentage,
          task_interval_hours
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Purchase a package
  async purchasePackage(userId: string, packageId: string, amount: number) {
    // 1. Get package details
    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (pkgError) throw pkgError;

    // 2. Create user package
    const { data, error } = await supabase
      .from("user_packages")
      .insert({
        user_id: userId,
        package_id: packageId,
        amount_invested: amount,
        max_return: amount * (pkg.max_return_percentage / 100),
        status: 'active',
        next_task_available: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};