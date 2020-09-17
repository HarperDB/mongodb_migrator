import { useCallback, useState } from 'react'
import { getItem } from '../utils/localStoreage'
import axios, { AxiosRequestConfig } from 'axios'

const useFetchHarperDB = () => {
    const [loading, setLoading] = useState(false)
    const [harperSchemas, setHarperSchemas] = useState([])
    const [error, setError] = useState('')

    const getHarperSchema = useCallback(async () => {
        setLoading(true)
        setError('')
        const hdbUrl = getItem('hdbUrl')
        const hdbAuth = getItem('hdbAuth')

        const config: AxiosRequestConfig = {
            method: 'POST',
            baseURL: '/api/harper/schema',
            data: {
                hdbUrl,
                hdbAuth,
            },
        }

        return await axios(config)
            .then((res) => {
                if (res.status === 200) {
                    setHarperSchemas(res.data)
                }
            })
            .catch((err) => {
                console.log(err)
                setError(err.response.messageText)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [setHarperSchemas, setLoading, setHarperSchemas])

    return [loading, harperSchemas, error, getHarperSchema] as const
}

export default useFetchHarperDB
