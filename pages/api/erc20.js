import * as ApiKey from 'zoo-game-sdk/src/auth/apikey/index'
import axios from 'axios';

// Initialized API KEY and SECRET KEY
const API_KEY = process.env.API_KEY;
const SEC_KEY = process.env.SEC_KEY;
const api_server = process.env.API_URL;

export default async function handler(req, res) {
  let retVal = {success: true, data: {}};
  try {
    const gameAddress = process.env.GAME_ADDR;

    // create erc20 token
    let body = {
      gameAddress: gameAddress,
      name: 'GuessNumber',
      symbol: 'GN',
    };

    let bodyMessage =JSON.stringify(body);
    let hmac = ApiKey.signData(bodyMessage, SEC_KEY);
    let ret = await axios.post(`${api_server}/api/${API_KEY}/erc20/create`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc20 create:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      throw ret.data;
    }

    let tokenAddress = ret.data.data.tokenAddress;

    // mint erc20 token
    body = {
      gameAddress: gameAddress,
      tokenAddress,
      amount: '1000',
      username: 'lolieatapple',
    };

    bodyMessage =JSON.stringify(body);
    hmac = ApiKey.signData(bodyMessage, SEC_KEY);

    ret = await axios.post(`${api_server}/api/${API_KEY}/erc20/mint`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc20 mint:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      console.log('erc20 mint failed', ret.data);
      throw ret.data;
    }

    // burn erc20 token
    body = {
      gameAddress: gameAddress,
      tokenAddress,
      amount: '500',
      username: 'lolieatapple',
    };

    bodyMessage =JSON.stringify(body);
    hmac = ApiKey.signData(bodyMessage, SEC_KEY);

    ret = await axios.post(`${api_server}/api/${API_KEY}/erc20/burn`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc20 burn:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      console.log('erc20 burn failed', ret.data);
      throw ret.data;
    }

    // balance erc20 token
    body = {
      tokenAddress,
      username: 'lolieatapple',
    };

    bodyMessage =JSON.stringify(body);
    hmac = ApiKey.signData(bodyMessage, SEC_KEY);

    ret = await axios.post(`${api_server}/api/${API_KEY}/erc20/balance`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc20 balance:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      console.log('erc20 balance failed', ret.data);
      throw ret.data;
    }

    // transfer erc20 token
    body = {
      gameAddress: gameAddress,
      tokenAddress,
      amount: '50',
      fromUser: 'lolieatapple',
      toUser: 'molin0000'
    };

    bodyMessage =JSON.stringify(body);
    hmac = ApiKey.signData(bodyMessage, SEC_KEY);

    ret = await axios.post(`${api_server}/api/${API_KEY}/erc20/transfer`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc20 transfer:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      console.log('erc20 transfer failed', ret.data);
      throw ret.data;
    }

  } catch (error) {
    console.log(error);
    retVal.success = false;
    retVal.data.message = error.message;
  } finally {
    res.status(200).json(retVal);
  }
}
