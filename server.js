const USER = 'Users'
const BOAT = 'Boats'

const express = require('express')
const app = express()
const path = require('path')
const request = require('request')
const { engine } = require('express-handlebars')
const { Datastore } = require('@google-cloud/datastore')
const { expressjwt: jwt, expressjwt } = require("express-jwt")
const jwksRsa = require('jwks-rsa')
const datastore = new Datastore()
const {
    checkJwt, 
    DOMAIN, 
    CLIENT_ID,
    CLIENT_SECRET, 
    REDIRECT_URI,
    SCOPE,
    APP_URL
  } = require('./oauth')

app.use('/', require('./index'))
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.json());
app.enable('trust proxy');
app.use(express.static(path.join(__dirname, 'public')))

/* ------------- UTILITY FUNCTIONS START --------------- */
function fromDatastore(item) {
  item.id = parseInt(item[datastore.KEY].id, 10);
  return item;
}


function generateSelf (obj, req, type) {
  const self = `${req.protocol}://${req.get('host')}/${type}/${obj.id}`
  obj['self'] = self
  return obj
}

/* ------------- UTILITY FUNCTIONS END ----------------- */


/* ------------- DATASTORE MODEL FUNCTIONS START ------- */

async function getAllUsers() {
  const q = datastore.createQuery(USER)
  return datastore.runQuery(q).then((entities) => {
    return entities[0].map(fromDatastore)
  })
}



  
/* ------------- DATASTORE MODEL FUNCTIONS END -------- */



/* ------------- Datastore Model Functions ------------- */

async function addUser(userId, name) {
  const key = datastore.key(USER)
  const newUser = {
    'userId': userId,
    'name': name
  }
  let allUsers = await getAllUsers()
  allUsers = allUsers.filter(user => user.userId === userId)

  // don't add duplicate users
  if (allUsers.length > 0) { return }
  await datastore.save({'key': key, 'data': newUser })
  return key
}

/* ------------- Datastore Model Functions ------------- */


/* ------------- Routing Functions --------------------- */
app.get('/', (req, res) => {
  const authorizeUrl = `${APP_URL}/authorize`
  res.render('home', {'authorizeUrl': authorizeUrl})
});

app.get('/users', async (req, res) => {
  const allUsers = await getAllUsers()
  allUsers.forEach(user => {
    generateSelf(user, req, 'users')
  })
  res.status(200).json(allUsers)
})

app.get('/getToken', async (req, res) => {
  var options = { method: 'POST',
  url: `${APP_URL}/addUser`,
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
        const userId = response.body.sub.sub.split('auth0|')[1]
        const name = response.body.sub.email
        // console.log(response.body)
        
        res.render('result', {'idToken': req.query.id_token, 'userId': userId, 'name': name})
    }
  })
})

app.post('/addUser', checkJwt, async (req, res) => {
  await addUser(req.auth.sub.split('auth0|')[1], req.auth.name)
  res.status(201).json({sub: req.auth})
})

app.get('/callback', async (req, res, next) => {
  var options = { method: 'POST',
    url: `https://${DOMAIN}/oauth/token`,
    body:
      { code: req.query.code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: `${APP_URL}/profile`,
        client_secret: CLIENT_SECRET },
    json: true };
  request(options, (error, response, body) => {
    if (error){
        res.status(500).send(error);
    } else {
        res.redirect(`/getToken?id_token=${body.id_token}`)
    }
  })
})

app.get('/authorize', async (req, res) => {
  const url = `https://${DOMAIN}/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}&response_mode=query`
  console.log(url)
  res.redirect(url)
})


/* ------------- Routing Functions --------------------- */

const PORT = 8080
app.listen(PORT, () => console.log(`listening on port ${PORT}...`))