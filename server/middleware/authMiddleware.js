const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 থেকে প্রাপ্ত কনফিগুরেশন
const checkJwt = auth({
  audience: 'https://your-api-identifier.com', // আপনার Auth0 API Audience
  issuerBaseURL: `https://your-auth0-domain.auth0.com/`, // আপনার Auth0 Domain
  tokenSigningAlg: 'RS256'
});

module.exports = { checkJwt };