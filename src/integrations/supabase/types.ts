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
      scan_jobs: {
        Row: {
          brand_name: string
          competitors: string | null
          created_at: string | null
          id: string
          job_type: string | null
          parent_job_id: string | null
          platforms: string | null
          search_query: string
          status: string | null
          updata_at: string | null
          user_id: string | null
        }
        Insert: {
          brand_name: string
          competitors?: string | null
          created_at?: string | null
          id?: string
          job_type?: string | null
          parent_job_id?: string | null
          platforms?: string | null
          search_query: string
          status?: string | null
          updata_at?: string | null
          user_id?: string | null
        }
        Update: {
          brand_name?: string
          competitors?: string | null
          created_at?: string | null
          id?: string
          job_type?: string | null
          parent_job_id?: string | null
          platforms?: string | null
          search_query?: string
          status?: string | null
          updata_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scan_results: {
        Row: {
          analysis_type: string | null
          avs_score: number | null
          created_at: string | null
          diag_attribution_report: string | null
          diag_reasoning_trace: string | null
          diagnosed_at: string | null
          exposure_count: number | null
          id: string
          job_id: string | null
          job_type: string | null
          model_provider: string | null
          platforms: string | null
          rank_position: number | null
          raw_response_text: string | null
          sentiment_score: number | null
          sim_avs_score: number | null
          sim_raw_response_text: string | null
          sim_reasoning_trace: string | null
          simulated_at: string | null
          spi_score: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          analysis_type?: string | null
          avs_score?: number | null
          created_at?: string | null
          diag_attribution_report?: string | null
          diag_reasoning_trace?: string | null
          diagnosed_at?: string | null
          exposure_count?: number | null
          id?: string
          job_id?: string | null
          job_type?: string | null
          model_provider?: string | null
          platforms?: string | null
          rank_position?: number | null
          raw_response_text?: string | null
          sentiment_score?: number | null
          sim_avs_score?: number | null
          sim_raw_response_text?: string | null
          sim_reasoning_trace?: string | null
          simulated_at?: string | null
          spi_score?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_type?: string | null
          avs_score?: number | null
          created_at?: string | null
          diag_attribution_report?: string | null
          diag_reasoning_trace?: string | null
          diagnosed_at?: string | null
          exposure_count?: number | null
          id?: string
          job_id?: string | null
          job_type?: string | null
          model_provider?: string | null
          platforms?: string | null
          rank_position?: number | null
          raw_response_text?: string | null
          sentiment_score?: number | null
          sim_avs_score?: number | null
          sim_raw_response_text?: string | null
          sim_reasoning_trace?: string | null
          simulated_at?: string | null
          spi_score?: number | null
          status?: string | null
          user_id?: string | null
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
