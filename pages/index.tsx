import Header from './layouts/Header'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { notification } from 'antd'
import MongoLogin from '../components/MongoLogin/MongoLogin'
import HarperLogin from '../components/HarperLogin/HarperLogin'

const showAlertNotify = (type: 'success' | 'error') => {
    let message = 'Connection Error'
    let description = 'Please check databases connection again.'

    if (type === 'success') {
        message = 'Connection Succeeded'
        description = ''
    }

    notification[type]({
        message,
        description,
    })
}

export default function Home() {
    const router = useRouter()
    const [isHarperReady, setIsHarperReady] = useState(false)
    const [isMongoReady, setIsMongoReady] = useState(false)
    const [checkConnect, setCheckConnect] = useState(false)

    const handleClickConnect = () => {
        setCheckConnect(!checkConnect)
    }

    useEffect(() => {
        if (isMongoReady && isHarperReady) {
            showAlertNotify('success')
            router.push('/schema')
        }
    }, [isMongoReady, isHarperReady])

    return (
        <>
            <Header />
            <Container className="mt-4">
                <Row>
                    <Col md={6} xs={12}>
                        <MongoLogin
                            onConnected={setIsMongoReady}
                            onChecking={checkConnect}
                        />
                    </Col>
                    <Col md={6} xs={12}>
                        <HarperLogin
                            onConnected={setIsHarperReady}
                            onChecking={checkConnect}
                        />
                    </Col>
                    <Col
                        md={12}
                        className="text-center"
                        style={{ paddingTop: 15 }}
                    >
                        <Button onClick={handleClickConnect}> Connect </Button>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
