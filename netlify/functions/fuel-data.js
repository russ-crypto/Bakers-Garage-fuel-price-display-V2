exports.handler = async () => {
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

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Token failed: ${tokenRes.status} ${text}` })
      };
    }

    const tokenJson = await tokenRes.json();
    const accessToken =
      tokenJson.access_token ||
      tokenJson.accessToken ||
      tokenJson.token;

    if (!accessToken) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No access token returned" })
      };
    }

    const fuelRes = await fetch(process.env.API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json"
      }
    });

    if (!fuelRes.ok) {
      const text = await fuelRes.text();
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Fuel API failed: ${fuelRes.status} ${text}` })
      };
    }

    const fuelJson = await fuelRes.json();
    const stations = fuelJson.stations || fuelJson.data || fuelJson.results || [];

    const basingstoke = stations.filter((s) => {
      const text = [
        s.address,
        s.address1,
        s.address2,
        s.town,
        s.city,
        s.postcode,
        s.brand,
        s.siteName,
        s.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        text.includes("basingstoke") ||
        text.includes("rg21") ||
        text.includes("rg22") ||
        text.includes("rg24")
      );
    });

    const petrolSites = basingstoke
      .filter((s) => s.fuelPrices?.E10 != null)
      .sort((a, b) => Number(a.fuelPrices.E10) - Number(b.fuelPrices.E10));

    const dieselSites = basingstoke
      .filter((s) => s.fuelPrices?.B7 != null)
      .sort((a, b) => Number(a.fuelPrices.B7) - Number(b.fuelPrices.B7));

    const petrol = petrolSites[0];
    const diesel = dieselSites[0];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        petrol: petrol
          ? `${petrol.fuelPrices.E10}p - ${petrol.brand || petrol.siteName || petrol.name || "Unknown station"}`
          : "N/A",
        diesel: diesel
          ? `${diesel.fuelPrices.B7}p - ${diesel.brand || diesel.siteName || diesel.name || "Unknown station"}`
          : "N/A",
        average: "Live"
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
