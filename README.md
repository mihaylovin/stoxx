# STOXX
A simple tool for collecting historical stock prices data in relation to a regression analysis for an economics bachelor thesis.

## Usage

```sh
npm install
npm start
```

## How it works

The tool collects stock prices data from an online provider for the stocks listed in 'assets/indices.csv'.
The CSV file represents stocks excluded from or included into the EUROSTOXX 50 index on a particular date.
The stock data is pulled from the data provider using the symbol/ticker of the stock and extracts the daily adjusted close price for a 100 days prior and after the date of inclusion/exclusion. The extracted records are than paired with the respective daily adjusted close values of the EUROSTOXX 50 and VIX indices. A CSV file is generated for each stock and saved in the 'output' directory.
