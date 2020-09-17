import React, { useState, useEffect } from 'react'
import { Form, Button, Col, Row } from 'react-bootstrap'
import axios, { AxiosRequestConfig } from 'axios'
import { removeItem, setItem } from '../../utils/localStoreage'

export interface MongoLoginProps {
    onConnected: any
}

const MongoLogin: React.SFC<MongoLoginProps> = ({ onConnected }) => {
    const [connectionString, setConnectionString] = useState('')
    const [checking, setChecking] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [isFirstload, setIsFirstload] = useState(true)

    const setLocalStorageVal = (con: boolean) => {
        setItem('mongoConStr', connectionString)
        setItem('mongoConnected', con ? 'true' : 'false')
    }

    const removeLocalStorageVal = () => {
        removeItem('mongoConStr')
        removeItem('mongoConnected')
    }

    const checkMongoConnection = async () => {
        if (connectionString === '') {
            let formMongoHost = document.getElementById('formMongoHost')
            formMongoHost.removeAttribute('class')
            formMongoHost.setAttribute('class', 'form-control is-invalid')
            removeLocalStorageVal()
        } else {
            setChecking(true)
            const config: AxiosRequestConfig = {
                method: 'POST',
                baseURL: '/api/mongo/check',
                data: {
                    connectionString,
                },
            }

            await axios(config)
                .then((res) => {
                    if (res.status === 200) {
                        setLocalStorageVal(true)
                        onConnected(true)
                        setIsValid(true)
                    } else {
                        removeLocalStorageVal()
                        onConnected(false)
                        setIsValid(false)
                    }
                })
                .catch((err) => {
                    removeLocalStorageVal()
                    onConnected(false)
                    setIsValid(false)
                    console.log(err)
                })
                .finally(() => {
                    setChecking(false)
                })
        }
    }

    useEffect(() => {
        if (isFirstload) {
            let formMongoHost = document.getElementById('formMongoHost')
            formMongoHost.removeAttribute('class')
            formMongoHost.setAttribute('class', 'form-control')
            setIsFirstload(false)
        } else {
            checkMongoConnection()
        }
    }, [])

    return (
        <>
            <Row>
                <Col xs={6}>
                    <h5 className="mb-0">Source: MongoDB</h5>
                </Col>
                <Col xs={6} className="text-right">
                    {isValid && (
                        <b className="text-success text-larger">&#10004;</b>
                    )}
                </Col>
            </Row>
            <hr />
            <Form>
                <Form.Group>
                    <Form.Label>connection string</Form.Label>
                    <Form.Control
                        id="formMongoHost"
                        type="text"
                        placeholder="mongodb://user:pass@mongodb.example.com/database_name"
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                        isInvalid={!isValid}
                        isValid={isValid}
                        required
                    />
                </Form.Group>
                <Button
                    variant="primary"
                    type="button"
                    onClick={checkMongoConnection}
                    disabled={!connectionString || checking}
                    block
                >
                    {checking ? 'Verifying...' : 'Verify Connection'}
                </Button>
            </Form>
        </>
    )
}

export default MongoLogin
