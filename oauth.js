const { expressjwt: jwt, expressjwt } = require("express-jwt")
const jwksRsa = require('jwks-rsa')

// NOTE: FLIP TO CHANGE BETWEEN DEVELOPMENT AND DEPLOYED
// 0 = 'http://localhost:8080 
// 1 = 'https://cs493-portfolio-saechaok.wl.r.appspot.com'
const IS_DEPLOYED = 1

// --------------------- CONFIGURATION START ---------------------------
const APP_URL = IS_DEPLOYED == 0 ? 
  'http://localhost:8080' : 'https://cs493-portfolio-saechaok.wl.r.appspot.com'

const DOMAIN = 'cs493-portfolio-saechaok.us.auth0.com'
const CLIENT_ID = 'nEmEtb2gZbkreml2ay2uQGa6Uj3PQFw2'
const CLIENT_SECRET = 'iWuLZMYvnQz5WsInf8VmUS3R8A3mZwDzeXPQwB65AG-o3m0aQcAyFMyrxdyQC_me'
const REDIRECT_URI = `${APP_URL}/callback`
const SCOPE = 'openid email profile'


// --------------------- CONFIGURATION END ---------------------------

// JWT VALIDATION
const checkJwt = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${DOMAIN}/.well-known/jwks.json`
    }),
  
    // Validate the audience and the issuer.
    issuer: `https://${DOMAIN}/`,
    algorithms: ['RS256']
  });

  module.exports = {
    checkJwt, 
    DOMAIN, 
    CLIENT_ID,
    CLIENT_SECRET, 
    REDIRECT_URI,
    SCOPE,
    APP_URL
  }


