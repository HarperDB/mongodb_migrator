import handleError from '../../../utils/handleApiError'
import countDocuments from '../../../mongodb/countDocuments'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const mongoCountDocs: any = await countDocuments(
                req.body.mongoConStr,
                req.body.mongoDatabase,
                req.body.mongoCollection
            )

            res.status(200).json({
                documentCount: mongoCountDocs,
            })
        } catch (err) {
            console.log(err)
            handleError(err, res)
        }
    } else {
        res.status(404)
    }
}
