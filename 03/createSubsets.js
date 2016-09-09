const fs = require('fs');
const _ = require('lodash');
const jsonfile = require('jsonfile');

const inputFile = "data.json"
const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

const lastIndex = data.length - 1;  
const subset0 = data.slice(0, Math.floor(lastIndex * 0.25));
const subset1 = data.slice(Math.floor(lastIndex * 0.25), Math.floor(lastIndex * 0.5));
const subset2 = data.slice(Math.floor(lastIndex * 0.5), Math.floor(lastIndex * 0.75));
const subset3 = data.slice(Math.floor(lastIndex * 0.75), lastIndex);

const subsets = [
  subset0,
  subset1,
  subset2,
  subset3
];

subsets.forEach((d, i) => {
  const outputData = d;
  const outputFile = `subset-${i}.json`;
  jsonfile.spaces = 2;

  jsonfile.writeFile(outputFile, outputData, function (err) {
    console.error(err)
  })
})
