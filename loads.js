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
  const self = `${req.protocol}://${req.get('host')}/${type}/${obj.id}`
  obj['self'] = self
  return obj
}

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

async function viewAllLoads(req) {
  let limit = 5
  let q = datastore.createQuery(LOAD).limit(limit)
  const results = {}
  let prev
  if(Object.keys(req.query).includes("cursor")){
      prev = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + req.query.cursor
      q = q.start(req.query.cursor)
  }

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


async function viewLoad(load_id) {
  const key = datastore.key([LOAD, parseInt(load_id, 10)])
  return datastore.get(key).then(load => {
    if (load[0] === undefined || load[0] === null) { return 404 }
    return load.map(fromDatastore)
  })
}


async function addLoad(item, volume, creation_date) {
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

  // if carrier is not null, search and delete load on carrier
  if ((load.carrier !== null && load.carrier !== undefined) && (load.carrier.id !== undefined || load.carrier.id !== null)) {
    await removeCarrier(load.carrier.id, load_id)
  }

  return datastore.delete(load_key).then(result => { return result });
}


async function assignCarrier(boat_id, load_id) {
  // get boat and load from datastore
  const boat_key = datastore.key([BOAT, parseInt(boat_id, 10)])
  const load_key = datastore.key([LOAD, parseInt(load_id, 10)])
  let boat = await datastore.get(boat_key).then(boat => { return boat[0] })
  let load = await datastore.get(load_key).then(load => { return load[0] })
  if (boat === undefined || boat === null || load === undefined || load === null) { return 404 }

  // load already assigned to another boat
  if (load.carrier !== null) { return 403 }

  // cannot add duplicate loads, 400 error
  for (let i = 0; i < boat.loads.length; i++) {
    if (Object.values(boat.loads[i]).includes(load_id) === true) { return 400 }
  }

  boat.loads.push({"id": parseInt(load_id, 10)})
  load.carrier = {"id": parseInt(boat_id, 10), "name": boat.name}
  await datastore.save({"key": load_key, "data": load})
  await datastore.save({"key": boat_key, "data": boat})

  return 0 
}

async function removeCarrier(boat_id, load_id) {
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

/* ------------- DATASTORE MODEL FUNCTIONS END --------- */


/* ------------- ROUTING FUNCTIONS START --------------- */

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

router.get('/', async (req, res) => {
  if (resBodyIsJSON(req) === false) { 
    res.status(406).json(errorMsg(406))
    return
  }
  const allLoads = await viewAllLoads(req)
  allLoads.result.forEach(load => {
    generateSelf(load, req, 'loads')
    if (load.carrier !== null) {
      generateSelf(load.carrier, req, 'boats')
    }
  })
  res.status(200).json(allLoads)
})

router.get('/:load_id', async (req, res) => {
  if (resBodyIsJSON(req) === false) { 
    res.status(406).json(errorMsg(406))
    return
  }
  const load = await viewLoad(req.params.load_id)
  if (load === 404) { 
    res.status(404).json(errorMsg(404)) 
  } else { 
    generateSelf(load[0], req, 'loads')
    if (load[0].carrier !== null) {
      generateSelf(load[0].carrier, req, 'boats')
    }
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
    case 415:
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