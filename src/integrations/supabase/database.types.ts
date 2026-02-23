 
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
        Relationships: [
          {
            foreignKeyName: "admin_impersonation_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_impersonation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "filter_presets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "mlm_commissions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlm_commissions_user_package_id_fkey"
            columns: ["user_package_id"]
            isOneToOne: false
            referencedRelation: "user_packages"
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
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
          min_deposit: number
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
          min_deposit: number
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
          min_deposit?: number
          name?: string
          sort_order?: number | null
          task_interval_hours?: number | null
          task_window_minutes?: number | null
          updated_at?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          email_notifications: boolean | null
          fraud_score: number | null
          full_name: string | null
          id: string
          ip_address: string | null
          is_flagged_for_review: boolean | null
          kyc_verified: boolean | null
          language: string | null
          last_ip_address: string | null
          password_hash: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          role: string | null
          star_rank: number | null
          status: string | null
          team_volume: number | null
          timezone: string | null
          total_deposited: number | null
          total_earned: number | null
          total_withdrawn: number | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          fraud_score?: number | null
          full_name?: string | null
          id: string
          ip_address?: string | null
          is_flagged_for_review?: boolean | null
          kyc_verified?: boolean | null
          language?: string | null
          last_ip_address?: string | null
          password_hash?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          star_rank?: number | null
          status?: string | null
          team_volume?: number | null
          timezone?: string | null
          total_deposited?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications?: boolean | null
          fraud_score?: number | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          is_flagged_for_review?: boolean | null
          kyc_verified?: boolean | null
          language?: string | null
          last_ip_address?: string | null
          password_hash?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          star_rank?: number | null
          status?: string | null
          team_volume?: number | null
          timezone?: string | null
          total_deposited?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          username?: string | null
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
      tasks: {
        Row: {
          claimed_at: string | null
          created_at: string | null
          id: string
          roi_amount: number | null
          roi_percentage: number | null
          status: string
          task_number: number
          user_id: string
          user_package_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          roi_amount?: number | null
          roi_percentage?: number | null
          status?: string
          task_number: number
          user_id: string
          user_package_id: string
          window_end: string
          window_start: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          roi_amount?: number | null
          roi_percentage?: number | null
          status?: string
          task_number?: number
          user_id?: string
          user_package_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          admin_note: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          fee: number | null
          from_user_id: string | null
          hash_key: string | null
          id: string
          net_amount: number
          package_id: string | null
          status: string
          to_user_id: string | null
          type: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
          wallet_type: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fee?: number | null
          from_user_id?: string | null
          hash_key?: string | null
          id?: string
          net_amount: number
          package_id?: string | null
          status?: string
          to_user_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
          wallet_type: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          fee?: number | null
          from_user_id?: string | null
          hash_key?: string | null
          id?: string
          net_amount?: number
          package_id?: string | null
          status?: string
          to_user_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
          wallet_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_packages: {
        Row: {
          completed_at: string | null
          current_roi_earned: number | null
          deposit_amount: number
          id: string
          is_active: boolean | null
          is_completed: boolean | null
          last_task_time: string | null
          max_roi_percentage: number
          next_task_time: string | null
          package_id: string
          purchased_at: string | null
          tasks_completed: number | null
          total_roi_percentage: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_roi_earned?: number | null
          deposit_amount: number
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          last_task_time?: string | null
          max_roi_percentage: number
          next_task_time?: string | null
          package_id: string
          purchased_at?: string | null
          tasks_completed?: number | null
          total_roi_percentage?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_roi_earned?: number | null
          deposit_amount?: number
          id?: string
          is_active?: boolean | null
          is_completed?: boolean | null
          last_task_time?: string | null
          max_roi_percentage?: number
          next_task_time?: string | null
          package_id?: string
          purchased_at?: string | null
          tasks_completed?: number | null
          total_roi_percentage?: number | null
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
            referencedRelation: "users"
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
          created_at: string | null
          earning_balance: number | null
          id: string
          locked_balance: number | null
          main_balance: number | null
          p2p_balance: number | null
          roi_balance: number | null
          total_deposited: number | null
          total_withdrawn: number | null
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
          total_deposited?: number | null
          total_withdrawn?: number | null
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
          total_deposited?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
