const https = require('https');
const config = require('./../privateConfig');

const STOXX_URL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=$TICKER&outputsize=full&apikey=" + config.API_KEY;

const DATA_PATTERNS = {
  ALPHAVANTAGE: {
    open: "1. open",
    high: "2. high",
    low: "3. low",
    close: "4. close",
    adjustedClose: "5. adjusted close",
    volume: "6. volume"
  },
  EUROSTOXX: {
    date: 0,
    open: 1,
    high: 2,
    low: 3,
    close: 4,
    adjustedClose: 5,
    volume: 6
  }
}

var stoxx = {};

let indexes = {};

function init(inxs) {
  let counter = inxs.length;

  inxs.forEach(function (index, i) {
    if (typeof index === 'string') {
      getData(index, data => {
        indexes[index] = prepareDataAlpha(data);
        counter--;
        if (!counter) printStoxxReady();
      });
    } else {
      indexes[Object.keys(index)[0]] = prepareDataEurostoxx(index[Object.keys(index)[0]]);
      counter--;
      if (!counter) printStoxxReady();
    }
  });
}

function prepareDataAlpha(data) {
  let pattern = DATA_PATTERNS.ALPHAVANTAGE;
  Object.keys(data).forEach(function (k) {
    let current = {};
    Object.keys(pattern).forEach(function (pk) {
      current[pk] = data[k][pattern[pk]];

    });
    data[k] = current;
  });

  return data;
}

function prepareDataEurostoxx(data) {
  let pattern = DATA_PATTERNS.EUROSTOXX;
  let result = {};
  data.forEach(function (k) {
    result[k[pattern.data]] = {
      open: k[pattern.open],
      high: k[pattern.high],
      low: k[pattern.low],
      close: k[pattern.close],
      adjustedClose: k[pattern.adjustedClose],
      volume: k[pattern.volume]
    }
  });

  return result;
}

function getData(ticker, callback) {
  console.log("Loading data for:", ticker);
  https.get(STOXX_URL.replace("$TICKER", ticker), (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      let result = JSON.parse(data);
      console.log("Loaded!");
      callback(result["Time Series (Daily)"]);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}

function printStoxxReady() {
  console.log("Stoxx initialised", Object.keys(indexes));
}

stoxx.getData = getData;
stoxx.init = init;

module.exports = stoxx;
