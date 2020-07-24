import axios, { AxiosRequestConfig } from 'axios'
import handleError from '../../../utils/handleApiError'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const config: AxiosRequestConfig = {
            method: 'post',
            baseURL: req.body.hdbHostname,
            headers: {
                Authorization:
                    'Basic ' +
                    new Buffer(
                        `${req.body.hdbUsername}:${req.body.hdbPassword}`
                    ).toString('base64'),
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ operation: 'describe_all' }),
        }

        try {
            const result = await axios(config)
            res.json({ result: result.data })
        } catch (err) {
            handleError(err, res)
        }
    } else {
        res.json({ name: 'John Doe' })
    }
}
