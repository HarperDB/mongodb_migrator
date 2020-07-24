import handleError from '../../../utils/handleApiError'
import checkConnection from '../../../mongodb/checkConnection'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            let connectionString = req.body.connectionString
            await checkConnection(connectionString)

            res.status(200).json({ message: 'connection success!' })
        } catch (err) {
            console.log(err)
            handleError(err, res)
        }
    } else {
        res.status(404)
    }
}
