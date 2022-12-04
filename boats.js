const BOAT = 'Boats'
const LOAD = 'Loads'
const USER = 'Users'
const express = require('express')
const router = express.Router();
const ds = require('./datastore')
const datastore = ds.datastore
const { checkJwt } = require('./oauth')
router.use(express.json())
const { errorMsg } = require('./errorCodes')
const { fromDatastore, generateSelf} = require('./commonFunctions')


/* ------------- UTILITY FUNCTIONS START ------------------- */

function reqBodyIsJSON(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return false }
  return true
}

function resBodyIsJSON(req) {
  // response must be JSON
  if (!req.accepts(['application/json'])) { return false }
  return true
}

function parseUserId(req) {
  return req.auth.sub.split('auth0|')[1]
}


async function validateUser(user_id) {
  // check datastore for valid user
  const q = datastore.createQuery(USER)
  const results = await datastore.runQuery(q)
  const user = results[0]
    .filter(user => user.userId === user_id)
    .map(fromDatastore)[0]
  return user  
}


/* ------------- UTILITY FUNCTIONS END --------------------- */


/* ------------- VERIFICATION FUNCTIONS START -------------- */

function verifyBoatName(name) {
  // must be a string
  if (typeof name !== 'string') { return 400 }

  // no boat name, boat name cannot be null, 
  // and boat name cannot be an empty string
  if (name === undefined || name === null || name.length === 0) { return 400 }

  // // boat name cannot be longer than 20 characters
  if (name.length > 20) { return 400 }
  return 0
}

function verfifyBoatType(type) {
  // same requirements as boat name
  if (verifyBoatName(type) > 0) { return 400 }
  return 0
}

function verifyBoatLength(length) {
  // length must be an integer
  if (typeof length !== 'number') {  return 400 }

  // cannot be 0 or negative length
  if (length <= 0) { return 400}

  return 0
}

async function findDuplicateName(boatName) {
  // let allBoats = await viewAllBoats(req).then(boats => { return boats })

  // // allow user to edit same boat
  // for (let i = 0; i < allBoats.length; i++) {
  //   if (allBoats[i].name == boatName) { return 400 }
  // }

  return 0
}

async function verifyPatchRequest(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return 415 }

  const user = await validateUser(parseUserId(req))
  
  // invalid or unregistered user
  if (user === undefined || user === null) { return 403 }

  //cannot find boat with this boat id
  let boat = await viewBoat(req.params.boat_id, user.userId).then(boat => { return boat })

  if (boat == 403) { return 403 }
  

  if (boat == 404) { return 404 }

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
  if (req.body.length !== undefined && req.body.length !== null) { 
    if (verifyBoatLength(req.body.length) === 400) { return 400 }
  }

  // verify the boat name is not a duplicate
  return findDuplicateName(req.body.name).then(result => { return result })

}


async function verifyPutRequest(req) {
  // req must be JSON
  if (req.get('content-type') !== 'application/json'){ return 415 }

  const user = await validateUser(parseUserId(req))
  
  // invalid or unregistered user
  if (user === undefined || user === null) { return 403 }

  //cannot find boat with this boat id
  let boat = await viewBoat(req.params.boat_id, user.userId).then(boat => { return boat })


  if (boat == 403) { return 403 }

  if (boat == 404) { return 404 }

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
  
  const user = await validateUser(parseUserId(req))

  // invalid or unregistered user
  if (user === undefined || user === null) { return 403 }
  
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
  if (await findDuplicateName(req.body.name) === 400) { return 400 }
}
/* ------------- VERIFICATION FUNCTIONS END ---------------- */

/* ------------- DATASTORE MODEL FUNCTIONS START ----------- */
async function viewAllBoatsProtected(req) {
  let limit = 5
  const q = datastore.createQuery(BOAT).limit(limit)
  const results = {}
    let prev
    if(Object.keys(req.query).includes("cursor")){
        prev = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + req.query.cursor
        q = q.start(req.query.cursor)
    }
    const owner = req.auth.sub.split('auth0|')[1]
    const total_q = datastore.createQuery(BOAT)
    const total_q_result = await datastore.runQuery(total_q)
    const total_q_collection = total_q_result[0].filter(boat => boat.owner == owner)
    results.total_collection_length = total_q_collection.length

    return datastore.runQuery(q)
      .then( (entities) => {
        results.result = entities[0].filter(boat => boat.owner == owner).map(ds.fromDatastore);
        if(typeof prev !== 'undefined'){
            results.previous = prev
        }
        if(entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS ){
            results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor
        }
        return results
    })
}




async function viewAllBoats(req) {
  let limit = 5
  let q = datastore.createQuery(BOAT).limit(limit)
  const results = {}
  let prev
  if(Object.keys(req.query).includes("cursor")){
      prev = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + req.query.cursor
      q = q.start(req.query.cursor)
  }

  const total_q = datastore.createQuery(BOAT)
  const total_q_result = await datastore.runQuery(total_q)
  results.total_collection_length = total_q_result[0].length

  return datastore.runQuery(q)
    .then( (entities) => {
      results.result = entities[0].map(ds.fromDatastore);
      if(typeof prev !== 'undefined'){
          results.previous = prev
      }
      if(entities[1].moreResults !== ds.Datastore.NO_MORE_RESULTS ){
          results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + entities[1].endCursor
      }
      return results
  })
}


async function viewBoat(boat_id, user_id) {
  // jwt didn't correspond to a registered user
  if (user_id === undefined || user_id === null) { return 401 }

  const key = datastore.key([BOAT, parseInt(boat_id)])
  return datastore.get(key).then(boat => {
    
    if (boat[0] === undefined || boat[0] === null) { return 404 }

    // boat doesn't belong to the user
    if (boat[0].owner !== user_id) { return 403 }

    return boat.map(fromDatastore)
  })
}


async function addBoat(name, type, length, owner) {
  let key = datastore.key(BOAT)
  let newBoat = {
    'name': name, 
    'type': type, 
    'length': length, 
    'loads': [], 
    'owner': owner
  }
  await datastore.save({ 'key': key, 'data': newBoat })
  return key
}


async function editBoatPut(req) {
  const { boat_id } = req.params
  const {name, type, length } = req.body
  // verify the boat exists
  const key = datastore.key([BOAT, parseInt(boat_id)])
  let boat = await viewBoat(boat_id, parseUserId(req)).then(boat => { return boat[0] })
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
  let boat = await viewBoat(boat_id, parseUserId(req)).then(boat => { return boat[0] })
  // console.log(boat)

  // check patch req attributes 
  boat.name = name === undefined ? boat.name : name
  boat.type = type === undefined ? boat.type : type
  boat.length = length === undefined ? boat.length : length

  await datastore.save({"key": key, "data": boat})
  return boat
}

async function deleteBoat(boat_id, req) {

  const user = await validateUser(parseUserId(req))

  // invalid or unregistered user
  if (user === undefined || user === null) { return 403 }

  const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)])
  let boat = await datastore.get(boat_key).then(boat => { return boat[0] })
  if (boat === undefined || boat === null) { return 404 }

  if (boat.owner !== parseUserId(req)) { return 403 } 
  

  // check if a load has current boat as owner
  for (let i=0; i < boat.loads.length; i++) {
    await removeLoad(boat_id, boat.loads[i].id)
  }
  return datastore.delete(boat_key).then(result => { return result });
}


async function assignLoad(boat_id, load_id) {
  // get boat and load from datastore
  const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)])
  const load_key = datastore.key([LOAD, parseInt(load_id, 10)])
  let boat = await datastore.get(boat_key).then(boat => { return boat[0] })
  let load = await datastore.get(load_key).then(load => { return load[0] })
  if (boat === undefined || boat === null || load === undefined || load === null) { return 404 }

  // load already assigned to another boat
  if (load.carrier !== null) { return 400 }

  // cannot add duplicate loads, simply return without altering datastore
  for (let i = 0; i < boat.loads.length; i++) {
    if (Object.values(boat.loads[i]).includes(load_id) === true) { return 0 }
  }

  boat.loads.push({"id": parseInt(load_id, 10)})
  load.carrier = {"id": parseInt(boat_id, 10), "name": boat.name}
  await datastore.save({"key": load_key, "data": load})
  await datastore.save({"key": boat_key, "data": boat})

  return 0 
}


async function removeLoad(boat_id, load_id) {
  // get boat and load from datastore
  const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)])
  const load_key = datastore.key([LOAD, parseInt(load_id, 10)])
  let boat = await datastore.get(boat_key).then(boat => {return boat[0]})
  let load = await datastore.get(load_key).then(load => {return load[0]})

  if ((boat === undefined || boat === null || load === undefined || 
       load === null || boat.loads.filter(load => load.id == load_id).length == 0 || 
       load.carrier.id != boat_id)) { 

    return 404 
  }

  boat.loads = boat.loads.filter(load => load.id != load_id)
  load.carrier = null
  await datastore.save({"key": load_key, "data": load})
  await datastore.save({"key": boat_key, "data": boat})
  return 204
}

async function assignBoatToUser(boat, owner, selfLink) {
  // console.log(boat)
  const q = datastore.createQuery(USER)
  let result = await datastore.runQuery(q).then((entities) => {
    return entities[0].map(fromDatastore)
  })
  result = result.filter(user => user.userId === owner)[0]
  const key = datastore.key([USER, parseInt(result.id)])
  result.owned_boats.push({'id': parseInt(boat.id, 10), 'self': selfLink})
  
  await datastore.save({'key': key, 'data': result})
}

/* ------------- DATASTORE MODEL FUNCTIONS END ------------- */


/* ------------- ROUTING FUNCTIONS START ------------------- */

// INVALID METHODS FOR THE GIVEN ROUTES
router.put('/', (req, res) => {
  res.set('Accept', 'GET')
  res.status(405).json(errorMsg(405))
})

router.patch('/', (req, res) => {
  res.set('Accept', 'GET')
  res.status(405).json(errorMsg(405))
})

router.delete('/', (req, res) => {
  res.set('Accept', 'GET')
  res.status(405).json(errorMsg(405))
})


router.get('/', checkJwt, async (req, res) => {
  if (resBodyIsJSON(req) === false) { 
    res.status(406).json(errorMsg(406))
    return
  }
  const allBoats = await viewAllBoatsProtected(req)
  allBoats.result.forEach(boat => {
    generateSelf(boat, req, 'boats')
    boat.loads.forEach(load => generateSelf(load, req, 'loads'))
  })
  res.status(200).json(allBoats)
})


router.get('/:boat_id', checkJwt, async (req, res) => {
  if (resBodyIsJSON(req) === false) { 
    res.status(406).json(errorMsg(406))
    return
  }
  const user = await validateUser(parseUserId(req))
  const boat = await viewBoat(req.params.boat_id, user.userId)
  switch(boat) {
    case (403):
      res.status(403).json(errorMsg(403)) 
      break
    case (404):
      res.status(404).json(errorMsg(404)) 
      break
    default:
      generateSelf(boat[0], req, 'boats')
      boat[0].loads.forEach(load => generateSelf(load, req, 'loads'))
      res.status(200).json(boat[0]) 
  }
})


router.post('/', checkJwt, async (req, res) => {
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
    case 415:
      res.status(verifyResult).json(errorMsg(verifyResult))
      break;
    default:
      const { name, type, length } = req.body
      const owner = req.auth.sub.split('auth0|')[1]
      const postedBoat = await addBoat(name, type, length, owner)
      // console.log(postedBoat);
      const boatSelfLink = `${req.protocol}://${req.get('host')}${req.baseUrl}/${postedBoat.id}`
      await assignBoatToUser(postedBoat, owner, boatSelfLink)
      res.status(201).json({
        'id': parseInt(postedBoat.id, 10),
        'name': name,
        'type': type,
        'length': length,
        'owner': owner,
        'loads': [],
        'self': boatSelfLink
      })
  }
})

router.put('/:boat_id', checkJwt, async (req, res) => {
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
      const editedBoat = await editBoatPut(req)
      generateSelf(editedBoat, req, 'boats')
      res.status(200).json(editedBoat)

  }
})

router.patch('/:boat_id', checkJwt, async (req, res) => {
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
      const patchedBoat = await editBoatPatch(req)
      generateSelf(patchedBoat, req, 'boats')
      res.status(200).json(patchedBoat)
  }
})


router.delete('/:boat_id', checkJwt, async (req, res) => {
  const result = await deleteBoat(req.params.boat_id, req)
  switch (result) {
    case 403:
      res.status(403).json(errorMsg(403))
      break
    case 404:
      res.status(404).json(errorMsg(404))
      break
    default:
      res.status(204).end()
  }
})


// add load to boat
router.put('/:boat_id/loads/:load_id', async (req, res) => {
  const result = await assignLoad(req.params.boat_id, req.params.load_id)
  switch (result) {
    case 404: 
      res.status(404).json(errorMsg(404))
      break
    case 400: 
      res.status(400).json(errorMsg(400))
      break
    default: 
      res.status(204).end()
  }
})


// remove load from boat
router.delete('/:boat_id/loads/:load_id', async (req, res) => {
  const result = await removeLoad(req.params.boat_id, req.params.load_id)
  switch (result) {
    case 404:
      res.status(404).json(errorMsg(404)) 
      break
    default:
      res.status(204).end()
  }
})

/* ------------- ROUTING FUNCTIONS END --------------------- */

// CATCH INVALID JWTS AND OTHER MISC. ERRORS
router.use(async (err, req, res, next) => {
  // console.log(req)
  if (req.method == 'GET' && req.path == '/') {
    const allBoats = await viewAllBoats(req)
    allBoats.result.forEach(boat => {
    generateSelf(boat, req, 'boats')
    boat.loads.forEach(load => generateSelf(load, req, 'loads'))
  })
  res.status(200).json(allBoats)
  } else if (err.name == 'UnauthorizedError') {
    res.status(401).json(errorMsg(401))
  } else {
    console.error(err)
    res.status(500).send('500 Internal Error')
  }
})

module.exports = router