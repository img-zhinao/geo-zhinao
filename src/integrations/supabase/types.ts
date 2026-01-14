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
      contact_inquiries: {
        Row: {
          company: string
          created_at: string
          id: string
          message: string | null
          name: string
          phone: string
          status: string
        }
        Insert: {
          company: string
          created_at?: string
          id?: string
          message?: string | null
          name: string
          phone: string
          status?: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          status?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnosis_reports: {
        Row: {
          citation_authority_audit: Json | null
          citations: string | null
          created_at: string | null
          diagnostic_model: string | null
          faithfulness_score: number | null
          id: string
          industry: string | null
          job_id: string | null
          missing_geo_pillars: string | null
          optimization_suggestions: string | null
          reasoning_trace: string | null
          root_cause_analysis: string | null
          scan_result_id: string
          status: string | null
          tokens_cached: number | null
          tokens_input: number | null
          tokens_output: number | null
          tokens_reasoning: number | null
          tokens_used: number | null
        }
        Insert: {
          citation_authority_audit?: Json | null
          citations?: string | null
          created_at?: string | null
          diagnostic_model?: string | null
          faithfulness_score?: number | null
          id?: string
          industry?: string | null
          job_id?: string | null
          missing_geo_pillars?: string | null
          optimization_suggestions?: string | null
          reasoning_trace?: string | null
          root_cause_analysis?: string | null
          scan_result_id: string
          status?: string | null
          tokens_cached?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
          tokens_reasoning?: number | null
          tokens_used?: number | null
        }
        Update: {
          citation_authority_audit?: Json | null
          citations?: string | null
          created_at?: string | null
          diagnostic_model?: string | null
          faithfulness_score?: number | null
          id?: string
          industry?: string | null
          job_id?: string | null
          missing_geo_pillars?: string | null
          optimization_suggestions?: string | null
          reasoning_trace?: string | null
          root_cause_analysis?: string | null
          scan_result_id?: string
          status?: string | null
          tokens_cached?: number | null
          tokens_input?: number | null
          tokens_output?: number | null
          tokens_reasoning?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnosis_reports_scan_result_id_fkey"
            columns: ["scan_result_id"]
            isOneToOne: false
            referencedRelation: "scan_results"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          credits_balance: number | null
          email: string | null
          full_name: string | null
          id: string
          last_reset_date: string | null
          monthly_free_quota: number | null
          tier_level: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          credits_balance?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          last_reset_date?: string | null
          monthly_free_quota?: number | null
          tier_level?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          credits_balance?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_reset_date?: string | null
          monthly_free_quota?: number | null
          tier_level?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      scan_jobs: {
        Row: {
          brand_name: string
          competitors: string[] | null
          created_at: string | null
          id: string
          search_query: string
          selected_models: Json | null
          status: string | null
          target_region: string | null
          user_id: string
        }
        Insert: {
          brand_name: string
          competitors?: string[] | null
          created_at?: string | null
          id?: string
          search_query: string
          selected_models?: Json | null
          status?: string | null
          target_region?: string | null
          user_id: string
        }
        Update: {
          brand_name?: string
          competitors?: string[] | null
          created_at?: string | null
          id?: string
          search_query?: string
          selected_models?: Json | null
          status?: string | null
          target_region?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scan_results: {
        Row: {
          avs_score: number | null
          citations: Json | null
          competitors_mentioned: string | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          job_id: string
          model_name: string
          rank_position: number | null
          raw_response_text: string | null
          sentiment_score: number | null
          spi_score: number | null
        }
        Insert: {
          avs_score?: number | null
          citations?: Json | null
          competitors_mentioned?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          job_id: string
          model_name: string
          rank_position?: number | null
          raw_response_text?: string | null
          sentiment_score?: number | null
          spi_score?: number | null
        }
        Update: {
          avs_score?: number | null
          citations?: Json | null
          competitors_mentioned?: string | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          job_id?: string
          model_name?: string
          rank_position?: number | null
          raw_response_text?: string | null
          sentiment_score?: number | null
          spi_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scan_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_results: {
        Row: {
          algorithm: string | null
          analysis_reasoning_full: string | null
          applied_strategy_id: string
          created_at: string | null
          diagnosis_id: string
          geo_metrics: Json | null
          id: string
          improvement_analysis: string | null
          industry: string | null
          job_id: string | null
          model_outputs: Json | null
          optimized_content_snippet: string | null
          predicted_rank_change: string | null
          si_scores: Json | null
          status: string | null
          strategies_used: Json | null
        }
        Insert: {
          algorithm?: string | null
          analysis_reasoning_full?: string | null
          applied_strategy_id: string
          created_at?: string | null
          diagnosis_id: string
          geo_metrics?: Json | null
          id?: string
          improvement_analysis?: string | null
          industry?: string | null
          job_id?: string | null
          model_outputs?: Json | null
          optimized_content_snippet?: string | null
          predicted_rank_change?: string | null
          si_scores?: Json | null
          status?: string | null
          strategies_used?: Json | null
        }
        Update: {
          algorithm?: string | null
          analysis_reasoning_full?: string | null
          applied_strategy_id?: string
          created_at?: string | null
          diagnosis_id?: string
          geo_metrics?: Json | null
          id?: string
          improvement_analysis?: string | null
          industry?: string | null
          job_id?: string | null
          model_outputs?: Json | null
          optimized_content_snippet?: string | null
          predicted_rank_change?: string | null
          si_scores?: Json | null
          status?: string | null
          strategies_used?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_results_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnosis_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      top_up_requests: {
        Row: {
          amount_cny: number
          created_at: string
          credits_requested: number
          id: string
          notes: string | null
          processed_at: string | null
          status: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount_cny: number
          created_at?: string
          credits_requested: number
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount_cny?: number
          created_at?: string
          credits_requested?: number
          id?: string
          notes?: string | null
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: Json
      }
      refund_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id: string
          p_reference_type: string
          p_user_id: string
        }
        Returns: Json
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
