exports.handler = async function () {
  try {
    // Get access token
    const tokenRes = await fetch(process.env.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      })
    });

    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    // Get fuel data
    const fuelRes = await fetch(process.env.API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const fuelJson = await fuelRes.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fuelJson)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
