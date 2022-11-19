const express = require('express')
const app = express()

app.use('/', require('./index'))
app.enable('trust proxy')

/* ------------- Utility Functions --------------------- */
/* ------------- Utility Functions --------------------- */

/* ------------- Datastore Model Functions ------------- */
/* ------------- Datastore Model Functions ------------- */


/* ------------- Routing Functions --------------------- */
/* ------------- Routing Functions --------------------- */


const PORT = 8080
app.listen(PORT, () => console.log(`listening on port ${PORT}...`))