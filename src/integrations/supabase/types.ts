export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      nyc_housing_data: {
        Row: {
          Apartment: string | null
          BBL: string | null
          BIN: string | null
          Block: string | null
          Borough: string | null
          "Building ID": string | null
          "Census Tract": string | null
          "Community Board": string | null
          "Complaint Anonymous Flag": string | null
          "Complaint ID": string | null
          "Complaint Status": string | null
          "Complaint Status Date": string | null
          "Council District": string | null
          created_at: string
          "House Number": string | null
          id: number
          Latitude: string | null
          Longitude: string | null
          Lot: string | null
          "Major Category": string | null
          "Minor Category": string | null
          NTA: string | null
          "Post Code": string | null
          "Problem Code": string | null
          "Problem Duplicate Flag": string | null
          "Problem ID": string | null
          "Problem Status": string | null
          "Problem Status Date": string | null
          "Received Date": string | null
          "Space Type": string | null
          "Status Description": string | null
          "Street Name": string | null
          Type: string | null
          "Unique Key": string | null
          "Unit Type": string | null
        }
        Insert: {
          Apartment?: string | null
          BBL?: string | null
          BIN?: string | null
          Block?: string | null
          Borough?: string | null
          "Building ID"?: string | null
          "Census Tract"?: string | null
          "Community Board"?: string | null
          "Complaint Anonymous Flag"?: string | null
          "Complaint ID"?: string | null
          "Complaint Status"?: string | null
          "Complaint Status Date"?: string | null
          "Council District"?: string | null
          created_at?: string
          "House Number"?: string | null
          id?: number
          Latitude?: string | null
          Longitude?: string | null
          Lot?: string | null
          "Major Category"?: string | null
          "Minor Category"?: string | null
          NTA?: string | null
          "Post Code"?: string | null
          "Problem Code"?: string | null
          "Problem Duplicate Flag"?: string | null
          "Problem ID"?: string | null
          "Problem Status"?: string | null
          "Problem Status Date"?: string | null
          "Received Date"?: string | null
          "Space Type"?: string | null
          "Status Description"?: string | null
          "Street Name"?: string | null
          Type?: string | null
          "Unique Key"?: string | null
          "Unit Type"?: string | null
        }
        Update: {
          Apartment?: string | null
          BBL?: string | null
          BIN?: string | null
          Block?: string | null
          Borough?: string | null
          "Building ID"?: string | null
          "Census Tract"?: string | null
          "Community Board"?: string | null
          "Complaint Anonymous Flag"?: string | null
          "Complaint ID"?: string | null
          "Complaint Status"?: string | null
          "Complaint Status Date"?: string | null
          "Council District"?: string | null
          created_at?: string
          "House Number"?: string | null
          id?: number
          Latitude?: string | null
          Longitude?: string | null
          Lot?: string | null
          "Major Category"?: string | null
          "Minor Category"?: string | null
          NTA?: string | null
          "Post Code"?: string | null
          "Problem Code"?: string | null
          "Problem Duplicate Flag"?: string | null
          "Problem ID"?: string | null
          "Problem Status"?: string | null
          "Problem Status Date"?: string | null
          "Received Date"?: string | null
          "Space Type"?: string | null
          "Status Description"?: string | null
          "Street Name"?: string | null
          Type?: string | null
          "Unique Key"?: string | null
          "Unit Type"?: string | null
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
