let MongoClient = require('mongodb').MongoClient;
let { logger } = require('../../logger');
const that = this;
let client = null;
let db = null;

exports.connect = async (MONGO_URL, database) => {
  return new Promise(async (resolve) => {
    let options = {
      maxPoolSize: 100,
      socketTimeoutMS: 480000,
      connectTimeoutMS: 30000,
      useNewUrlParser: true
    };
    client = new MongoClient(MONGO_URL, options);
    client.connect().then(() => {
      db = client.db(database);
      createIndex();
      resolve([true, db])
    }).catch(err => {
      logger.error(err);
      resolve([false, err])
    })
  })
}
exports.close = async function () {
  return new Promise(function (resolve) {
    if (client) {
      client.close();
      logger.info("close mongo db");
      resolve([true, client]);
    } else {
      resolve([true, client]);
    }
  })
};
exports.getCollection = async function (_collectionName) {
  return new Promise(async (reslove) => {
    let collection =await db.collection(_collectionName);
    reslove(collection)
  });
}
//save
// ==============================================
exports.save = async function (collection_name, providerObjects) {
  return new Promise(async (resolve) => {
    try {
      let collection=await that.getCollection(collection_name)
      if(providerObjects?._id!=undefined){
        delete providerObjects._id;
      }
      let insertOBJ=JSON.parse(JSON.stringify(providerObjects))
      await collection.insertOne(insertOBJ);
      resolve([true, providerObjects]);
    } catch (err) {
      logger.warn(`Mongo Error while saving in ${collection_name} data:- ${JSON.stringify(providerObjects)}`);
      logger.error(err);
      resolve([false, err])
    }
  })
};

//savemany
// ==============================================
exports.saveMany = async function (collection_name, providerObjects) {
  return new Promise(async (resolve) => {
    try {
      let collection=await that.getCollection(collection_name)
      await collection.insertMany(providerObjects);
      resolve([true, providerObjects]);
    } catch (err) {
      logger.warn(`Mongo Error while save many in ${collection_name} data:- ${JSON.stringify(providerObjects)}`);
      logger.error(err);
      resolve([false, err])
    }
  })
};


//find Sorted Objects with Fields
exports.findSortedObjectsFields = async (collection_name, query, Fields, sort, limit) => {
  return new Promise(async (resolve) => {
    let collection=await that.getCollection(collection_name)
      await collection.find(query).project(Fields).sort(sort).limit(limit).toArray().then(result => {
      resolve([true,result]);
    }).catch(err => {
      logger.error(err)
      resolve([false, err])
    })
  })
}

//Counts Collection Records
exports.counts = async (collection_name, query) => {
  return new Promise(async (resolve) => {
    let collection=await that.getCollection(collection_name)
      await collection.countDocuments(query).then(result => {
      resolve(result);
    }).catch(err => {
      logger.error(err)
      resolve(0)
    })

  })
}

//Remove Records From Collection
exports.removeRecords = async (collection_name, query) => {
  return new Promise(async (resolve) => {
    let collection=await that.getCollection(collection_name)
      await collection.deleteMany(query).then(result => {
      resolve(result);
    }).catch(err => {
      logger.error(err)
      resolve(0)
    })

  })
}

//Add Or Update From Collection
exports.updateOne = function (collection_name, id, providerObjects) {
  return new Promise(async (reslove) => {
    let collection=await that.getCollection(collection_name)
      await collection.updateOne({ _id: id }, { $set: providerObjects }, { upsert: true }).then(() => {
      reslove([true])
    }).catch(err => {
      logger.warn(`Mongo Error while updateOne in ${collection_name} data:- ${JSON.stringify(providerObjects)}`);
      logger.error(err)
      reslove([false])
    })

  })
};


const createIndex = function () {
  return new Promise(async (resolve) => {
    try {
      let ListOfCollections = ['state', 'irstate', 'device_configiration', 'energy_days', 'energy_minutes', 'energy_months', 'humidity_history', 'temperature_history','energy_total'];

      // Function to create indexes for a given collection
      const createIndexes = async (collectionInstance) => {
        await Promise.all([
          collectionInstance.createIndex({ device_id: -1 }),
          collectionInstance.createIndex({ device_id: 1 }),
          collectionInstance.createIndex({ device_id: 1, ts: 1 }),
          collectionInstance.createIndex({ device_id: -1, ts: -1 }),
          collectionInstance.createIndex({ device_id: -1, ts: 1 }),
          collectionInstance.createIndex({ device_id: 1, ts: -1 }),
          collectionInstance.createIndex({ ts: -1 }),
          collectionInstance.createIndex({ ts: 1 })
        ]);
      };

      // Iterate through the list of collections and create indexes
      await Promise.all(
        ListOfCollections.map(async (collection) => {
          const collectionInstance = await that.getCollection(collection);
          await createIndexes(collectionInstance);
        }));

      resolve(true);
    } catch (err) {
      logger.error(err);
      resolve(false);
    }
  });
};
