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

    // create erc721 token
    let body = {
      gameAddress: gameAddress,
      name: 'GuessNumberNFT',
      symbol: 'GNFT',
    };

    let bodyMessage =JSON.stringify(body);
    let hmac = ApiKey.signData(bodyMessage, SEC_KEY);
    let ret = await axios.post(`${api_server}/api/${API_KEY}/erc721/create`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc721 create:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      throw ret.data;
    }

    let tokenAddress = ret.data.data.tokenAddress;

    // mint erc721 token
    body = {
      gameAddress: gameAddress,
      to: '0x4Cf0A877E906DEaD748A41aE7DA8c220E4247D9e',
      tokenAddress,
      tokenIds: [1,2,3,4],
      tokenJsons: [
        {token_id: 1, name: 'Guess1', description: 'Guess1 NFT Demo', image: 'https://picsum.photos/200/300' },
        {token_id: 2, name: 'Guess1', description: 'Guess1 NFT Demo', image: 'https://picsum.photos/200/300' },
        {token_id: 3, name: 'Guess1', description: 'Guess1 NFT Demo', image: 'https://picsum.photos/200/300' },
        {token_id: 4, name: 'Guess1', description: 'Guess1 NFT Demo', image: 'https://picsum.photos/200/300' },
      ],
    };

    bodyMessage =JSON.stringify(body);
    hmac = ApiKey.signData(bodyMessage, SEC_KEY);

    ret = await axios.post(`${api_server}/api/${API_KEY}/erc721/batchMint`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc721 mint:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      console.log('erc721 mint failed', ret.data);
      throw ret.data;
    }

    // burn erc721 burn
    body = {
      gameAddress: gameAddress,
      tokenAddress,
      tokenIds: [1, 2],
    };

    bodyMessage =JSON.stringify(body);
    hmac = ApiKey.signData(bodyMessage, SEC_KEY);

    ret = await axios.post(`${api_server}/api/${API_KEY}/erc721/batchBurn`, body, {headers:{Authorization: `Bearer ${hmac}`}});
    console.log('erc721 burn:', JSON.stringify(ret.data));
    if (!ret.data.success) {
      console.log('erc721 burn failed', ret.data);
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
