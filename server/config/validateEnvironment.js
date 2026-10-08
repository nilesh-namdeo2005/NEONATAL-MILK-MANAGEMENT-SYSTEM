const validateEnvironment = (env) => {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (env.NODE_ENV !== 'production') {
    return;
  }

  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET === 'your-super-secret-jwt-key-change-this') {
    throw new Error('Production JWT_SECRET must be a unique secret with at least 32 characters');
  }

  if (!env.CLIENT_URL) {
    throw new Error('CLIENT_URL is required in production');
  }

  let clientUrl;
  try {
    clientUrl = new URL(env.CLIENT_URL);
  } catch {
    throw new Error('CLIENT_URL must be a valid HTTPS origin in production');
  }

  if (clientUrl.protocol !== 'https:' || clientUrl.origin !== env.CLIENT_URL.replace(/\/+$/, '')) {
    throw new Error('CLIENT_URL must be a valid HTTPS origin in production');
  }

  const sameSite = (env.COOKIE_SAME_SITE || 'lax').toLowerCase();
  if (!['strict', 'lax', 'none'].includes(sameSite)) {
    throw new Error('COOKIE_SAME_SITE must be strict, lax, or none');
  }
};

export default validateEnvironment;
