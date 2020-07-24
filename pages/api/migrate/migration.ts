import handleError from '../../../utils/handleApiError'
import getAllDocuments from '../../../mongodb/getAllDocuments'
import getDocsWithPagination from '../../../mongodb/getDocsWithPagination'
import insertDocuments from '../../../harperdb/insertDocuments'
import mapIdToHashAtt from '../../../utils/mapIdToHashAtt'

const PAGINATION_RECORD: number = 1000

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const mongoCountDocsNumber: number = req.body.mongoDocsCount
            const mongoLoopCount: number = req.body.loop
            const harperHashAttribute: string = req.body.harperHashAttribute
            let mongoDocs: any = null

            if (mongoCountDocsNumber > PAGINATION_RECORD) {
                let countSkip = mongoLoopCount * PAGINATION_RECORD
                mongoDocs = await getDocsWithPagination(
                    req.body.mongoConStr,
                    req.body.mongoDatabase,
                    req.body.mongoCollection,
                    countSkip,
                    PAGINATION_RECORD
                )
            } else {
                mongoDocs = await getAllDocuments(
                    req.body.mongoConStr,
                    req.body.mongoDatabase,
                    req.body.mongoCollection
                )
            }

            if (mongoDocs) {
                let newMongoDocs: any = null
                if (harperHashAttribute !== '_id') {
                    newMongoDocs = mapIdToHashAtt(
                        mongoDocs,
                        harperHashAttribute
                    )
                } else {
                    newMongoDocs = mongoDocs
                }

                const harperDocs = await insertDocuments(
                    req.body.hdbUrl,
                    req.body.hdbAuth,
                    req.body.harperSchema,
                    req.body.harperTable,
                    newMongoDocs
                )

                if (harperDocs) {
                    res.status(200).json(harperDocs)
                } else {
                    res.status(500).json({
                        message: 'insert_harperdb_docs_fail',
                    })
                }
            } else {
                res.status(500).json({
                    message: 'get_mongodb_docs_fail',
                })
            }
        } catch (err) {
            console.log('migrate error: ', err)
            handleError(err, res)
            res.status(500).json(err.message)
        }
    } else {
        res.status(404)
    }
}
