import axios, { AxiosRequestConfig } from 'axios'

export default async (hdbHostname, hdbAuthen, hdbSchema, hdbTable, hdbDocs) => {
    const config: AxiosRequestConfig = {
        method: 'post',
        baseURL: hdbHostname,
        headers: {
            Authorization: `Basic ${hdbAuthen}`,
            'Content-Type': 'application/json',
        },
        data: JSON.stringify({
            operation: 'insert',
            schema: hdbSchema,
            table: hdbTable,
            records: hdbDocs,
        }),
    }

    try {
        const result = await axios(config)
        return result.data
    } catch (err) {
        return err
    }
}
