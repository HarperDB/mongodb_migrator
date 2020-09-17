import Head from 'next/head'
import { Navbar, Nav, Container } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { clearItem } from '../../utils/localStoreage'

const Header = () => {
    const router = useRouter()
    const handleClickExit = () => {
        clearItem()
        router.push('/')
    }

    return (
        <>
            <Head>
                <title>MongoDB to HarperDB</title>
                <link rel="icon" href="/favicon_purple.png" />
                <link
                    href="https://use.typekit.net/pau0eyr.css"
                    rel="stylesheet"
                />
            </Head>
            <Navbar
                collapseOnSelect
                bg="light"
                variant="dark"
                className="topnav"
            >
                <Container>
                    <Navbar.Brand>
                        <img
                            alt=""
                            src="/logo_circle.png"
                            width="142"
                            height="40"
                            className="d-inline-block align-top"
                        />
                    </Navbar.Brand>

                    <Navbar.Collapse>
                        <Nav className="mr-auto" />
                        <Nav>
                            {router.pathname === '/schema' ? (
                                <Nav.Link
                                    style={{ fontSize: 16 }}
                                    onClick={handleClickExit}
                                >
                                    New Connection
                                </Nav.Link>
                            ) : (
                                <h4 className="mb-0 text-white">
                                    MongoDB Migrator
                                </h4>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    )
}

export default Header
