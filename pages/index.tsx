import Header from './layouts/Header'
import { Container, Row, Col, Button, Card } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { useState } from 'react'
import MongoLogin from '../components/MongoLogin/MongoLogin'
import HarperLogin from '../components/HarperLogin/HarperLogin'

export default function Home() {
    const router = useRouter()
    const [isHarperReady, setIsHarperReady] = useState(false)
    const [isMongoReady, setIsMongoReady] = useState(false)

    const handleClickConnect = () => {
        if (isMongoReady && isHarperReady) {
            router.push('/schema')
        }
    }

    return (
        <>
            <Header />
            <Container className="mt-4">
                <Row>
                    <Col md={9} xs={12}>
                        <h4 className="mb-0">
                            Configure connections, then click Connect
                        </h4>
                        <i>
                            Your credentials are never stored, and only used to
                            perform the migration.
                        </i>
                    </Col>
                    <Col md={3} xs={12} className="text-right pt-1">
                        <Button
                            block
                            variant="primary"
                            disabled={!isMongoReady || !isHarperReady}
                            onClick={handleClickConnect}
                        >
                            Connect
                        </Button>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col md={5} xs={12}>
                        <Card>
                            <Card.Body>
                                <MongoLogin onConnected={setIsMongoReady} />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={7} xs={12}>
                        <Card>
                            <Card.Body>
                                <HarperLogin onConnected={setIsHarperReady} />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
