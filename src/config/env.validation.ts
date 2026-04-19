import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().required(),
  MONGODB_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),
  ALLOWED_ORIGINS: Joi.string().required(),
  THROTTLE_TTL: Joi.number().integer().min(1).required(),
  THROTTLE_LIMIT: Joi.number().integer().min(1).required(),
  OPENAPI_SOURCE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .optional(),
  OPENAPI_OUTPUT_PATH: Joi.string().optional(),
  CLIENT_OUTPUT_DIR: Joi.string().optional(),
  KINDE_ISSUER_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  KINDE_AUDIENCE: Joi.string().optional(),
  KINDE_CLIENT_ID: Joi.string().required(),
  KINDE_SITE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  KINDE_REDIRECT_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  KINDE_SECRET: Joi.string().required(),
});
