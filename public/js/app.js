function generateState(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// STEP 1: SET AUTHORIZATION PARAMETERS
const domain = 'cs493-portfolio-saechaok.us.auth0.com'
const client_id = 'nEmEtb2gZbkreml2ay2uQGa6Uj3PQFw2' 
const redirect_uri = "http://localhost:8080/profile" 
const response_type = "code"
const scope = 'openid email'
const audience = `https://${domain}/api/vs/`
const connection = 'Username-Password-Authentication'


// // STEP 2: REDIRECT TO GOOGLE'S OAUTH 2.0 SERVER
// const url = domain + '?' +
// 'response_type=code&' +
// 'client_id='+ client_id + '&' +
// 'scope=openid email' +
// `audience=https://${domain}/api/v2/&`+
// 'connection=Username-Password-Authentication&'+
// 'redirect_uri=' + redirect_uri

// let element = document.getElementsByTagName('form')[0]
// console.log(element)
// element.setAttribute('action', url)

// document.getElementById("myButton").onclick = () => {
//   location.href = url
// }