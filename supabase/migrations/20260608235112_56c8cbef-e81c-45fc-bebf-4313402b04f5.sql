ALTER TABLE public.profiles ADD COLUMN saving_target numeric DEFAULT 20;

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
