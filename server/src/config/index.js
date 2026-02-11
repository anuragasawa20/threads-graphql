/**
 * Configuration
 * 
 * Central place for app config.
 * Use env vars for sensitive/ environment-specific values.
 */

export const config = {
  port: process.env.PORT || 4000,
  dbPath: process.env.DB_PATH,
  nodeEnv: process.env.NODE_ENV || 'development',
};
