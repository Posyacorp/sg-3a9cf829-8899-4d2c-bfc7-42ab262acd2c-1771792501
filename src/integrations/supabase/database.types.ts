 
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
      admin_impersonation: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          commission_type: string
          created_at: string | null
          from_user_id: string
          id: string
          level: number
          percentage: number
          source_transaction_id: string | null
          to_user_id: string
        }
        Insert: {
          amount: number
          commission_type: string
          created_at?: string | null
          from_user_id: string
          id?: string
          level: number
          percentage: number
          source_transaction_id?: string | null
          to_user_id: string
        }
        Update: {
          amount?: number
          commission_type?: string
          created_at?: string | null
          from_user_id?: string
          id?: string
          level?: number
          percentage?: number
          source_transaction_id?: string | null
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_source_transaction_id_fkey"
            columns: ["source_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      filter_presets: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          is_default: boolean | null
          is_public: boolean | null
          preset_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters: Json
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          preset_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          preset_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          risk_score: number | null
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          severity: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      mlm_commissions: {
        Row: {
          base_amount: number
          commission_amount: number
          commission_percentage: number
          created_at: string | null
          from_user_id: string
          id: string
          level: number | null
          package_id: string | null
          status: string | null
          type: string
          user_id: string
          user_package_id: string | null
        }
        Insert: {
          base_amount: number
          commission_amount: number
          commission_percentage: number
          created_at?: string | null
          from_user_id: string
          id?: string
          level?: number | null
          package_id?: string | null
          status?: string | null
          type: string
          user_id: string
          user_package_id?: string | null
        }
        Update: {
          base_amount?: number
          commission_amount?: number
          commission_percentage?: number
          created_at?: string | null
          from_user_id?: string
          id?: string
          level?: number | null
          package_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
          user_package_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mlm_commissions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mlm_network: {
        Row: {
          created_at: string | null
          id: string
          level: number
          path: string
          sponsor_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: number
          path: string
          sponsor_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number
          path?: string
          sponsor_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlm_network_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_network_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          amount: number
          created_at: string | null
          daily_roi_limit: number | null
          id: string
          is_active: boolean | null
          max_return_percentage: number
          name: string
          roi_percentage: number
          task_interval_hours: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          daily_roi_limit?: number | null
          id?: string
          is_active?: boolean | null
          max_return_percentage: number
          name: string
          roi_percentage: number
          task_interval_hours?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          daily_roi_limit?: number | null
          id?: string
          is_active?: boolean | null
          max_return_percentage?: number
          name?: string
          roi_percentage?: number
          task_interval_hours?: number | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prediction_bets: {
        Row: {
          amount: number
          bet_type: string
          created_at: string | null
          entry_price: number
          id: string
          payout: number | null
          prediction_id: string
          shares: number
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bet_type: string
          created_at?: string | null
          entry_price: number
          id?: string
          payout?: number | null
          prediction_id: string
          shares: number
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bet_type?: string
          created_at?: string | null
          entry_price?: number
          id?: string
          payout?: number | null
          prediction_id?: string
          shares?: number
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_bets_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_markets: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          no_probability: number | null
          no_volume: number | null
          outcome: string | null
          resolution_date: string | null
          status: string
          title: string
          total_volume: number | null
          updated_at: string | null
          yes_probability: number | null
          yes_volume: number | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          no_probability?: number | null
          no_volume?: number | null
          outcome?: string | null
          resolution_date?: string | null
          status?: string
          title: string
          total_volume?: number | null
          updated_at?: string | null
          yes_probability?: number | null
          yes_volume?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          no_probability?: number | null
          no_volume?: number | null
          outcome?: string | null
          resolution_date?: string | null
          status?: string
          title?: string
          total_volume?: number | null
          updated_at?: string | null
          yes_probability?: number | null
          yes_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_markets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_trades: {
        Row: {
          amount: number
          created_at: string | null
          entry_probability: number
          id: string
          market_id: string
          payout: number | null
          prediction: string
          resolved_at: string | null
          shares: number
          status: string
          user_id: string
          wallet_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          entry_probability: number
          id?: string
          market_id: string
          payout?: number | null
          prediction: string
          resolved_at?: string | null
          shares: number
          status?: string
          user_id: string
          wallet_type?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          entry_probability?: number
          id?: string
          market_id?: string
          payout?: number | null
          prediction?: string
          resolved_at?: string | null
          shares?: number
          status?: string
          user_id?: string
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_trades_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          no_price: number | null
          resolved_at: string | null
          result: string | null
          status: string | null
          title: string
          total_volume: number | null
          yes_price: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          no_price?: number | null
          resolved_at?: string | null
          result?: string | null
          status?: string | null
          title: string
          total_volume?: number | null
          yes_price?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          no_price?: number | null
          resolved_at?: string | null
          result?: string | null
          status?: string | null
          title?: string
          total_volume?: number | null
          yes_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          is_admin: boolean | null
          language: string | null
          phone: string | null
          referral_code: string
          referred_by: string | null
          role: string | null
          star_rank: number | null
          team_volume: number | null
          timezone: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          id: string
          ip_address?: string | null
          is_active?: boolean | null
          is_admin?: boolean | null
          language?: string | null
          phone?: string | null
          referral_code: string
          referred_by?: string | null
          role?: string | null
          star_rank?: number | null
          team_volume?: number | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          is_admin?: boolean | null
          language?: string | null
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          role?: string | null
          star_rank?: number | null
          team_volume?: number | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          id: string
          reward_amount: number
          reward_percentage: number
          status: string | null
          user_id: string
          user_package_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          reward_amount: number
          reward_percentage: number
          status?: string | null
          user_id: string
          user_package_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          id?: string
          reward_amount?: number
          reward_percentage?: number
          status?: string | null
          user_id?: string
          user_package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_package_id_fkey"
            columns: ["user_package_id"]
            isOneToOne: false
            referencedRelation: "user_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_positions: {
        Row: {
          amount: number
          auto_close: boolean | null
          closed_at: string | null
          created_at: string | null
          direction: string
          entry_price: number
          exit_price: number | null
          id: string
          is_demo: boolean | null
          leverage: number
          opened_at: string | null
          profit_loss: number | null
          status: string
          stop_loss: number | null
          symbol: string
          take_profit: number | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_close?: boolean | null
          closed_at?: string | null
          created_at?: string | null
          direction: string
          entry_price: number
          exit_price?: number | null
          id?: string
          is_demo?: boolean | null
          leverage?: number
          opened_at?: string | null
          profit_loss?: number | null
          status?: string
          stop_loss?: number | null
          symbol: string
          take_profit?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_close?: boolean | null
          closed_at?: string | null
          created_at?: string | null
          direction?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          is_demo?: boolean | null
          leverage?: number
          opened_at?: string | null
          profit_loss?: number | null
          status?: string
          stop_loss?: number | null
          symbol?: string
          take_profit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_positions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string | null
          fee: number | null
          from_wallet: string | null
          hash_key: string | null
          id: string
          processed_at: string | null
          recipient_id: string | null
          status: string | null
          to_wallet: string | null
          transaction_type: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string | null
          fee?: number | null
          from_wallet?: string | null
          hash_key?: string | null
          id?: string
          processed_at?: string | null
          recipient_id?: string | null
          status?: string | null
          to_wallet?: string | null
          transaction_type: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string | null
          fee?: number | null
          from_wallet?: string | null
          hash_key?: string | null
          id?: string
          processed_at?: string | null
          recipient_id?: string | null
          status?: string | null
          to_wallet?: string | null
          transaction_type?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_packages: {
        Row: {
          amount_invested: number
          completed_at: string | null
          created_at: string | null
          id: string
          last_task_click: string | null
          max_return: number
          missed_tasks: number | null
          next_task_available: string | null
          package_id: string
          status: string | null
          total_earned: number | null
          user_id: string
        }
        Insert: {
          amount_invested: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_task_click?: string | null
          max_return: number
          missed_tasks?: number | null
          next_task_available?: string | null
          package_id: string
          status?: string | null
          total_earned?: number | null
          user_id: string
        }
        Update: {
          amount_invested?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_task_click?: string | null
          max_return?: number
          missed_tasks?: number | null
          next_task_available?: string | null
          package_id?: string
          status?: string | null
          total_earned?: number | null
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
        ]
      }
      users: {
        Row: {
          account_status: string | null
          created_at: string | null
          direct_referrals: number | null
          email: string
          full_name: string | null
          has_active_package: boolean | null
          id: string
          ip_address: string | null
          last_login: string | null
          phone: string | null
          referral_code: string
          referred_by: string | null
          star_rank: number | null
          team_volume: number | null
          total_commission_earned: number | null
          total_deposit: number | null
          total_roi_earned: number | null
          total_withdrawal: number | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string | null
          created_at?: string | null
          direct_referrals?: number | null
          email: string
          full_name?: string | null
          has_active_package?: boolean | null
          id: string
          ip_address?: string | null
          last_login?: string | null
          phone?: string | null
          referral_code: string
          referred_by?: string | null
          star_rank?: number | null
          team_volume?: number | null
          total_commission_earned?: number | null
          total_deposit?: number | null
          total_roi_earned?: number | null
          total_withdrawal?: number | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string | null
          created_at?: string | null
          direct_referrals?: number | null
          email?: string
          full_name?: string | null
          has_active_package?: boolean | null
          id?: string
          ip_address?: string | null
          last_login?: string | null
          phone?: string | null
          referral_code?: string
          referred_by?: string | null
          star_rank?: number | null
          team_volume?: number | null
          total_commission_earned?: number | null
          total_deposit?: number | null
          total_roi_earned?: number | null
          total_withdrawal?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          locked_balance: number | null
          updated_at: string | null
          user_id: string
          wallet_type: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          locked_balance?: number | null
          updated_at?: string | null
          user_id: string
          wallet_type: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          locked_balance?: number | null
          updated_at?: string | null
          user_id?: string
          wallet_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_fraud_alert: {
        Args: {
          p_alert_type: string
          p_description: string
          p_risk_score?: number
          p_severity: string
          p_user_id: string
        }
        Returns: string
      }
      credit_wallet: {
        Args: { p_amount: number; p_user_id: string; p_wallet_type: string }
        Returns: undefined
      }
      generate_referral_code: { Args: never; Returns: string }
      internal_transfer: {
        Args: {
          p_amount: number
          p_from_wallet: string
          p_to_wallet: string
          p_user_id: string
        }
        Returns: undefined
      }
      lock_funds: {
        Args: { p_amount: number; p_user_id: string; p_wallet_type: string }
        Returns: undefined
      }
      log_user_activity: {
        Args: {
          p_activity_type: string
          p_description: string
          p_ip_address?: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      p2p_transfer: {
        Args: {
          p_amount: number
          p_fee: number
          p_receiver_id: string
          p_sender_id: string
          p_wallet_type: string
        }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_wallet_balance: {
        Args: { p_amount: number; p_user_id: string; p_wallet_type: string }
        Returns: undefined
      }
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
