import React, { useState, useEffect } from 'react'
import { Form, Button, Col, Row } from 'react-bootstrap'
import axios, { AxiosRequestConfig } from 'axios'
import { removeItem, setItem } from '../../utils/localStoreage'

export interface HarperLoginProps {
    onConnected: any
}

const HarperLogin: React.SFC<HarperLoginProps> = ({ onConnected }) => {
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
        } else if (!hdbUsername) {
            let attr = document.getElementById('formBasicUsername')
            attr.removeAttribute('class')
            attr.setAttribute('class', 'form-control is-invalid')
        } else if (!hdbPassword) {
            let attr = document.getElementById('formBasicPassword')
            attr.removeAttribute('class')
            attr.setAttribute('class', 'form-control is-invalid')
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
                    } else {
                        setIsHostValid(false)
                        setIsAuthenValid(false)
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
    }, [])

    return (
        <div>
            <Row>
                <Col xs={6}>
                    <h5 className="mb-0">Destination: HarperDB</h5>
                </Col>
                <Col xs={6} className="text-right">
                    {isAuthenValid && isHostValid && (
                        <b className="text-success text-larger">&#10004;</b>
                    )}
                </Col>
            </Row>
            <hr />
            <Form>
                <Row>
                    <Col md={4} xs={12}>
                        <Form.Group>
                            <Form.Label>url</Form.Label>
                            <Form.Control
                                id="formBasicHost"
                                type="text"
                                placeholder="https://localhost:9925"
                                value={hdbHostname}
                                onChange={(e) => setHdbHostname(e.target.value)}
                                isInvalid={!isHostValid}
                                isValid={isHostValid}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} xs={12}>
                        <Form.Group>
                            <Form.Label>username</Form.Label>
                            <Form.Control
                                id="formBasicUsername"
                                type="text"
                                placeholder="HDB_ADMIN"
                                value={hdbUsername}
                                onChange={(e) => setHdbUsername(e.target.value)}
                                isInvalid={!isAuthenValid}
                                isValid={isAuthenValid}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} xs={12}>
                        <Form.Group>
                            <Form.Label>password</Form.Label>
                            <Form.Control
                                id="formBasicPassword"
                                type="password"
                                placeholder="password"
                                value={hdbPassword}
                                onChange={(e) => setHdbPassword(e.target.value)}
                                isInvalid={!isAuthenValid}
                                isValid={isAuthenValid}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Button
                    variant="primary"
                    type="button"
                    onClick={checkHdbConnection}
                    disabled={
                        checking || !hdbHostname || !hdbUsername || !hdbPassword
                    }
                    block
                >
                    {checking ? 'Verifying...' : 'Verify Connection'}
                </Button>
            </Form>
        </div>
    )
}

export default HarperLogin
