import Head from 'next/head'
import { Navbar, Nav } from 'react-bootstrap'
import { useRouter } from 'next/router'
import { notification } from 'antd'
import { clearItem } from '../../utils/localStoreage'

const showNotification = (type: 'success' | 'error', errorMessage?) => {
    let message = 'Logout Success'
    let description = errorMessage
    notification[type]({
        message,
        description,
    })
}

const Header = () => {
    const router = useRouter()
    const handleClickExit = () => {
        clearItem()
        showNotification('success')
        router.push('/')
    }

    return (
        <>
            <Head>
                <title>MongoDB to HarperDB</title>
                <link rel="icon" href="/logo.png" />
            </Head>

            <Navbar collapseOnSelect bg="dark" variant="dark">
                <Navbar.Brand>
                    <img
                        alt=""
                        src="/logo.png"
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '}
                    MongoDB to HarperDB
                </Navbar.Brand>

                <Navbar.Collapse>
                    <Nav className="mr-auto"></Nav>
                    <Nav>
                        {router.pathname === '/schema' ? (
                            <Nav.Link
                                style={{ fontSize: 16 }}
                                onClick={handleClickExit}
                            >
                                Logout
                            </Nav.Link>
                        ) : (
                            ''
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    )
}

export default Header
