const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/************ CONFIG ************/
const CEPT_USERNAME = "1000060525";
const CEPT_PASSWORD = "Gventures@8488";

const LOGIN_URL = "https://test.cept.gov.in/beextcustomer/v1/access/login";
const TRACKING_BASE_URL = "https://test.cept.gov.in/beextcustomer/v1/tracking";

/************ TOKEN CACHE ************/
let ACCESS_TOKEN = "";
let TOKEN_TIME = 0;

async function getToken() {
  if (ACCESS_TOKEN && Date.now() - TOKEN_TIME < 20 * 60 * 1000) {
    return ACCESS_TOKEN;
  }

  const res = await axios.post(LOGIN_URL, {
    username: CEPT_USERNAME,
    password: CEPT_PASSWORD
  });

  ACCESS_TOKEN = res.data.data.accessToken;
  TOKEN_TIME = Date.now();
  return ACCESS_TOKEN;
}

/************ TRACK ENDPOINT ************/
app.post("/track", async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    if (!trackingNumber) {
      return res.json({ success: false, message: "Tracking number missing" });
    }

    const token = await getToken();

    const result = await axios.get(
      `${TRACKING_BASE_URL}/${trackingNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      }
    );

    res.json(result.data);
  } catch (err) {
    res.json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

/************ START ************/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Speed Post server running on port", PORT);
});
