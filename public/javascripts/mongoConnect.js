const MongoClient = require('mongodb');
const uploadDocs = require('./uploadFilesToDb');
const uri =
  'mongodb+srv://mjrproject:8qXYW69WhqBzRJ3@majorclstr.h7hao.mongodb.net/major_project?retryWrites=true&w=majority';
const dbName = 'major_project';
module.exports = (o) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      uri,
      { useUnifiedTopology: true },
      function (err, client) {
        // assert.equal(null, err);
        // console.log("Connected correctly to server");
        const db = client.db(dbName);
        uploadDocs(db, o, function (sts) {
          client.close();
          if (sts == 'err') {
            reject(sts);
          } else {
            resolve('done');
          }
        });
      }
    );
  });
};
