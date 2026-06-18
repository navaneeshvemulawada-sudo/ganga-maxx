import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tdxkhkrcmnkspxmutzpb.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_yhuyRf4TBy_Aym_aPOeAxw_03srgz2h";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export default supabase;
