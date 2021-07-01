const fs = require('fs');
const path = require('path');
const id = require('./randomIntFromInterval')(0, 10109);

module.exports = () => {
  filepath = path.join(__dirname, '../files/data.json');
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf-8', (err, done) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(done));
      }
    });
  });
};
