import Header from './layouts/Header'
import ShowMongoSchema from '../components/ShowMongoSchema/ShowMongoSchema'
import ShowHarperSchema from '../components/ShowHarperSchema/ShowHarperSchema'
import { Button } from 'react-bootstrap'
import { notification } from 'antd'
import { getItem } from '../utils/localStoreage'
import { useEffect, useState, useCallback } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { ISelectHarper } from '../types/Harperdb'
import { ISelectMongo } from '../types/Mongodb'

const DOCS_PER_PAGE: number = 1000
let mongoDocsCount: number = 0
let insertedCount: number = 0
let remainingCount: number = 0

const showNotification = (
    type: 'success' | 'error',
    successMessage?,
    errorMessage?
) => {
    let message = successMessage ? 'Migration Succeeded' : 'Migration Warning'
    let description = errorMessage ? errorMessage : 'Something wrong.'

    if (type === 'success') {
        message = message
        description = !successMessage && !errorMessage ? '' : successMessage
    } else {
        message = 'Migration Error'
        description = description
    }

    notification[type]({
        message,
        description,
    })
}

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

const Schema = () => {
    const [
        mongoLoading,
        mongoSchemas,
        mongoError,
        loadMongo,
    ] = useFetchMongoDB()

    const [
        harperLoading,
        harperSchemas,
        harperError,
        loadHarper,
    ] = useFetchHarperDB()

    const [selectHarper, setSelectHarper] = useState<ISelectHarper>(null)
    const [selectMongo, setSelectMongo] = useState<ISelectMongo>(null)

    useEffect(() => {
        loadHarper()
    }, [loadHarper])

    useEffect(() => {
        loadMongo()
    }, [loadMongo])

    if (mongoError || harperError) return <div>Failed to load data</div>

    const migrating = async () => {
        const mongoConStr = getItem('mongoConStr')
        const mongoDatabase = selectMongo.database
        const mongoCollection = selectMongo.collection
        const hdbUrl = getItem('hdbUrl')
        const hdbAuth = getItem('hdbAuth')
        const harperSchema = selectHarper.schemaName
        const harperTable = selectHarper.tableName

        if (
            !mongoConStr ||
            !mongoDatabase ||
            !mongoCollection ||
            !hdbUrl ||
            !hdbAuth ||
            !harperSchema ||
            !harperTable
        ) {
            showNotification(
                'error',
                '',
                'Please select MongoDB collection and HarperDB table to migrate.'
            )
        } else {
            setSelectMongo(null)
            setSelectHarper(null)
            showNotification('success')
            const config: AxiosRequestConfig = {
                method: 'POST',
                baseURL: '/api/mongo/count',
                data: {
                    mongoConStr,
                    mongoDatabase,
                    mongoCollection,
                },
            }
            axios(config)
                .then(async (res) => {
                    if (res.status === 200) {
                        const harperHashAttribute = harperSchemas
                            .find((s) => s.schemaName === harperSchema)
                            .tables.find((t) => t.name === harperTable)
                            .hash_attribute

                        mongoDocsCount = res.data.documentCount
                        insertedCount = 0
                        remainingCount = mongoDocsCount
                        const pageCount = Math.floor(
                            mongoDocsCount / DOCS_PER_PAGE
                        )

                        for (let loop = 0; loop <= pageCount; loop++) {
                            const config: AxiosRequestConfig = {
                                method: 'POST',
                                baseURL: '/api/migrate/migration',
                                data: {
                                    mongoConStr,
                                    mongoDatabase,
                                    mongoCollection,
                                    mongoDocsCount,
                                    loop,
                                    hdbUrl,
                                    hdbAuth,
                                    harperSchema,
                                    harperTable,
                                    harperHashAttribute,
                                },
                            }
                            await axios(config)
                                .then((res) => {
                                    if (res.status === 200) {
                                        let skipped_hashes =
                                            res.data.skipped_hashes
                                        if (skipped_hashes) {
                                            if (skipped_hashes.length > 0) {
                                                loop = pageCount
                                                insertedCount = mongoDocsCount
                                                remainingCount = 0
                                                showNotification(
                                                    'success',
                                                    `inserted ${mongoDocsCount} of ${mongoDocsCount} records.`
                                                )
                                            } else {
                                                if (
                                                    remainingCount >=
                                                    DOCS_PER_PAGE
                                                ) {
                                                    insertedCount += DOCS_PER_PAGE
                                                    remainingCount =
                                                        mongoDocsCount -
                                                        insertedCount
                                                } else {
                                                    insertedCount += remainingCount
                                                    remainingCount =
                                                        mongoDocsCount -
                                                        insertedCount
                                                }
                                                showNotification(
                                                    'success',
                                                    loop === pageCount
                                                        ? 'Migration Succeeded'
                                                        : `inserted ${insertedCount} of ${mongoDocsCount} records.`
                                                )
                                            }
                                        } else {
                                            loop = pageCount
                                            showNotification(
                                                'error',
                                                '',
                                                res.data.message
                                            )
                                        }
                                    } else {
                                        showNotification(
                                            'error',
                                            '',
                                            'Web Service Error.'
                                        )
                                    }
                                })
                                .catch((err) => {
                                    console.log(err)
                                    showNotification(
                                        'error',
                                        '',
                                        'Web Service Error.'
                                    )
                                })
                        }
                    } else {
                        showNotification('error', '', 'Web Service Error.')
                    }
                })
                .catch((err) => {
                    showNotification(
                        'error',
                        '',
                        err.response.messageText
                            ? err.response.messageText
                            : 'Web Service Error.'
                    )
                })
        }
    }

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-6 col-sm-12 pt-2">
                        <div className="row">
                            <div className="col-6">
                                <h4>MongoDB</h4>
                            </div>
                            <div
                                className="col-6"
                                style={{ textAlign: 'right' }}
                            >
                                <h4>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={loadMongo}
                                    >
                                        {' '}
                                        Refresh{' '}
                                    </Button>
                                </h4>
                            </div>
                        </div>

                        {mongoLoading ? (
                            <>MongoDB Loading...</>
                        ) : (
                            <ShowMongoSchema
                                mongoSchemas={mongoSchemas}
                                onSelected={setSelectMongo}
                                currentValue={selectMongo}
                            />
                        )}
                    </div>
                    <div className="col-md-6 col-sm-12 pt-2">
                        <div className="row">
                            <div className="col-6">
                                <h4>HarperDB</h4>
                            </div>
                            <div
                                className="col-6"
                                style={{ textAlign: 'right' }}
                            >
                                <h4>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        onClick={loadHarper}
                                    >
                                        {' '}
                                        Refresh{' '}
                                    </Button>
                                </h4>
                            </div>
                        </div>

                        {harperLoading ? (
                            <>HarperDB Loading...</>
                        ) : (
                            <ShowHarperSchema
                                harperSchemas={harperSchemas}
                                onSelected={setSelectHarper}
                                currentValue={selectHarper}
                            />
                        )}
                    </div>
                    <div className="col-md-12 text-center mt-4">
                        <Button
                            onClick={migrating}
                            disabled={!selectMongo || !selectHarper}
                        >
                            {' '}
                            Migrate{' '}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Schema
