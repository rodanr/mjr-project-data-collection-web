const intervalId = require('./randomIntFromInterval');
const readingFile = require('./fileRead');

module.exports = () => {
  return new Promise((resolve, reject) => {
    readingFile()
      .then((data) => {
        id = intervalId(0, 10109);
        resolve({
          id: id,
          sentence: data[id]['sentences'],
        });
      })
      .catch((err) => reject(err));
  });
};
