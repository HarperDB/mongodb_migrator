import { useCallback, useState } from 'react'
import { getItem } from '../utils/localStoreage'
import axios, { AxiosRequestConfig } from 'axios'

const useFetchMongoDB = () => {
    const [loading, setLoading] = useState(false)
    const [mongoCollections, setMongoCollections] = useState([])
    const [error, setError] = useState('')

    const getMongoCollection = useCallback(async () => {
        setLoading(true)
        setError('')
        const mongoConStr = getItem('mongoConStr')
        const config: AxiosRequestConfig = {
            method: 'POST',
            baseURL: '/api/mongo/collection',
            data: {
                mongoConStr,
            },
        }

        return await axios(config)
            .then((res) => {
                if (res.status === 200) {
                    let filter_data = []
                    res.data.map((data) => {
                        if (
                            data.schemaName !== 'admin' &&
                            data.schemaName !== 'config'
                        ) {
                            filter_data.push(data)
                        }
                    })
                    setMongoCollections(filter_data)
                }
            })
            .catch((err) => {
                console.log(err)
                setError(err.response.messageText)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [setMongoCollections, setLoading, setMongoCollections])

    return [loading, mongoCollections, error, getMongoCollection] as const
}

export default useFetchMongoDB
