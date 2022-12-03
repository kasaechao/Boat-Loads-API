// API RESTFUL ERROR CODES AND THEIR MESSAGES
function errorMsg(statusCode) {
  const error_msgs = {
    '400': {"Error": "400 Bad Request", "Message": "There is an error in the request"},
    '401': { "Error": "401 Unauthorized", "Message": "Missing or invalid credentials" },
    '403': { "Error": "403 Forbidden", "Message": "Invalid credentials for the resource" },
    '404': { "Error": "404 Not Found", "Message": "No resource with this id exists" },
    '405': { "Error": "405 Method Not Allowed", "Message": "Method not allowed"},
    '406': { "Error": "406 Not Acceptable", "Message": "Server cannot provide requested media type"},
    '415': { "Error": "415 Unsupported Media Type", "Message": "Server cannot accept media type"}
  }
  return error_msgs[String(statusCode)]
}

module.exports = { errorMsg }