const BOAT = 'Boats'
const LOAD = 'Loads'
const USER = 'Users'
const ds = require('./datastore')
const datastore = ds.datastore


/* ------- Utility Functions Start -------------------- */
function fromDatastore(item) {
  item.id = parseInt(item[datastore.KEY].id, 10);
  return item;
}


function generateSelf (obj, req, type) {
  const self = `${req.protocol}://${req.get('host')}/${type}/${obj.id}`
  obj['self'] = self
  return obj
}

/* ------- Utility Functions End ---------------------- */



module.exports = { 
  fromDatastore, 
  generateSelf
}



