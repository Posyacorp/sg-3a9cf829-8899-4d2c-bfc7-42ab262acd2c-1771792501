 
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      mlm_commissions: {
        Row: {
          base_amount: number
          commission_amount: number
          commission_rate: number
          commission_type: string
          created_at: string | null
          from_user_id: string
          id: string
          level: number
          package_id: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          base_amount: number
          commission_amount: number
          commission_rate: number
          commission_type: string
          created_at?: string | null
          from_user_id: string
          id?: string
          level: number
          package_id?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          base_amount?: number
          commission_amount?: number
          commission_rate?: number
          commission_type?: string
          created_at?: string | null
          from_user_id?: string
          id?: string
          level?: number
          package_id?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlm_commissions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string | null
          daily_roi_limit: number | null
          id: string
          is_active: boolean | null
          max_roi_percentage: number
          min_investment: number
          name: string
          sort_order: number | null
          task_interval_hours: number | null
          task_window_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_roi_limit?: number | null
          id?: string
          is_active?: boolean | null
          max_roi_percentage: number
          min_investment: number
          name: string
          sort_order?: number | null
          task_interval_hours?: number | null
          task_window_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_roi_limit?: number | null
          id?: string
          is_active?: boolean | null
          max_roi_percentage?: number
          min_investment?: number
          name?: string
          sort_order?: number | null
          task_interval_hours?: number | null
          task_window_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          ip_address: string | null
          kyc_verified: boolean | null
          referral_code: string | null
          referred_by: string | null
          role: string | null
          star_rank: number | null
          status: string | null
          team_volume: number | null
          total_deposited: number | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          ip_address?: string | null
          kyc_verified?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          star_rank?: number | null
          status?: string | null
          team_volume?: number | null
          total_deposited?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          kyc_verified?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          star_rank?: number | null
          status?: string | null
          team_volume?: number | null
          total_deposited?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          description: string | null
          fee_amount: number | null
          from_wallet: string | null
          hash_key: string | null
          id: string
          net_amount: number | null
          recipient_id: string | null
          status: string | null
          to_wallet: string | null
          type: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
          wallet_type: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          fee_amount?: number | null
          from_wallet?: string | null
          hash_key?: string | null
          id?: string
          net_amount?: number | null
          recipient_id?: string | null
          status?: string | null
          to_wallet?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          description?: string | null
          fee_amount?: number | null
          from_wallet?: string | null
          hash_key?: string | null
          id?: string
          net_amount?: number | null
          recipient_id?: string | null
          status?: string | null
          to_wallet?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_packages: {
        Row: {
          claims_count: number | null
          completed_at: string | null
          created_at: string | null
          id: string
          investment_amount: number
          last_claim_at: string | null
          max_roi_percentage: number
          missed_claims: number | null
          next_claim_at: string | null
          package_id: string
          purchased_at: string | null
          roi_percentage_earned: number | null
          status: string | null
          total_roi_earned: number | null
          user_id: string
        }
        Insert: {
          claims_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          investment_amount: number
          last_claim_at?: string | null
          max_roi_percentage: number
          missed_claims?: number | null
          next_claim_at?: string | null
          package_id: string
          purchased_at?: string | null
          roi_percentage_earned?: number | null
          status?: string | null
          total_roi_earned?: number | null
          user_id: string
        }
        Update: {
          claims_count?: number | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          investment_amount?: number
          last_claim_at?: string | null
          max_roi_percentage?: number
          missed_claims?: number | null
          next_claim_at?: string | null
          package_id?: string
          purchased_at?: string | null
          roi_percentage_earned?: number | null
          status?: string | null
          total_roi_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_packages_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_packages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          created_at: string | null
          earning_balance: number | null
          id: string
          locked_balance: number | null
          main_balance: number | null
          p2p_balance: number | null
          roi_balance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          earning_balance?: number | null
          id?: string
          locked_balance?: number | null
          main_balance?: number | null
          p2p_balance?: number | null
          roi_balance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          earning_balance?: number | null
          id?: string
          locked_balance?: number | null
          main_balance?: number | null
          p2p_balance?: number | null
          roi_balance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
