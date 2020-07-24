import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { notification } from 'antd'
import axios, { AxiosRequestConfig } from 'axios'
import { removeItem, setItem } from '../../utils/localStoreage'

export interface MongoLoginProps {
    onConnected: any
    onChecking: any
}

const MongoLogin: React.SFC<MongoLoginProps> = ({
    onConnected,
    onChecking,
}) => {
    const showNotification = (type: 'success' | 'error', errorMessage?) => {
        let message = 'Connection Error'
        let description = errorMessage
            ? errorMessage
            : 'Cannot connect to MongoDB'
        if (type === 'success') {
            message = 'Connection Succeeded'
            description = 'Can connect to MongoDB'
        }

        notification[type]({
            message,
            description,
        })
    }

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
            showNotification('error', 'Connection string cannot be blank')
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
                        showNotification('success')
                        setLocalStorageVal(true)
                        onConnected(true)
                        setIsValid(true)
                    } else {
                        showNotification('error', 'Invalid credentials')
                        removeLocalStorageVal()
                        onConnected(false)
                        setIsValid(false)
                    }
                })
                .catch((err) => {
                    showNotification('error', 'Invalid credentials')
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
    }, [onChecking])

    return (
        <div>
            <Form>
                <Form.Group>
                    <Form.Label>Mongo Connection String</Form.Label>
                    <Form.Control
                        id="formMongoHost"
                        type="text"
                        placeholder="Enter host"
                        value={connectionString}
                        onChange={(e) => setConnectionString(e.target.value)}
                        isInvalid={!isValid}
                        isValid={isValid}
                        required
                    />
                    <Form.Text className="text-muted">
                        Example mongodb://mongodb.example.com
                    </Form.Text>
                    <Form.Text className="text-muted">
                        Or mongodb://mongodb.example.com/database_name
                    </Form.Text>
                    <Form.Text className="text-muted">
                        Or
                        mongodb+srv://user:pass@mongodb.example.com/database_name
                    </Form.Text>
                </Form.Group>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={checkMongoConnection}
                    disabled={checking}
                >
                    {checking ? 'Checking...' : 'Check connection'}
                </Button>
            </Form>
        </div>
    )
}

export default MongoLogin
