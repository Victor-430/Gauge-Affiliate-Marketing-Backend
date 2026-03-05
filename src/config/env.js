const config = {
  development: {
    affiliateBaseUrl: "http://localhost:5173",
    apiBaseUrl: "http://localhost:3000",
  },
  production: {
    affiliateBaseUrl: "https://affiliate.gaugesolution.com",
    apiBaseUrl: "https://api.affiliate.gaugesolution.com",
  },
};

export default config[process.env.NODE_ENV || "development"];