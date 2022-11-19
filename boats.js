const BOAT = 'Boats'
const LOAD = 'Loads'
const USER = 'Users'
const express = require('express')
const router = express.Router();
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

function verifyBoatName(name) {
  // must be a string
  // if (typeof name !== 'string') { return 400 }

  // // no boat name, boat name cannot be null, 
  // // and boat name cannot be an empty string
  // if (name === undefined || name === null || name.length === 0) { return 400 }

  // // boat name cannot start with a space
  // if (name[0] === '\s') { return 400 }

  // // boat name cannot be longer than 20 characters
  // if (name.length > 20) { return 400 }

  return 0
}

function verfifyBoatType(type) {
  // same requirements as boat name
  // if (verifyBoatName(type) > 0) { return 400 }

  return 0
}

function verifyBoatLength(length) {
  // length must be an integer
  // if (typeof length !== 'number') {  return 400 }

  // // cannot be 0 or negative length
  // if (length <= 0) { return 400}

  return 0
}

async function findDuplicateName(boatName) {
  let allBoats = await viewAllBoats().then(boats => { return boats })

  // // allow user to edit same boat
  // for (let i = 0; i < allBoats.length; i++) {
  //   if (allBoats[i].name == boatName) { return 403 }
  // }

  return 0
}

async function verifyPatchRequest(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return 415 }

  //cannot find boat with this boat id
  let boat = await viewBoat(req.params.boat_id).then(boat => { return boat[0] })

  if (boat == undefined || boat === null) { return 404 }

  // response must be JSON
  if (!req.accepts(['application/json'])) { return 406 }

  // cannot update id
  if (req.body.id !== undefined) { return 400 }

  // check for none, or excess attributes
  // if (Object.keys(req.body).length < 1 || Object.keys(req.body).length > 3) { return 400 }
 
  
  // verfiy boat name is valid
  if (req.body.name !== undefined && req.body.name !== null) { 
    if (verifyBoatName(req.body.name) === 400) { return 400 }
  }


  // verify boat type is valid
  if (req.body.type !== undefined && req.body.type !== null) { 
    if (verfifyBoatType(req.body.type) === 400) { return 400 }
  }

  // verfiy boat length
  if (req.body.length !== undefined || req.body.length !== null) { 
    if (verifyBoatLength(req.body.length) === 400) { return 400 }
  }

  // verify the boat name is not a duplicate
  return findDuplicateName(req.body.name).then(result => { return result })

}


async function verifyPutRequest(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return 415 }

  //cannot find boat with this boat id
  let boat = await viewBoat(req.params.boat_id).then(boat => { return boat[0] })
  if (boat == undefined || boat === null) { return 404 }

  // response must be JSON
  if (!req.accepts(['application/json'])) { return 406 }

  // cannot update id
  if (req.body.id !== undefined) { return 400 }

  // check for excess, or too little attributes
  if (Object.keys(req.body).length != 3) { return 400 }

  // verify correct attributes
  if ((req.body.name === undefined || req.body.type === undefined || req.body.length === undefined || 
       req.body.name === null || req.body.type === null || req.body.length === null ||
       typeof req.body.name !== "string" || typeof req.body.type !== "string" || typeof req.body.length !== "number")) {
    return 400
  } 

  // verfiy boat name is valid
  if (verifyBoatName(req.body.name) === 400) { return 400 }

  // verify boat type is valid
  if (verfifyBoatType(req.body.type) === 400) { return 400 }

  // verfiy boat length
  if (verifyBoatLength(req.body.length) === 400) { return 400 }

  // verify the boat name is not a duplicate
  return findDuplicateName(req.body.name).then(result => { return result })
}


async function verifyPostRequest(req) {
  // req must be JSON
  if(req.get('content-type') !== 'application/json'){
    return 415
  }
  // response must be JSON
  if (!req.accepts(['application/json'])) { return 406 }

  // verify correct attributes, and correct number of attributes
  if ((Object.keys(req.body).length > 3 || req.body.name === undefined || req.body.type === undefined || req.body.length === undefined || 
       req.body.name === null || req.body.type === null || req.body.length === null ||
       typeof req.body.name !== "string" || typeof req.body.type !== "string" || typeof req.body.length !== "number")) {
    return 400
  } 

  // verfiy boat name is valid
  if (verifyBoatName(req.body.name) === 400) { return 400 }

  // verify boat type is valid
  if (verfifyBoatType(req.body.type) === 400) { return 400 }

  // verfiy boat length
  if (verifyBoatLength(req.body.length) === 400) { return 400 }

  // verify the boat name is not a duplicate, catches 403 error code
  return findDuplicateName(req.body.name).then(result => { return result })
}
/* ------------- VERIFICATION FUNCTIONS END ---------------- */

/* ------------- DATASTORE MODEL FUNCTIONS START ----------- */

async function viewAllBoats() {
  const q = datastore.createQuery(BOAT)
  const result = await datastore.runQuery(q)
  return result[0].map(fromDatastore)
}


async function viewBoat(boat_id) {
  const key = datastore.key([BOAT, parseInt(boat_id)])
  return datastore.get(key).then(boat => {
    if (boat[0] === undefined || boat[0] === null) { return 404 }
    return boat.map(fromDatastore)
  })
}


async function addBoat(name, type, length) {
  let key = datastore.key(BOAT)
  let newBoat = {'name': name, 'type': type, 'length': length, 'loads': [], owner: null}
  await datastore.save({ 'key': key, 'data': newBoat })
  return key
}


async function editBoatPut(req) {
  const { boat_id } = req.params
  const {name, type, length } = req.body
  // verify the boat exists
  const key = datastore.key([BOAT, parseInt(boat_id)])
  let boat = await viewBoat(boat_id).then(boat => { return boat[0] })
  boat.name = name
  boat.type = type
  boat.length = length
  await datastore.save({"key": key, "data": boat})
  return boat
}


async function editBoatPatch(req) {
  const boat_id = req.params.boat_id
  const { name, type, length } = req.body
  const key = datastore.key([BOAT, parseInt(boat_id, 10)])
  let boat = await viewBoat(boat_id).then(boat => { return boat[0] })

  // check patch req attributes 
  boat.name = name === undefined ? boat.name : name
  boat.type = type === undefined ? boat.type : type
  boat.length = length === undefined ? boat.length : length

  boat = datastore.save({"key": key, "data": boat})
    .then(boat => { return boat })
}


async function deleteBoat(boat_id) {
  const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)])
  let boat = await datastore.get(boat_key).then(boat => { return boat[0] })
  if (boat === undefined || boat === null) { return 404 }
  return datastore.delete(boat_key).then(result => { return result });
}


/* ------------- DATASTORE MODEL FUNCTIONS END ------------- */


/* ------------- ROUTING FUNCTIONS START ------------------- */

router.get('/', async (req, res) => {
  const allBoats = await viewAllBoats()
  allBoats.forEach(boat => generateSelf(boat, req))
  res.status(200).json({ 'result': allBoats })
})


router.get('/:boat_id', async (req, res) => {
  const boat = await viewBoat(req.params.boat_id)
  if (boat === 404) { 
    res.status(404).json(errorMsg(404)) 
  } else { 
    generateSelf(boat[0], req)
    console.log(boat);
    res.status(200).json(boat[0]) 
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
      const { name, type, length } = req.body
      const postedBoat = await addBoat(name, type, length)
      // console.log(postedBoat);
      res.status(201).json({
        'id': parseInt(postedBoat.id, 10),
        'name': name,
        'type': type,
        'length': length,
        'owner': null,
        'loads': [],
        'self': `${req.protocol}://${req.get('host')}${req.baseUrl}/${postedBoat.id}`
      })
  }
})

router.put('/:boat_id', async (req, res) => {
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
      await editBoatPut(req)
      res.status(200).end()
  }
})

router.patch('/:boat_id', async (req, res) => {
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
      await editBoatPatch(req)
      res.status(200).end()
  }
})

router.delete('/:boat_id', async (req, res) => {
  const result = deleteBoat(req.params.boat_id)
  switch (result) {
    case 404:
      res.status(404).json(errorMsg(404))
      break
    default:
      res.status(204).end()
  }
})



/* ------------- ROUTING FUNCTIONS END --------------------- */


module.exports = router