import { supabase } from "./supabaseClient";

export const addAsset = async (asset: {
  office_id: string;
  name: string;
  type?: string;
  year_acquired?: number;
  expected_lifespan?: number;
  created_by: string;
}) => {
  const { data, error } = await supabase.from("assets").insert([asset]);
  if (error) throw error;
  return data;
};

export const getAssetsByOffice = async (office_id: string) => {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("office_id", office_id);
  if (error) throw error;
  return data;
};
