const fs = require('fs')
const Path = require('path')
const CSVParse = require('csv-parse')

const parser = CSVParse({ columns: true }, (err, data) => {
  if (err) { throw err }

  fs.writeFileSync(
    Path.resolve(__dirname, 'dist/CityOfCalgary2016.json'),
    JSON.stringify(data)
  )
});

fs.createReadStream(
  Path.resolve(__dirname, 'data/CityOfCalgary2016.csv')
).pipe(parser);
