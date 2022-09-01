import * as ApiKey from 'zoo-game-sdk/src/auth/apikey/index'
import { generateRandomNumber } from 'zoo-game-sdk/src/random';
import axios from 'axios';

// Initialized API KEY and SECRET KEY
const API_KEY = process.env.API_KEY;
const SEC_KEY = process.env.SEC_KEY;
const api_server = process.env.API_URL;

export async function setCacheValue(apikey, key, value) {
  console.log('cache:', `https://${process.env.CACHE_API}/api/${apikey}/${process.env.GAME_NAME}-${key}`)
  console.log('value', JSON.stringify({value}));
  let ret = await fetch(`https://${process.env.CACHE_API}/api/${apikey}/${process.env.GAME_NAME}-${key}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({value})
  });
  let v = await ret.json()
  console.log('ret', v);
  return v;
}

export async function getCacheValue(apikey, key) {
  console.log('cache:', `https://${process.env.CACHE_API}/api/${apikey}/${process.env.GAME_NAME}-${key}`)
  const res = await fetch(`https://${process.env.CACHE_API}/api/${API_KEY}/${apikey}/${process.env.GAME_NAME}-${key}`);
  const data = await res.json();
  return data.value;
}

export default async function handler(req, res) {
  let retVal = {success: true, data: {}};
  const id = Date.now();
  retVal.data.id = id;
  console.log('id', id);
  try {
    const { username, primaryAddress, jwt } = req.body;
    if (!username || !primaryAddress) {
      throw new Error('username or primaryAddress is empty');
    }
    const randomNumber = Number('0x' + generateRandomNumber(2, 1)) % 10000;
    console.log('randomNumber',  randomNumber);



    await setCacheValue(API_KEY, id, {
      random: randomNumber,
      username,
      primaryAddress,
    });
  } catch (error) {
    retVal.success = false;
    retVal.data.message = error.message;
  } finally {
    res.status(200).json(retVal);
  }

  // // Signing body data with HMAC signing
  let body= {
    userJwts: [jwt],
    userLockAmounts: [],
  };
  // let bodyMessage =JSON.stringify(body); 
  // let hmac = ApiKey.signData(bodyMessage, SEC_KEY); // hmac or SignedSignatureFromPayload  

  // // Request by Post Method //
  // let ret = await axios.post(`${api_server}/api/${API_KEY}/session/loginAndApprove`, body, {headers:{Authorization: `Bearer ${hmac}`}});
  // console.log('ret', ret.data);
  // res.status(200).json(ret.data);
}
