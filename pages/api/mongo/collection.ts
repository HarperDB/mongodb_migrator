import { IMongoSchema } from '../../../types/Mongodb'
import getAllDatabases from '../../../mongodb/getAllDatabases'
import getCollectionWithDatabaseName from '../../../mongodb/getCollectionWithDatabaseName'

/**
 * Fake mongo schema data
 */
const mongoSchemas: IMongoSchema[] = [
    {
        schemaName: 'Animal',
        collections: [
            {
                name: 'Dog',
            },
            {
                name: 'Ant',
            },
        ],
    },
    {
        schemaName: 'Machine',
        collections: [
            {
                name: 'Cars',
            },
            {
                name: 'Ship',
            },
        ],
    },
]

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            let mongoConStr = req.body.mongoConStr
            let databases: any = await getAllDatabases(mongoConStr)
            let result: any = []

            if (databases) {
                result = await Promise.all(
                    databases.map(async (database: any) => {
                        let databaseName = database.name
                        let data = await getCollectionWithDatabaseName(
                            mongoConStr,
                            databaseName
                        )
                        return data
                    })
                )
                res.status(200).json(result)
            }
        } catch (err) {
            console.log('collection api error: ', err)
            res.status(500).json(err.message)
        }
    } else {
        res.status(200).json(mongoSchemas)
    }
}
