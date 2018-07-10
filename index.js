const fs = require('fs');
const parse = require('csv-parse');
const stringify = require('csv-stringify');
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

const DAYS_RANGE = 101;

const EUROSTOXX_TICKER = "SX5E";
const VIX_TICKER = "VIX";

let indices = [];
let retryCounter = 3;


function prepareIndices(rows) {
  for(let i = 0; i < rows.length; i++) {
    //parse date
    rows[i][INDICES.DATE] = date.parse(rows[i][INDICES.DATE], DATE_IN);
  }
}

function collectIndicesData(ind, out) {
  out = out || false;
  //index in
  let index_name = (out) ? indices[ind][INDICES.COMPANY_OUT] : indices[ind][INDICES.COMPANY_IN];
  let index = (out) ? indices[ind][INDICES.TICKER_OUT] : indices[ind][INDICES.TICKER_IN];
  //date
  let date_in_out = date.format(indices[ind][INDICES.DATE], DATE_OUT);


  console.log("Collecting data for:", index_name);
  stoxx.getData(index, (data, err) => {
    if (data) {
      console.log("Preparing data for:", index_name);
      let csvArray = stoxx.getAdjustedCloseCombined({name: index_name, data}, date_in_out, DAYS_RANGE);
      console.log("Done");
      console.log("Writing data to file", index_name+".csv");
      writeCsv(index_name, csvArray, date_in_out, (out) ? "OUT": "IN");
    } else {
      console.log("No data found for", index_name, "("+index+")");
      console.log(err);
      if (err.indexOf("Invalid API call") > -1 && retryCounter) {
        console.log("Trying again...");
        if (!out) ind--;
        out = !out;
        retryCounter--;
      } else {
        retryCounter = 3;
      }
    }

    console.log("\n##########################");
    console.log("Progress: " + (ind+1) + "/" + indices.length);
    console.log("##########################\n\n");
    //Delay due to api calls quotas
    setTimeout(_ => {
      if (out) {
        if (ind < indices.length - 1) collectIndicesData(ind+1, false);
        else console.log("All data extracted!");
      } else {
        collectIndicesData(ind, true);
      }
    }, 15000);
  });

}

function writeCsv(name, data, dateString, inout) {

  stringify(data, { delimiter: ";" }, (err, output) => {
    if (err) throw err;
    fs.writeFile("output/"+name+'_'+inout+'_'+dateString+'.csv', output, (err) => {
      if (err) throw err;
      //console.log(name+'.csv saved.');
    });
  });
}


//load data indices
function loadIndices() {
  fs.readFile(PATH_INDICES, function (err, fileData) {
    parse(fileData, {delimiter: ";"}, function(err, rows) {
      // Your CSV data is in an array of arrys passed to this callback as rows.
      prepareIndices(rows);
      indices = rows;
      console.log("Indices loaded");
      collectIndicesData(1);
    })
  });
}

//load data indices
fs.readFile(PATH_EUROSTOXX, function (err, fileData) {
  parse(fileData, {delimiter: ","}, function(err, rows) {
    stoxx.init(["VIX", {"EUROSTOXX": rows}], loadIndices);

  })
});
