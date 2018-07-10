const https = require('https');
const config = require('./../privateConfig');

const STOXX_URL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=$TICKER&outputsize=full&apikey=" + config.API_KEY;

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
};

var stoxx = {};

let indexes = {};

function init(inxs, callback) {
  let counter = inxs.length;

  inxs.forEach(function (index, i) {
    if (typeof index === 'string') {
      getData(index, data => {
        indexes[index] = data;
        counter--;
        if (!counter) stoxxReady(callback);
      });
    } else {
      indexes[Object.keys(index)[0]] = prepareDataEurostoxx(index[Object.keys(index)[0]]);
      counter--;
      if (!counter) stoxxReady(callback);
    }
  });
}

function prepareDataAlpha(data) {
  if (!data) return data;
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
  data.forEach( k => {
    result[k[pattern.date]] = {
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

function getAdjustedCloseForPeriod(stock, dateString, daysBefore, daysAfter) {
  let days = Object.keys(stock);
  let dateIndex = days.indexOf(dateString);
  let dateFrom = dateIndex - daysBefore;
  if (dateFrom < 0) {
    dateFrom = 0;
    console.warn("WARN", "Not enough data for", daysBefore, "days before", dateString, "! Taking", dateIndex, "days.");
  }

  let dateTo = dateIndex + daysAfter;
  if (dateTo >= days.length) {
    dateTo = days.length - 1;
    console.warn("WARN", "Not enough data for", daysBefore, "days after", dateString, "! Taking", (dateTo - dateIndex), "days.");
  }

  let period = days.slice(dateFrom, dateTo);
  let adjClose = period.map( day => {
    return [day, convertToDecimalComma(stock[day].adjustedClose)];
  });

  return adjClose;
}

function convertToDecimalComma(num) {
  return (num+"").replace(".", ",");
}

function getAdjustedCloseCombined(stock, dateString, interval) {
  console.log("Extracting data for",stock.name);
  let stockAdjClose = getAdjustedCloseForPeriod(stock.data, dateString, interval, interval);
  console.log("Extracting data for EUROSTOXX");
  let eurostoxxAdjClose = getAdjustedCloseForPeriod(indexes.EUROSTOXX, dateString, interval, interval);
  console.log("Extracting data for VIX");
  let vixAdjClose = getAdjustedCloseForPeriod(indexes.VIX, dateString, interval, interval);

  let result = [["Date", "EUROSTOXX", "VIX", stock.name]];
  stockAdjClose.forEach(function(e, i) {

    result.push([stockAdjClose[i][0], eurostoxxAdjClose[i][1], vixAdjClose[i][1], stockAdjClose[i][1]]);
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
      if (result["Time Series (Daily)"]) {
        callback(prepareDataAlpha(result["Time Series (Daily)"]));
      } else {
        callback(0, result["Error Message"]);
      }

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}

function stoxxReady(cb) {
  console.log("Stoxx initialised", Object.keys(indexes));
  cb();
}

stoxx.getData = getData;
stoxx.init = init;
stoxx.getAdjustedCloseCombined = getAdjustedCloseCombined;

module.exports = stoxx;
