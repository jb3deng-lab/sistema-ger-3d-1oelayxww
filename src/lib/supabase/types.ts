// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          client_type: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          client_type?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          client_type?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      filaments: {
        Row: {
          brand: string | null
          color_hex: string
          cost_per_kg: number | null
          created_at: string
          current_weight: number
          id: string
          initial_weight: number
          name: string
          purchase_date: string | null
          type: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          color_hex: string
          cost_per_kg?: number | null
          created_at?: string
          current_weight: number
          id: string
          initial_weight: number
          name: string
          purchase_date?: string | null
          type: string
          user_id: string
        }
        Update: {
          brand?: string | null
          color_hex?: string
          cost_per_kg?: number | null
          created_at?: string
          current_weight?: number
          id?: string
          initial_weight?: number
          name?: string
          purchase_date?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string
          depreciation_rate: number
          id: string
          maintenance_items: Json
          name: string
          power_watts: number
          purchase_value: number
          useful_life_hours: number
          user_id: string
        }
        Insert: {
          created_at?: string
          depreciation_rate: number
          id: string
          maintenance_items?: Json
          name: string
          power_watts?: number
          purchase_value: number
          useful_life_hours: number
          user_id: string
        }
        Update: {
          created_at?: string
          depreciation_rate?: number
          id?: string
          maintenance_items?: Json
          name?: string
          power_watts?: number
          purchase_value?: number
          useful_life_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          id: string
          quote_id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          quote_id: string
          start_date: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quote_id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_quote_id_fkey'
            columns: ['quote_id']
            isOneToOne: false
            referencedRelation: 'quotes'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          extra_components: Json
          id: string
          materials: Json
          name: string
          packaging_cost: number
          prep_time_mins: number
          print_time_mins: number
          profit_margin: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          extra_components?: Json
          id: string
          materials?: Json
          name: string
          packaging_cost?: number
          prep_time_mins?: number
          print_time_mins?: number
          profit_margin?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          extra_components?: Json
          id?: string
          materials?: Json
          name?: string
          packaging_cost?: number
          prep_time_mins?: number
          print_time_mins?: number
          profit_margin?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string
          created_at: string
          id: string
          name: string
          phone: string
        }
        Insert: {
          address?: string
          created_at?: string
          id: string
          name?: string
          phone?: string
        }
        Update: {
          address?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          costs_energy: number
          costs_extra: number
          costs_machine: number
          costs_material: number
          costs_operator: number
          costs_total: number
          extra_components: Json
          filament_id: string
          id: string
          machine_id: string
          materials: Json
          piece_name: string
          prep_time_hours: number
          product_id: string | null
          profit_margin: number | null
          quantity: number
          quote_id: string
          suggested_price: number
          time_hours: number
          weight: number
        }
        Insert: {
          costs_energy: number
          costs_extra?: number
          costs_machine: number
          costs_material: number
          costs_operator?: number
          costs_total: number
          extra_components?: Json
          filament_id: string
          id: string
          machine_id: string
          materials?: Json
          piece_name: string
          prep_time_hours?: number
          product_id?: string | null
          profit_margin?: number | null
          quantity: number
          quote_id: string
          suggested_price: number
          time_hours: number
          weight: number
        }
        Update: {
          costs_energy?: number
          costs_extra?: number
          costs_machine?: number
          costs_material?: number
          costs_operator?: number
          costs_total?: number
          extra_components?: Json
          filament_id?: string
          id?: string
          machine_id?: string
          materials?: Json
          piece_name?: string
          prep_time_hours?: number
          product_id?: string | null
          profit_margin?: number | null
          quantity?: number
          quote_id?: string
          suggested_price?: number
          time_hours?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: 'quote_items_filament_id_fkey'
            columns: ['filament_id']
            isOneToOne: false
            referencedRelation: 'filaments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quote_items_machine_id_fkey'
            columns: ['machine_id']
            isOneToOne: false
            referencedRelation: 'machines'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quote_items_quote_id_fkey'
            columns: ['quote_id']
            isOneToOne: false
            referencedRelation: 'quotes'
            referencedColumns: ['id']
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string
          client_name: string
          comments: string
          created_at: string
          date: string
          discount: number
          final_price: number
          id: string
          packaging_cost: number
          sales_fee_percent: number
          sales_fee_value: number
          sales_method: string | null
          shipping_cost: number
          show_comments: boolean
          status: string
          suggested_price: number
          total_energy: number
          total_machine: number
          total_material: number
          total_total: number
          user_id: string
        }
        Insert: {
          client_id: string
          client_name: string
          comments?: string
          created_at?: string
          date: string
          discount: number
          final_price: number
          id: string
          packaging_cost?: number
          sales_fee_percent?: number
          sales_fee_value?: number
          sales_method?: string | null
          shipping_cost?: number
          show_comments?: boolean
          status: string
          suggested_price: number
          total_energy: number
          total_machine: number
          total_material: number
          total_total: number
          user_id: string
        }
        Update: {
          client_id?: string
          client_name?: string
          comments?: string
          created_at?: string
          date?: string
          discount?: number
          final_price?: number
          id?: string
          packaging_cost?: number
          sales_fee_percent?: number
          sales_fee_value?: number
          sales_method?: string | null
          shipping_cost?: number
          show_comments?: boolean
          status?: string
          suggested_price?: number
          total_energy?: number
          total_machine?: number
          total_material?: number
          total_total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quotes_client_id_fkey'
            columns: ['client_id']
            isOneToOne: false
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      settings: {
        Row: {
          categories: Json
          company_address: string
          company_document: string
          company_email: string
          company_logo: string
          company_name: string
          company_phone: string
          energy_cost: number
          filament_cost: number
          machine_cost: number
          operator_hour_cost: number
          profit_margin: number
          sales_methods: Json
          user_id: string
        }
        Insert: {
          categories?: Json
          company_address?: string
          company_document?: string
          company_email?: string
          company_logo?: string
          company_name?: string
          company_phone?: string
          energy_cost?: number
          filament_cost?: number
          machine_cost?: number
          operator_hour_cost?: number
          profit_margin?: number
          sales_methods?: Json
          user_id: string
        }
        Update: {
          categories?: Json
          company_address?: string
          company_document?: string
          company_email?: string
          company_logo?: string
          company_name?: string
          company_phone?: string
          energy_cost?: number
          filament_cost?: number
          machine_cost?: number
          operator_hour_cost?: number
          profit_margin?: number
          sales_methods?: Json
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          quote_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id: string
          quote_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          quote_id?: string | null
          type?: string
          user_id?: string
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: clients
//   id: text (not null)
//   user_id: uuid (not null)
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   document: text (nullable)
//   address: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   client_type: text (nullable)
// Table: filaments
//   id: text (not null)
//   user_id: uuid (not null)
//   name: text (not null)
//   type: text (not null)
//   color_hex: text (not null)
//   initial_weight: numeric (not null)
//   current_weight: numeric (not null)
//   brand: text (nullable)
//   purchase_date: text (nullable)
//   cost_per_kg: numeric (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: machines
//   id: text (not null)
//   user_id: uuid (not null)
//   name: text (not null)
//   purchase_value: numeric (not null)
//   useful_life_hours: numeric (not null)
//   depreciation_rate: numeric (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   power_watts: numeric (not null, default: 0)
//   maintenance_items: jsonb (not null, default: '[]'::jsonb)
// Table: orders
//   id: text (not null)
//   user_id: uuid (not null)
//   quote_id: text (not null)
//   status: text (not null)
//   start_date: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: products
//   id: text (not null)
//   user_id: uuid (not null)
//   name: text (not null)
//   category: text (nullable)
//   print_time_mins: numeric (not null, default: 0)
//   prep_time_mins: numeric (not null, default: 0)
//   packaging_cost: numeric (not null, default: 0)
//   profit_margin: numeric (nullable)
//   materials: jsonb (not null, default: '[]'::jsonb)
//   extra_components: jsonb (not null, default: '[]'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
// Table: profiles
//   id: uuid (not null)
//   name: text (not null, default: ''::text)
//   address: text (not null, default: ''::text)
//   created_at: timestamp with time zone (not null, default: now())
//   phone: text (not null, default: ''::text)
// Table: quote_items
//   id: text (not null)
//   quote_id: text (not null)
//   piece_name: text (not null)
//   weight: numeric (not null)
//   time_hours: numeric (not null)
//   filament_id: text (not null)
//   machine_id: text (not null)
//   quantity: numeric (not null)
//   costs_material: numeric (not null)
//   costs_machine: numeric (not null)
//   costs_energy: numeric (not null)
//   costs_total: numeric (not null)
//   suggested_price: numeric (not null)
//   product_id: text (nullable)
//   materials: jsonb (not null, default: '[]'::jsonb)
//   extra_components: jsonb (not null, default: '[]'::jsonb)
//   prep_time_hours: numeric (not null, default: 0)
//   costs_operator: numeric (not null, default: 0)
//   costs_extra: numeric (not null, default: 0)
//   profit_margin: numeric (nullable)
// Table: quotes
//   id: text (not null)
//   user_id: uuid (not null)
//   client_id: text (not null)
//   client_name: text (not null)
//   total_material: numeric (not null)
//   total_machine: numeric (not null)
//   total_energy: numeric (not null)
//   total_total: numeric (not null)
//   suggested_price: numeric (not null)
//   discount: numeric (not null)
//   final_price: numeric (not null)
//   status: text (not null)
//   date: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   packaging_cost: numeric (not null, default: 0)
//   shipping_cost: numeric (not null, default: 0)
//   comments: text (not null, default: ''::text)
//   show_comments: boolean (not null, default: false)
//   sales_method: text (nullable)
//   sales_fee_percent: numeric (not null, default: 0)
//   sales_fee_value: numeric (not null, default: 0)
// Table: settings
//   user_id: uuid (not null)
//   filament_cost: numeric (not null, default: 150)
//   energy_cost: numeric (not null, default: 1.5)
//   machine_cost: numeric (not null, default: 2.0)
//   profit_margin: numeric (not null, default: 50)
//   company_name: text (not null, default: 'Minha 3D Print'::text)
//   company_document: text (not null, default: '00.000.000/0001-00'::text)
//   company_email: text (not null, default: 'contato@minha3d.com'::text)
//   company_phone: text (not null, default: '(11) 99999-9999'::text)
//   company_address: text (not null, default: 'Rua Principal, 1000 - Centro'::text)
//   company_logo: text (not null, default: ''::text)
//   operator_hour_cost: numeric (not null, default: 0)
//   categories: jsonb (not null, default: '["B2B", "B2C"]'::jsonb)
//   sales_methods: jsonb (not null, default: '[{"fee": 0, "name": "Dinheiro/Pix"}]'::jsonb)
// Table: transactions
//   id: text (not null)
//   user_id: uuid (not null)
//   description: text (not null)
//   type: text (not null)
//   amount: numeric (not null)
//   date: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   quote_id: text (nullable)

// --- CONSTRAINTS ---
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clients_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: filaments
//   PRIMARY KEY filaments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY filaments_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: machines
//   PRIMARY KEY machines_pkey: PRIMARY KEY (id)
//   FOREIGN KEY machines_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: orders
//   PRIMARY KEY orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY orders_quote_id_fkey: FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
//   FOREIGN KEY orders_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
//   FOREIGN KEY products_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: quote_items
//   FOREIGN KEY quote_items_filament_id_fkey: FOREIGN KEY (filament_id) REFERENCES filaments(id) ON DELETE CASCADE
//   FOREIGN KEY quote_items_machine_id_fkey: FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
//   PRIMARY KEY quote_items_pkey: PRIMARY KEY (id)
//   FOREIGN KEY quote_items_quote_id_fkey: FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
// Table: quotes
//   FOREIGN KEY quotes_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY quotes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY quotes_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: settings
//   PRIMARY KEY settings_pkey: PRIMARY KEY (user_id)
//   FOREIGN KEY settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: transactions
//   PRIMARY KEY transactions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY transactions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: clients
//   Policy "auth_clients" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: filaments
//   Policy "auth_filaments" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: machines
//   Policy "auth_machines" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: orders
//   Policy "auth_orders" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: products
//   Policy "auth_products" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: profiles
//   Policy "auth_profiles" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//     WITH CHECK: (id = auth.uid())
// Table: quote_items
//   Policy "auth_quote_items" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: quotes
//   Policy "auth_quotes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: settings
//   Policy "auth_settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())
// Table: transactions
//   Policy "auth_transactions" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//     WITH CHECK: (user_id = auth.uid())

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, name, address, phone)
//     VALUES (
//       NEW.id,
//       COALESCE(NEW.raw_user_meta_data->>'name', ''),
//       COALESCE(NEW.raw_user_meta_data->>'address', ''),
//       COALESCE(NEW.raw_user_meta_data->>'phone', '')
//     );
//     RETURN NEW;
//   END;
//   $function$
//
