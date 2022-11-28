const BOAT = 'Boats'
const LOAD = 'Loads'
const USER = 'Users'
const express = require('express')
const router = express.Router()
const ds = require('./datastore')
const datastore = ds.datastore

router.use(express.json())

/* ------------- UTILITY FUNCTIONS START ------------------- */

function errorMsg(statusCode) {
  const error_msgs = {
    '401': { "Error": "401 Unauthorized" },
    '403': { "Error": "403 Forbidden" },
    '404': { "Error": "404 Not Found" },
    '405': { "Error": "405 Method Not Allowed" },
    '406': { "Error": "406 Not Acceptable" },
    '415': { "Error": "415 Unsupported Media Type "}
  }
  return error_msgs[String(statusCode)]
}

function fromDatastore(item) {
  item.id = parseInt(item[datastore.KEY].id, 10);
  return item;
}


function generateSelf (obj, req, type) {
  const self = `${req.protocol}://${req.get('host')}${req.baseUrl}/${obj.id}`
  obj['self'] = self
  return obj
}
/* ------------- UTILITY FUNCTIONS END --------------------- */


/* ------------- VERIFICATION FUNCTIONS START -------------- */

function verifyLoadItem(itemName) {
  // must be a string
  // if (typeof itemName !== 'string') { return 400 }

  // // no name, or name cannot be null, 
  // // and load name cannot be an empty string
  // if (itemName === undefined || itemName === null || item.length === 0) { return 400 }

  // // name cannot start with a space
  // if (itemName[0] === '\s') { return 400 }

  // // name cannot be longer than 20 characters
  // if (itemName.length > 20) { return 400 }

  return 0
}


function verifyLoadVolume(volume) {
  // // volume must be an integer
  // if (typeof volume !== 'number') {  return 400 }

  // // cannot be 0 or negative length
  // if (volume <= 0) { return 400}

  return 0
}

async function findDuplicateName(itemName) {
  // let allBoats = await viewAllLoads().then(loads => { return loads })

  // // allow user to edit same load
  // for (let i = 0; i < allBoats.length; i++) {
  //   if (allBoats[i].name == boatName) { return 403 }
  // }

  return 0
}

async function verifyPatchRequest(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return 415 }

  //cannot find load with this load id
  let load = await viewLoad(req.params.load_id).then(load => { return load[0] })

  if (load == undefined || load === null) { return 404 }

  // response must be JSON
  if (!req.accepts(['application/json'])) { return 406 }

  // cannot update id
  if (req.body.id !== undefined) { return 400 }

  // check for none, or excess attributes
  // if (Object.keys(req.body).length < 1 || Object.keys(req.body).length > 3) { return 400 }
 
  
  // verfiy load name is valid
  // if (req.body.name !== undefined && req.body.name !== null) { 
  //   if (verifyLoadName(req.body.name) === 400) { return 400 }
  // }


  // verify load type is valid
  // if (req.body.type !== undefined && req.body.type !== null) { 
  //   if (verfifyLoadType(req.body.type) === 400) { return 400 }
  // }

  // verfiy load length
  // if (req.body.length !== undefined || req.body.length !== null) { 
  //   if (verifyLoadLength(req.body.length) === 400) { return 400 }
  // }

  // verify the load name is not a duplicate
  // return findDuplicateName(req.body.name).then(result => { return result })

}


async function verifyPutRequest(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return 415 }

  //cannot find load with this load id
  let load = await viewLoad(req.params.load_id).then(load => { return load[0] })
  if (load == undefined || load === null) { return 404 }

  // response must be JSON
  if (!req.accepts(['application/json'])) { return 406 }

  // cannot update id
  if (req.body.id !== undefined) { return 400 }

  // check for excess, or too little attributes
  if (Object.keys(req.body).length != 3) { return 400 }

  // verify correct attributes
  // if ((req.body.item === undefined || req.body.volume === undefined || req.body.creation_date === undefined || 
  //      req.body.item === null || req.body.volume === null || req.body.length === null ||
  //      typeof req.body.name !== "string" || typeof req.body.type !== "string" || typeof req.body.creation_date !== "number")) {
  //   return 400
  // } 

  // verfiy load name is valid
  // if (verifyLoadName(req.body.name) === 400) { return 400 }

  // verify load type is valid
  // if (verfifyLoadType(req.body.type) === 400) { return 400 }

  // verfiy load length
  // if (verifyLoadLength(req.body.length) === 400) { return 400 }

  // verify the load name is not a duplicate
  // return findDuplicateName(req.body.name).then(result => { return result })
}


async function verifyPostRequest(req) {
  // req must be JSON
  if(req.get('content-type') !== 'application/json'){
    return 415
  }
  // response must be JSON
  if (!req.accepts(['application/json'])) { return 406 }

  // verify correct attributes, and correct number of attributes
  if ((Object.keys(req.body).length > 3 || req.body.item === undefined || req.body.volume === undefined || req.body.creation_date === undefined || 
       req.body.item === null || req.body.volume === null || req.body.creation_date === null ||
       typeof req.body.item !== "string" || typeof req.body.creation_date !== "string" || typeof req.body.volume !== "number")) {
    return 400
  } 

  // // verfiy load name is valid
  // if (verifyLoadName(req.body.name) === 400) { return 400 }

  // // verify load type is valid
  // if (verfifyLoadType(req.body.type) === 400) { return 400 }

  // // verfiy load length
  // if (verifyLoadLength(req.body.length) === 400) { return 400 }

  // // verify the load name is not a duplicate, catches 403 error code
  // return findDuplicateName(req.body.name).then(result => { return result })
}


/* ------------- DATASTORE MODEL FUNCTIONS START-------- */

async function viewAllLoads() {
  const q = datastore.createQuery(LOAD)
  const result = await datastore.runQuery(q)
  return result[0].map(fromDatastore)
}


async function viewLoad(load_id) {
  const key = datastore.key([LOAD, parseInt(load_id)])
  return datastore.get(key).then(load => {
    if (load[0] === undefined || load[0] === null) { return 404 }
    return load.map(fromDatastore)
  })
}


async function addLoad(volume, item, creation_date) {
  let key = datastore.key(LOAD)
  let newLoad = {
    'item': item, 
    'volume': volume, 
    'creation_date': creation_date, 
    'carrier': null
  }
  await datastore.save({ 'key': key, 'data': newLoad })
  return key
}


async function editLoadPut(req) {
  const { load_id } = req.params
  const { item, volume, creation_date } = req.body
  // verify the load exists
  const key = datastore.key([LOAD, parseInt(load_id)])
  let load = await viewLoad(load_id).then(load => { return load[0] })
  load.item = item
  load.volume = volume
  load.creation_date = creation_date
  await datastore.save({"key": key, "data": load})
  return load
}


async function editLoadPatch(req) {
  const load_id = req.params.load_id
  const { item, volume, creation_date } = req.body
  const key = datastore.key([LOAD, parseInt(load_id, 10)])
  let load = await viewLoad(load_id).then(load => { return load[0] })

  // check patch req attributes 
  load.item = item === undefined ? load.item : item
  load.volume = volume === undefined ? load.volume : volume
  load.creation_date = creation_date === undefined ? load.creation_date : creation_date

  await datastore.save({"key": key, "data": load})
  return load
}


async function deleteLoad(load_id) {
  const load_key = datastore.key([LOAD, parseInt(load_id, 10)])
  let load = await datastore.get(load_key).then(load => { return load[0] })
  if (load === undefined || load === null) { return 404 }
  return datastore.delete(load_key).then(result => { return result });
}


async function assignCarrier(boat_id, load_id) {
// look up boat in datastore
// look up load in datastore
// check if load is already on a carrier

// assign carrier to load
// assign load to carrier
}

async function removeCarrier(boat_id, load_id) {
// look up boat
// look up load
// find load in boat

// remove load from boat
// remove carrier from load
}

/* ------------- DATASTORE MODEL FUNCTIONS END --------- */


/* ------------- ROUTING FUNCTIONS START --------------- */

router.get('/', async (req, res) => {
  const allLoads = await viewAllLoads()
  res.status(200).json({result: allLoads})
})

router.get('/:load_id', async (req, res) => {
  const load = await viewLoad(req.params.load_id)
  if (load === 404) { 
    res.status(404).json(errorMsg(404)) 
  } else { 
    generateSelf(load[0], req)
    console.log(load);
    res.status(200).json(load[0]) 
  }
})

router.post('/', async (req, res) => {
  const verifyResult = await verifyPostRequest(req)
  switch(verifyResult) {
    case 400:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 403:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 406:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    default:
      const { item, volume, creation_date } = req.body
      const postedLoad = await addLoad(item, volume, creation_date)
      res.status(201).json({
        'id': parseInt(postedLoad.id, 10),
        'item': item,
        'volume': volume,
        'creation_date': creation_date,
        'carrier': null,
        'self': `${req.protocol}://${req.get('host')}${req.baseUrl}/${postedLoad.id}`
      })
  }
})

router.put('/:load_id', async (req, res) => {
  const verifyResult = await verifyPutRequest(req)
  switch (verifyResult) {
    case 400:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 403:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 404:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 406:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 415:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    default:
      const editedLoad = await editLoadPut(req)
      generateSelf(editedLoad, req, 'loads')
      res.status(200).json(editedLoad)
  }
})

router.patch('/:load_id', async (req, res) => {
  const verifyResult = await verifyPatchRequest(req)
  switch (verifyResult) {
    case 400:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 403:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 404:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 406:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    case 415:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break
    default:
      const editedLoad = await editLoadPatch(req)
      generateSelf(editedLoad, req, 'loads')
      res.status(200).json(editedLoad)
  }
})

router.delete('/:load_id', async (req, res) => {
  const result = await deleteLoad(req.params.load_id)
  switch (result) {
    case 404:
      res.status(404).json(errorMsg(404))
      break
    default:
      res.status(204).end()
  }
})

/* ------------- ROUTING FUNCTIONS END ----------------- */


module.exports = router