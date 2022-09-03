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
  const res = await fetch(`https://${process.env.CACHE_API}/api/${apikey}/${process.env.GAME_NAME}-${key}`);
  const data = await res.json();
  console.log('data', data);
  return data.data.value;
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
    const randomNumber = ('0000' + Number('0x' + generateRandomNumber(2, 1)) % 10000).slice(-4);
    console.log('randomNumber',  randomNumber);

    const gameAddress = process.env.GAME_ADDR;

    let body = {
      userJwts: [jwt],
      userPrimaryAddresses: [primaryAddress],
      userLockAmounts: ['10'],
      gameAddress,
      gameLockAmount: (20/0.98).toFixed(8),
    };

    let bodyMessage =JSON.stringify(body);
    let hmac = ApiKey.signData(bodyMessage, SEC_KEY);
    let ret = await axios.post(`${api_server}/api/${API_KEY}/game/ready`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('game ready:', ret.data);
    if (!ret.data.success) {
      throw new Error('game ready failed');
    }

    ret = await axios.post(`${api_server}/api/${API_KEY}/game/start`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('game start:', ret.data);
    if (!ret.data.success) {
      throw new Error('game ready failed');
    }

    const roundId = ret.data.data.roundId;

    await setCacheValue(API_KEY, id, {
      random: randomNumber,
      username,
      primaryAddress,
      roundId,
      roundInfo: body,
      startTime: Date.now(),
    });

    retVal.data.roundId = roundId;
  } catch (error) {
    console.log(error);
    retVal.success = false;
    retVal.data.message = error.message;
  } finally {
    res.status(200).json(retVal);
  }

  // // Signing body data with HMAC signing
  
  // let bodyMessage =JSON.stringify(body); 
  // let hmac = ApiKey.signData(bodyMessage, SEC_KEY); // hmac or SignedSignatureFromPayload  

  // // Request by Post Method //
  // let ret = await axios.post(`${api_server}/api/${API_KEY}/session/loginAndApprove`, body, {headers:{Authorization: `Bearer ${hmac}`}});
  // console.log('ret', ret.data);
  // res.status(200).json(ret.data);
}
