import { MongoClient } from 'mongodb'

const checkConnection = (connectionString) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(connectionString, (err, client) => {
            if (err) {
                reject(err)
            } else {
                resolve(true)
                client.close()
            }
        })
    })
}

export default checkConnection
