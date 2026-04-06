exports.handler = async function () {
  try {
    const tokenRes = await fetch(process.env.TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      })
    });

    const tokenText = await tokenRes.text();

    if (!tokenRes.ok) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `Token failed: ${tokenRes.status}`,
          detail: tokenText
        })
      };
    }

    let tokenJson;
    try {
      tokenJson = JSON.parse(tokenText);
    } catch {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Token endpoint did not return JSON",
          detail: tokenText
        })
      };
    }

    const accessToken = tokenJson.access_token || tokenJson.token;

    if (!accessToken) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "No access token returned",
          detail: tokenJson
        })
      };
    }

    const fuelRes = await fetch(process.env.API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });

    const fuelText = await fuelRes.text();

    if (!fuelRes.ok) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `Fuel API failed: ${fuelRes.status}`,
          detail: fuelText
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: fuelText
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: err.message || String(err)
      })
    };
  }
};
