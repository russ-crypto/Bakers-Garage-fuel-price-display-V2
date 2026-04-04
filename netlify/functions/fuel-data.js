exports.handler = async function () {
  return {
    statusCode: 200,
    body: JSON.stringify({
      petrol:{price:"133.9p",station:"Texaco Houndmills"},
      diesel:{price:"140p",station:"Morrisons Basingstoke"},
      average:{petrol:"151.4p"}
    })
  };
};
