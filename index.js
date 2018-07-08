const fs = require('fs');
const parse = require('csv-parse');
const date = require('date-and-time');
const stoxx = require('./modules/stoxx');

const PATH_INDICES = "./assets/indices.csv";
const PATH_EUROSTOXX = "./assets/STOXX50E.csv"

const DATE_IN = "MMMM D, YYYY";
const DATE_OUT = "YYYY-MM-DD";

const INDICES = {
  COMPANY_IN: 0,
  COMPANY_OUT: 1,
  DATE: 2,
  TICKER_IN: 3,
  TICKER_OUT: 4
};

const DAYS_RANGE = 100;

const EUROSTOXX_TICKER = "SX5E";
const VIX_TICKER = "VIX";

let eurostoxx = {};
let vix = {};
let indices = [];


function prepareIndices(rows) {
  for(let i = 0; i < rows.length; i++) {
    //parse date
    rows[i][INDICES.DATE] = date.parse(rows[i][INDICES.DATE], DATE_IN);
  }
}

function collectIndicesData() {
  console.log(eurostoxx["Meta Data"]);
}


//load data indices
fs.readFile(PATH_INDICES, function (err, fileData) {
  parse(fileData, {delimiter: ";"}, function(err, rows) {
    // Your CSV data is in an array of arrys passed to this callback as rows.
    prepareIndices(rows);
    indices = rows;
    console.log("Indices initianlised", indices);
  })
});

//load data indices
fs.readFile(PATH_EUROSTOXX, function (err, fileData) {
  parse(fileData, {delimiter: ","}, function(err, rows) {
    stoxx.init(["VIX", {"EUROSTOXX": rows}]);
  })
});
