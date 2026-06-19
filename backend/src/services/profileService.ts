import { createClient } from '@supabase/supabase-js';

const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export type ProfileUpdate = {
  pay_day?: number;
  salary?: number;
  saving_target?: number;
  financial_center?: string | null;
};

export const ProfileService = {
  async getProfile(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, payload: ProfileUpdate) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...(payload.pay_day !== undefined ? { pay_day: payload.pay_day } : {}),
        ...(payload.salary !== undefined ? { salary: payload.salary } : {}),
        ...(payload.saving_target !== undefined ? { saving_target: payload.saving_target } : {}),
        ...(payload.financial_center !== undefined ? { financial_center: payload.financial_center } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
