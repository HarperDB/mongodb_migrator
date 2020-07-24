import { MongoClient } from 'mongodb'

export default (mongoConStr, mongoDatabase) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoConStr, (err, client) => {
            if (err) {
                reject(err)
            } else {
                const db = client.db(mongoDatabase)
                const schemaName = db.databaseName
                db.listCollections().toArray((err, data) => {
                    if (err) {
                        reject(
                            err?.message
                                ? err.message
                                : 'cannot connect to mongodb'
                        )
                    } else {
                        resolve({
                            schemaName,
                            collections: data,
                        })
                    }
                })

                client.close()
            }
        })
    })
}
