const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optional = (key: string, defaultValue?: string): string | undefined => {
  return process.env[key] ?? defaultValue;
};

const parseIntWithDefault = (key: string, defaultValue: number): number => {
  const raw = optional(key, String(defaultValue));
  const parsed = parseInt(raw || String(defaultValue), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue;
};

export const env = {
  // Server
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseIntWithDefault('PORT', 3000),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:8080'),
  JSON_BODY_LIMIT: optional('JSON_BODY_LIMIT', '1mb') || '1mb',
  URLENCODED_BODY_LIMIT: optional('URLENCODED_BODY_LIMIT', '1mb') || '1mb',
  
  // Supabase
  SUPABASE_URL: required('SUPABASE_URL'),
  SUPABASE_PUBLISHABLE_KEY: required('SUPABASE_PUBLISHABLE_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: required('SUPABASE_SERVICE_ROLE_KEY'),
  SUPABASE_JWT_SECRET: required('SUPABASE_JWT_SECRET'),
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: parseIntWithDefault('DEFAULT_PAGE_SIZE', 10),
  MAX_PAGE_SIZE: parseIntWithDefault('MAX_PAGE_SIZE', 100),
  
  // Feature flags
  ENABLE_LOGGING: optional('ENABLE_LOGGING', 'true') === 'true',
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
};

export const validateEnv = () => {
  try {
    // Validate required vars are accessible
    env.SUPABASE_URL;
    env.SUPABASE_SERVICE_ROLE_KEY;
    env.SUPABASE_JWT_SECRET;
    return true;
  } catch (error) {
    console.error('❌ Environment validation failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
};
