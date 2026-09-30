-- Suma 'lemonsqueezy' como payment_source válido: es el canal de cobro web
-- (webhook en src/routes/webhooks/lemonsqueezy.ts), separado de apple/google
-- (RevenueCat, mobile) y de stripe (que quedó descartado para Argentina).
ALTER TABLE public.entitlements DROP CONSTRAINT entitlements_payment_source_check;
ALTER TABLE public.entitlements ADD CONSTRAINT entitlements_payment_source_check
  CHECK (payment_source IN ('apple', 'google', 'stripe', 'lemonsqueezy'));
