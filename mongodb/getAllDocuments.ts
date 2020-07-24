import { MongoClient } from 'mongodb'

export default (mongoConStr, mongoDatabase, collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoConStr, (err, client) => {
            if (err) {
                reject(err)
            } else {
                const db = client.db(mongoDatabase)
                db.collection(collectionName)
                    .find({})
                    .toArray((err, data) => {
                        if (err) {
                            reject(err)
                            client.close()
                        } else {
                            resolve(data)
                            client.close()
                        }
                    })
            }
        })
    })
}
