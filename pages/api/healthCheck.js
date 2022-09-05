import { setCacheValue, getCacheValue } from "./gameStart";
import * as ApiKey from 'zoo-game-sdk/src/auth/apikey/index'
import axios from 'axios';

const API_KEY = process.env.API_KEY;
const SEC_KEY = process.env.SEC_KEY;
const api_server = process.env.API_URL;

export default async function handler(req, res) {
  let retVal = {success: true, data: {}};

  try {
    let playingGames = await getCacheValue(API_KEY, 'playing');
    console.log('playingGames', playingGames);
    if (!playingGames) {
      return;
    }

    retVal.data = playingGames;

    let bads = Object.keys(playingGames).map(v=>playingGames[v]).filter(v=>v).filter(v=>(v.timestamp + 10*60*1000) < Date.now());
    console.log('bads', bads);

    bads.map(v=>{
      delete playingGames[v.key];
    });

    if (bads.length > 0) {
      await setCacheValue(API_KEY, 'playing', playingGames);
    }
    
    for (let i=0; i<bads.length; i++) {
      let key = bads[i].key;
      let guessRound = bads[i].guessRound;
      let roundId = bads[i].roundId;
      let gameAddress = process.env.GAME_ADDR;

      let body = {
        gameResultAmount: (10 + guessRound/1).toString(),
        usersResultAmount: [(10 - guessRound/1).toString()],
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
  } catch (error) {
    console.log(error);
    retVal.success = false;
    retVal.data.message = error.message;
  } finally {
    res.status(200).json(retVal);
  }
}
