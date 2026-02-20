import rateLimit from "express-rate-limit";

const ip_rate_limit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 login attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

const health_check_limit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 3, // Max 3 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many health checks. Please try again later." },
});

export { ip_rate_limit, health_check_limit };
