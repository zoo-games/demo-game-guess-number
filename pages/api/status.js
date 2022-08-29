import * as ApiKey from 'zoo-game-sdk/src/auth/apikey/index'
import axios from 'axios';

// Initialized API KEY and SECRET KEY
const API_KEY = process.env.API_KEY;
const SEC_KEY = process.env.SEC_KEY;
const api_server = process.env.API_URL;

export default async function handler(req, res) {
  // Signing body data with HMAC signing
  console.log(req.body);
  let body = {jwt: req.body.jwt};
  let bodyMessage = JSON.stringify(body); 
  let hmac = ApiKey.signData(bodyMessage, SEC_KEY); // hmac or SignedSignatureFromPayload  

  // Request by Post Method //
  let ret = await axios.post(`${api_server}/api/${API_KEY}/session/status`, body, {headers:{Authorization: `Bearer ${hmac}`}});
  console.log('ret', ret.data);
  res.status(200).json(ret.data);
}
