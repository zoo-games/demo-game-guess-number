import * as ApiKey from "zoo-game-sdk/src/auth/apikey/index";
import axios from "axios";

// Initialized API KEY and SECRET KEY
const API_KEY = process.env.API_KEY;
const SEC_KEY = process.env.SEC_KEY;
const api_server = process.env.API_URL;

export default async function handler(req, res) {
  console.log("login", req.query);
  try {
    // Signing body data with HMAC signing
    let body = {
      username: 'lolieatapple',
      token: req.query.token,
      gameAddress: '0x4Cf0A877E906DEaD748A41aE7DA8c220E4247D9e',
      userPrimary: '0x5560aF0F46D00FCeA88627a9DF7A4798b1b10961',
      amountUserPay: 10,
      amountUserGot: 0,
      itemId: 1,
    };
    let bodyMessage = JSON.stringify(body);
    let hmac = ApiKey.signData(bodyMessage, SEC_KEY); // hmac or SignedSignatureFromPayload

    // Request by Post Method //
    let ret = await axios.post(
      `${api_server}/api/${API_KEY}/game/trade`,
      body,
      { headers: { Authorization: `Bearer ${hmac}` } }
    );
    console.log("ret", ret.data);
    res.status(200).json(ret.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
}
