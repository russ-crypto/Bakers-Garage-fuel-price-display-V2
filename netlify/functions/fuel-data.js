exports.handler = async () => {
  const tokenResponse = await fetch(process.env.TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope: "fuel-prices"
    })
  });

  const tokenData = await tokenResponse.json();

  const fuelResponse = await fetch(process.env.API_URL, {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const fuelData = await fuelResponse.json();

  // Filter Basingstoke (rough area filter)
  const stations = fuelData.stations || [];

  const basingstoke = stations.filter(s =>
    s.address?.toLowerCase().includes("basingstoke")
  );

  const petrol = basingstoke
    .filter(s => s.fuelPrices?.E10)
    .sort((a, b) => a.fuelPrices.E10 - b.fuelPrices.E10)[0];

  const diesel = basingstoke
    .filter(s => s.fuelPrices?.B7)
    .sort((a, b) => a.fuelPrices.B7 - b.fuelPrices.B7)[0];

  return {
    statusCode: 200,
    body: JSON.stringify({
      petrol: petrol ? petrol.fuelPrices.E10 + "p - " + petrol.brand : "N/A",
      diesel: diesel ? diesel.fuelPrices.B7 + "p - " + diesel.brand : "N/A",
      average: "Live"
    })
  };
};
