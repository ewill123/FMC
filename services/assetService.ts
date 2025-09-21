import { supabase } from "./supabaseClient";

export interface Asset {
  id: number;
  office_id?: string;
  name?: string;
  department?: string;
  code?: string;
  description?: string;
  qty?: number;
  unit_cost?: number;
  supplier_name?: string;
  funding_source?: string;
  physical_location?: string;
  depreciation?: number;
  condition?: string;
  need_repair?: boolean;
  purchase_date?: string;
  image_urls?: string[];
  user_id: string;
  staff_name?: string; // <-- Add this line
}

// Insert new asset
export const addAsset = async (asset: Omit<Asset, "id">) => {
  const { data, error } = await supabase.from("assets").insert([asset]);
  if (error) throw error;
  return data;
};

// Fetch all assets
export const getAssets = async (): Promise<Asset[]> => {
  const { data, error } = await supabase.from("assets").select("*");
  if (error) throw error;
  return data || [];
};

// Fetch assets by office
export const getAssetsByOffice = async (
  office_id: string
): Promise<Asset[]> => {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("office_id", office_id);
  if (error) throw error;
  return data || [];
};
