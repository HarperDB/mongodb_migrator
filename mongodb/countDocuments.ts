import { MongoClient } from 'mongodb'

export default (mongoConStr, mongoDatabase, collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoConStr, (err, client) => {
            if (err) {
                reject(err)
            } else {
                const db = client.db(mongoDatabase)
                db.collection(collectionName).countDocuments(
                    {},
                    (err, data) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(data)
                        }
                    }
                )

                client.close()
            }
        })
    })
}
