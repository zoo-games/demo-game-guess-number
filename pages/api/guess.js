import { setCacheValue, getCacheValue } from "./gameStart";
import * as ApiKey from 'zoo-game-sdk/src/auth/apikey/index'
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const SEC_KEY = process.env.SEC_KEY;
const api_server = process.env.API_URL;

export default async function handler(req, res) {
  let retVal = {success: true, data: {}};

  try {
    const { username, primaryAddress, guess, key, roundId, guessRound } = req.body;
    console.log('body', req.body);
    if (!username || !primaryAddress || !key || !roundId) {
      throw new Error('username or primaryAddress is empty');
    }
    const cache = await getCacheValue(API_KEY, key);
    console.log('cache', cache);
    retVal.success = false;
    const random = cache.random;
    const gameAddress = process.env.GAME_ADDR;

    if (guess.toString() === random.toString()) {
      retVal.success = true;
      retVal.data.message = 'You win!';
      retVal.data.random = random;
      retVal.data.history = {
        round: guessRound + 1,
        number: guess,
        status: '4🍎 0🍐',
        result: '🏆'
      };


      let body = {
        gameResultAmount: guessRound.toString(),
        usersResultAmount: [(20 - Number(guessRound)).toString()],
        roundId,
        gameAddress,
      };

      console.log('body', body);

      let bodyMessage =JSON.stringify(body);
      let hmac = ApiKey.signData(bodyMessage, SEC_KEY);
      let ret = await axios.post(`${api_server}/api/${API_KEY}/game/over`, body, {headers:{Authorization: `Bearer ${hmac}`}});
      console.log('game over:', ret.data);
      if (!ret.data.success) {
        throw new Error(ret.data.data);
      }
      retVal.data.gameOver = true;
      retVal.data.winned = true;
    } else {
      retVal.success = true;
      const result = random.split('').reduce((acc, cur, idx) => {
        if (cur === guess[idx]) {
          acc[0]++;
        } else if (random.indexOf(guess[idx]) !== -1) {
          acc[1]++;
        }
        return acc;
      }, [0, 0]);
      console.log('result', result);

      retVal.data.history = {
        round: guessRound + 1,
        number: guess,
        status: `${result[0]}🍎 ${result[1]}🍐`,
        result: '⏳'
      };
      if (guessRound >= 9) {
        retVal.data.winned = false;
        retVal.data.gameOver = true;
        retVal.data.random = random;

        let body = {
          gameResultAmount: '20',
          usersResultAmount: ['0'],
          roundId,
          gameAddress,
        };
  
        console.log('body', body);
  
        let bodyMessage =JSON.stringify(body);
        let hmac = ApiKey.signData(bodyMessage, SEC_KEY);
        let ret = await axios.post(`${api_server}/api/${API_KEY}/game/over`, body, {headers:{Authorization: `Bearer ${hmac}`}});
        console.log('game over:', ret.data);
        if (!ret.data.success) {
          throw new Error(ret.data.data);
        }
      }
    }
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
