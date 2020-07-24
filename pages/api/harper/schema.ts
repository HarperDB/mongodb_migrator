import axios, { AxiosRequestConfig } from 'axios'
import handleError from '../../../utils/handleApiError'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const config: AxiosRequestConfig = {
            method: 'post',
            baseURL: req.body.hdbUrl,
            headers: {
                Authorization: `Basic ${req.body.hdbAuth}`,
                'Content-Type': 'application/json',
            },
            data: JSON.stringify({ operation: 'describe_all' }),
        }

        try {
            const result = await axios(config)

            const origin = result.data
            const schemas = Object.keys(origin)

            const data = schemas.map((schema) => {
                return {
                    schemaName: schema,
                    tables: Object.values(origin[schema]),
                }
            })

            res.json(data)
        } catch (err) {
            console.log('get harper schema error: ', err.message)
            handleError(err, res)
        }
    } else {
        res.json({ name: 'John Doe' })
    }
}
