const BOAT = 'Boats'
const LOAD = 'Loads'
const USER = 'Users'
const express = require('express')
const router = express.Router();
const ds = require('./datastore')
const datastore = ds.datastore


router.use(express.json())


/* ------------- UTILITY FUNCTIONS START ------------------- */

function fromDatastore(item) {
  item.id = parseInt(item[datastore.KEY].id, 10);
  return item;
}


function generateSelf (obj, req, type) {
  const self = `${req.protocol}://${req.get('host')}/${type}/${obj.id}`
  obj['self'] = self
  return obj
}
/* ------------- UTILITY FUNCTIONS END --------------------- */

/* ------------- DATASTORE MODEL FUNCTIONS START ----------- */
/* ------------- DATASTORE MODEL FUNCTIONS END ------------- */


/* ------------- ROUTING FUNCTIONS START ------------------- */

router.get('/', (req, res) => {
  utility.viewAllEntities(BOAT).then(boats => {
    res.status(200).json({results: boats})
  })
})
/* ------------- ROUTING FUNCTIONS END --------------------- */


module.exports = router