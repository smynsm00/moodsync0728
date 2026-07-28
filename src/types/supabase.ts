export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      export_logs: {
        Row: {
          asset_count: number
          export_format: string
          exported_at: string
          id: string
          project_id: string
          resolution_mode: string
          user_id: string
        }
        Insert: {
          asset_count: number
          export_format: string
          exported_at?: string
          id?: string
          project_id: string
          resolution_mode: string
          user_id: string
        }
        Update: {
          asset_count?: number
          export_format?: string
          exported_at?: string
          id?: string
          project_id?: string
          resolution_mode?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      presets: {
        Row: {
          category: string
          created_at: string
          default_params: Json
          description: string | null
          id: string
          is_premium: boolean
          lut_file_url: string | null
          name: string
          preview_color: string
        }
        Insert: {
          category: string
          created_at?: string
          default_params: Json
          description?: string | null
          id?: string
          is_premium?: boolean
          lut_file_url?: string | null
          name: string
          preview_color: string
        }
        Update: {
          category?: string
          created_at?: string
          default_params?: Json
          description?: string | null
          id?: string
          is_premium?: boolean
          lut_file_url?: string | null
          name?: string
          preview_color?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          user_tier: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          user_tier?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          user_tier?: string
        }
        Relationships: []
      }
      project_assets: {
        Row: {
          applied_params: Json
          color_palette: Json
          created_at: string
          display_order: number
          height: number
          id: string
          is_anchor: boolean
          is_synced: boolean
          name: string
          original_url: string
          project_id: string
          thumbnail_url: string
          width: number
        }
        Insert: {
          applied_params: Json
          color_palette: Json
          created_at?: string
          display_order?: number
          height: number
          id?: string
          is_anchor?: boolean
          is_synced?: boolean
          name: string
          original_url: string
          project_id: string
          thumbnail_url: string
          width: number
        }
        Update: {
          applied_params?: Json
          color_palette?: Json
          created_at?: string
          display_order?: number
          height?: number
          id?: string
          is_anchor?: boolean
          is_synced?: boolean
          name?: string
          original_url?: string
          project_id?: string
          thumbnail_url?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          active_saved_tone_id: string | null
          created_at: string
          id: string
          split_position: number
          title: string
          updated_at: string
          user_id: string
          view_mode: string
        }
        Insert: {
          active_saved_tone_id?: string | null
          created_at?: string
          id?: string
          split_position?: number
          title?: string
          updated_at?: string
          user_id?: string
          view_mode?: string
        }
        Update: {
          active_saved_tone_id?: string | null
          created_at?: string
          id?: string
          split_position?: number
          title?: string
          updated_at?: string
          user_id?: string
          view_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_tone_locks: {
        Row: {
          anchor_image_name: string
          created_at: string
          id: string
          name: string
          params: Json
          preset_id: string | null
          project_id: string
        }
        Insert: {
          anchor_image_name: string
          created_at?: string
          id?: string
          name: string
          params: Json
          preset_id?: string | null
          project_id: string
        }
        Update: {
          anchor_image_name?: string
          created_at?: string
          id?: string
          name?: string
          params?: Json
          preset_id?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_tone_locks_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_tone_locks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
