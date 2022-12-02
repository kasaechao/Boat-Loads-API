const USER = 'Users'
const LENGTH = 20


const express = require('express')
const app = express()
const path = require('path')
const axios = require('axios')
const request = require('request')
const { engine } = require('express-handlebars')
const { Datastore } = require('@google-cloud/datastore')
const { google } = require('googleapis')
const { expressjwt: jwt, expressjwt } = require("express-jwt")
const jwksRsa = require('jwks-rsa')

const datastore = new Datastore()
const { auth, requiresAuth } = require('express-openid-connect');

app.use('/', require('./index'))
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.json());
app.enable('trust proxy');
app.use(express.static(path.join(__dirname, 'public')))


const DOMAIN = 'cs493-portfolio-saechaok.us.auth0.com'
const CLIENT_ID = 'nEmEtb2gZbkreml2ay2uQGa6Uj3PQFw2'
const CLIENT_SECRET = 'iWuLZMYvnQz5WsInf8VmUS3R8A3mZwDzeXPQwB65AG-o3m0aQcAyFMyrxdyQC_me'
const REDIRECT_URI = 'http://localhost:8080/callback'
const SCOPE = 'openid email'
// The `auth` router attaches /login, /logout
// and /callback routes to the baseURL
// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   baseURL: 'http://localhost:8080',
//   clientID: 'nEmEtb2gZbkreml2ay2uQGa6Uj3PQFw2',
//   issuerBaseURL: 'https://cs493-portfolio-saechaok.us.auth0.com',
//   secret: CLIENT_SECRET
// };
// app.use(auth(config));

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

/* ------------- Utility Functions --------------------- */
// Generate state function
// source: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

/* ------------- Utility Functions --------------------- */



/* ------------- Datastore Model Functions ------------- */

async function addUser(userId) {
  const key = datastore.key(USER)
  const newUser = {
    'userId': userId
  }
  await datastore.save({'key': key, 'data': newUser })
  return key
}

// async function getUser()

/* ------------- Datastore Model Functions ------------- */


/* ------------- Routing Functions --------------------- */
app.get('/', (req, res) => {
  // res.send(
  //   req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out'
  // )
  res.render('home')
  // res.redirect('http://localhost:8080/profile')
});

app.get('/getToken', async (req, res) => {
  // console.log(req.user)
  var options = { method: 'POST',
  url: `http://localhost:8080/addUser`,
  headers: { 
    'content-type': 'application/json', 
    'Authorization': 'Bearer ' + req.query.id_token
  },
   json: true
  }
  request(options, (error, response, body) => {
    if (error){
        res.status(500).send(error);
    } else {
        const id_token = response.toJSON().request.headers.Authorization.split('Bearer ')[1]
        console.log(response.body)
        const userId = response.body.sub.email
        const name = response.body.sub.email

        res.render('result', {'jwt': id_token, 'userId': userId, 'name': name})
    }
  })
})

app.post('/addUser', checkJwt, async (req, res) => {
  // console.log(req);
  // console.log(req.user);
  // save to user datastore
  await addUser(req.auth.sub.split('auth0|')[1])

  res.status(201).json({sub: req.auth})
})

app.get('/callback', async (req, res, next) => {
  var options = { method: 'POST',
    url: `https://${DOMAIN}/oauth/token`,
    body:
      { code: req.query.code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: 'http://localhost:8080/profile',
        client_secret: CLIENT_SECRET },
    json: true };
  request(options, (error, response, body) => {
    if (error){
        res.status(500).send(error);
    } else {
        // const id_token = body.id_token
        // res.render('result' {'jwt': id_token, 'userId': userId})
        // res.send(body);
        res.redirect(`/getToken?id_token=${body.id_token}`)
    }
  })
})

app.get('/authorize', async (req, res) => {
  // res.send('authorizing....')
  const url = `https:${DOMAIN}/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_mode=query`
  // console.log(req)

  res.redirect(url)
})


/* ------------- Routing Functions --------------------- */

const PORT = 8080
app.listen(PORT, () => console.log(`listening on port ${PORT}...`))