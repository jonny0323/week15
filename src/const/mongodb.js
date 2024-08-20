const mongodb = require("mongodb").MongoClient

const connectMongoDb = async () => {
    const client = await mongodb.connect("mongodb://localhost:27017")

    return client
}


module.exports = connectMongoDb