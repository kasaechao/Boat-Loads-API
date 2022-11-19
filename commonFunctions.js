const ds = require('./datastore')
const datastore = ds.datastore


/* ------------- Utility Functions --------------------- */

function fromDatastore(item) {
  item.id = parseInt(item[datastore.KEY].id, 10);
  return item;
}


function generateSelf (obj, req, type) {
  const self = `${req.protocol}://${req.get('host')}/${type}/${obj.id}`
  obj['self'] = self
  return obj
}

/* ------------- Utility Functions --------------------- */

/* ------------- Datastore Model Functions ------------- */

function viewAllEntities(entity) {
  const q = datastore.createQuery(entity)
  return datastore.runQuery(q).then(entities => {
    return entities[0].map(fromDatastore)
  })

}
  
/* ------------- Datastore Model Functions ------------- */



module.exports = { 
  fromDatastore, 
  generateSelf, 
  viewAllEntities 
}



