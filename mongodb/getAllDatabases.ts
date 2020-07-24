import { MongoClient } from 'mongodb'

export default (mongoConStr) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(mongoConStr, (err, client) => {
            if (err) {
                reject(err)
            } else {
                const adminDb = client.db().admin()
                adminDb.listDatabases((err, dbs) => {
                    if (dbs.databases.length > 0) {
                        resolve(dbs.databases)
                    } else {
                        reject(err)
                    }

                    client.close()
                })
            }
        })
    })
}
