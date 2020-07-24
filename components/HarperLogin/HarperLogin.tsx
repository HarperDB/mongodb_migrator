import React, { useState, useEffect } from 'react'
import { Form, Button } from 'react-bootstrap'
import { notification } from 'antd'
import axios, { AxiosRequestConfig } from 'axios'
import { removeItem, setItem } from '../../utils/localStoreage'

export interface HarperLoginProps {
    onConnected: any
    onChecking: any
}

const HarperLogin: React.SFC<HarperLoginProps> = ({
    onConnected,
    onChecking,
}) => {
    const showNotification = (
        type: 'success' | 'error',
        errorMessage?: string
    ) => {
        let message = 'Connection Error'
        let description = errorMessage || 'Fail connect to HarperDB'
        if (type === 'success') {
            message = 'Connection Succeeded'
            description = 'Connected to HarperDB'
        }

        notification[type]({
            message,
            description,
        })
    }

    const [hdbHostname, setHdbHostname] = useState('')
    const [hdbPassword, setHdbPassword] = useState('')
    const [hdbUsername, setHdbUsername] = useState('')
    const [checking, setChecking] = useState(false)
    const [isHostValid, setIsHostValid] = useState(false)
    const [isAuthenValid, setIsAuthenValid] = useState(false)
    const [isFirstload, setIsFirstload] = useState(true)

    const setLocalStorageVal = (con: boolean) => {
        setItem('hdbUrl', hdbHostname)
        setItem(
            'hdbAuth',
            new Buffer(`${hdbUsername}:${hdbPassword}`).toString('base64')
        )
        setItem('hdbConnected', con ? 'true' : 'false')
    }

    const removeLocalStorageVal = () => {
        removeItem('hdbUrl')
        removeItem('hdbAuth')
        removeItem('hdbConnected')
    }

    const checkHdbConnection = async () => {
        if (!hdbHostname) {
            let attr = document.getElementById('formBasicHost')
            attr.removeAttribute('class')
            attr.setAttribute('class', 'form-control is-invalid')
            showNotification('error', 'Hostname cannot be blank')
        } else if (!hdbUsername) {
            let attr = document.getElementById('formBasicUsername')
            attr.removeAttribute('class')
            attr.setAttribute('class', 'form-control is-invalid')
            showNotification('error', 'Username cannot be blank')
        } else if (!hdbPassword) {
            let attr = document.getElementById('formBasicPassword')
            attr.removeAttribute('class')
            attr.setAttribute('class', 'form-control is-invalid')
            showNotification('error', 'Password cannot be blank')
        } else {
            setChecking(true)
            const config: AxiosRequestConfig = {
                method: 'POST',
                baseURL: '/api/harper/check',
                data: {
                    hdbHostname,
                    hdbUsername,
                    hdbPassword,
                },
            }

            await axios(config)
                .then((res) => {
                    if (res.status === 200) {
                        showNotification('success')
                        setLocalStorageVal(true)
                        onConnected(true)
                        setIsHostValid(true)
                        setIsAuthenValid(true)
                    }
                })
                .catch((err) => {
                    if (err.message.includes('401')) {
                        setIsHostValid(true)
                        setIsAuthenValid(false)
                        showNotification(
                            'error',
                            'HarperDB Authentication fail, Try again.'
                        )
                    } else {
                        setIsHostValid(false)
                        setIsAuthenValid(false)
                        showNotification('error', err.message)
                    }

                    removeLocalStorageVal()
                    onConnected(false)
                })
                .finally(() => setChecking(false))
        }
    }

    useEffect(() => {
        if (isFirstload) {
            setIsFirstload(false)
            let formBasicHost = document.getElementById('formBasicHost')
            let formBasicUsername = document.getElementById('formBasicUsername')
            let formBasicPassword = document.getElementById('formBasicPassword')
            formBasicHost.removeAttribute('class')
            formBasicHost.setAttribute('class', 'form-control')
            formBasicUsername.removeAttribute('class')
            formBasicUsername.setAttribute('class', 'form-control')
            formBasicPassword.removeAttribute('class')
            formBasicPassword.setAttribute('class', 'form-control')
        } else {
            checkHdbConnection()
        }
    }, [onChecking])

    return (
        <div>
            <Form>
                <Form.Group>
                    <Form.Label>HarperDB Connection</Form.Label>
                    <Form.Control
                        id="formBasicHost"
                        type="text"
                        placeholder="Enter host"
                        value={hdbHostname}
                        onChange={(e) => setHdbHostname(e.target.value)}
                        isInvalid={!isHostValid}
                        isValid={isHostValid}
                        required
                    />
                    <Form.Text className="text-muted">
                        example: https://localhost:5000
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        id="formBasicUsername"
                        type="text"
                        placeholder="username"
                        value={hdbUsername}
                        onChange={(e) => setHdbUsername(e.target.value)}
                        isInvalid={!isAuthenValid}
                        isValid={isAuthenValid}
                        required
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        id="formBasicPassword"
                        type="password"
                        placeholder="Password"
                        value={hdbPassword}
                        onChange={(e) => setHdbPassword(e.target.value)}
                        isInvalid={!isAuthenValid}
                        isValid={isAuthenValid}
                        required
                    />
                </Form.Group>
                <Button
                    variant="secondary"
                    type="button"
                    onClick={checkHdbConnection}
                    disabled={checking}
                >
                    {checking ? 'checking...' : 'Check connection'}
                </Button>
            </Form>
        </div>
    )
}

export default HarperLogin
