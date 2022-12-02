const BOAT = 'Boats'
const LOAD = 'Loads'
const USER = 'Users'
const express = require('express')
const router = express.Router()
const ds = require('./datastore')
const datastore = ds.datastore



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


/* ------------- ROUTING FUNCTIONS START --------------------- */

router.get('/', async (req, res) => {
  const allUsers = await getAllUsers()
  allUsers.forEach(user => {
    generateSelf(user, req, 'users')
  })
  res.status(200).json(allUsers)
})


/* ------------- ROUTING FUNCTIONS END --------------------- */


module.exports = router