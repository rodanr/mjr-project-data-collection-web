module.exports = (db, o, callback) => {
  // Get the documents collection
  const collection = db.collection('data_collection');
  // Insert some documents

  collection.insertOne(o, function (err, result) {
    if (err) {
      callback('err');
    } else {
      callback('done');
    }
  });
};
