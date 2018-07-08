const http = require('http');
const fs = require('fs');
let parse = require('csv-parse');
let date = require('date-and-time');

const PATH_INDICES = "./assets/indices.csv";
const DATE_IN = "MMMM D, YYYY";
const DATE_OUT = "YYYY-MM-DD";
const INDICES = {
  COMPANY_IN: 0,
  COMPANY_OUT: 1,
  DATE: 2,
  TICKER_IN: 3,
  TICKER_OUT: 4
};


// http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.end('Hello World!');
// }).listen(8080);

function prepareIndices(rows) {
  for(let i = 0; i < rows.length; i++) {
    rows[i][INDICES.DATE] = date.parse(rows[i][INDICES.DATE], DATE_IN);
  }
}

fs.readFile(PATH_INDICES, function (err, fileData) {
  parse(fileData, {delimiter: ";"}, function(err, rows) {
    // Your CSV data is in an array of arrys passed to this callback as rows.
    prepareIndices(rows);
    console.log(rows);
  })
});
