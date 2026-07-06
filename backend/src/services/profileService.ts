import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const getSupabaseClient = () => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

export type PayDateMode =
  | 'fixed_day'
  | 'first_business_day'
  | 'second_business_day'
  | 'third_business_day'
  | 'last_business_day'
  | 'variable';

export type ProfileUpdate = {
  pay_day?: number;
  pay_date_mode?: PayDateMode;
  salary?: number;
  saving_target?: number;
  currency?: string;
  country?: string | null;
  display_name?: string | null;
  overdraft_allowed?: number | null;
  onboarding_done?: boolean;
};

export const ProfileService = {
  async getProfile(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      logger.error('Error fetching profile', error);
      throw error;
    }
    return data;
  },

  async updateProfile(userId: string, payload: ProfileUpdate) {
    const supabase = getSupabaseClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.pay_day !== undefined) patch.pay_day = payload.pay_day;
    if (payload.pay_date_mode !== undefined) patch.pay_date_mode = payload.pay_date_mode;
    if (payload.salary !== undefined) patch.salary = payload.salary;
    if (payload.saving_target !== undefined) patch.saving_target = payload.saving_target;
    if (payload.currency !== undefined) patch.currency = payload.currency;
    if (payload.country !== undefined) patch.country = payload.country;
    if (payload.display_name !== undefined) patch.display_name = payload.display_name;
    if (payload.overdraft_allowed !== undefined) patch.overdraft_allowed = payload.overdraft_allowed;
    if (payload.onboarding_done !== undefined) patch.onboarding_done = payload.onboarding_done;

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      logger.error('Error updating profile', error);
      throw error;
    }
    logger.info('Profile updated', { userId });
    return data;
  },
};
