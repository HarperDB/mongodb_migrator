import Header from './layouts/Header'
import ShowMongoSchema from '../components/ShowMongoSchema/ShowMongoSchema'
import ShowHarperSchema from '../components/ShowHarperSchema/ShowHarperSchema'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import { notification } from 'antd'
import { getItem } from '../utils/localStoreage'
import React, { useEffect, useState } from 'react'
import axios, { AxiosRequestConfig } from 'axios'
import { ISelectHarper } from '../types/Harperdb'
import { ISelectMongo } from '../types/Mongodb'
import useFetchHarperDB from '../hooks/useFetchHarperDB'
import useFetchMongoDB from '../hooks/useFetchMongoDB'

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
        description = !successMessage && !errorMessage ? '' : successMessage
    } else {
        message = 'Migration Error'
    }

    notification[type]({
        message,
        description,
    })
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
            <Container className="mt-4">
                <Row>
                    <Col md={9} xs={12}>
                        <h4 className="mb-0">
                            Select collections to transfer, then click Migrate
                        </h4>
                        <i>
                            Choose MongoDB collection and HarperDB schema &gt;
                            table.
                        </i>
                    </Col>
                    <Col md={3} xs={12} className="text-right pt-1">
                        <Button
                            block
                            variant="primary"
                            onClick={migrating}
                            disabled={!selectMongo || !selectHarper}
                        >
                            Migrate
                        </Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col md={5} xs={12}>
                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col xs={6}>
                                        <h5 className="mb-0">
                                            Source: MongoDB
                                        </h5>
                                    </Col>
                                    <Col xs={6} className="text-right">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={loadMongo}
                                        >
                                            Refresh
                                        </Button>
                                    </Col>
                                </Row>
                                <hr />
                                {mongoLoading ? (
                                    <>MongoDB Loading...</>
                                ) : (
                                    <ShowMongoSchema
                                        mongoSchemas={mongoSchemas}
                                        onSelected={setSelectMongo}
                                        currentValue={selectMongo}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={7} xs={12}>
                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col xs={6}>
                                        <h5 className="mb-0">
                                            Destination: HarperDB
                                        </h5>
                                    </Col>
                                    <Col xs={6} className="text-right">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={loadHarper}
                                        >
                                            Refresh
                                        </Button>
                                    </Col>
                                </Row>
                                <hr />
                                {harperLoading ? (
                                    <>HarperDB Loading...</>
                                ) : (
                                    <ShowHarperSchema
                                        harperSchemas={harperSchemas}
                                        onSelected={setSelectHarper}
                                        currentValue={selectHarper}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default Schema
