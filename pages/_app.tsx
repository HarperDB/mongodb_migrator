import { AppProps } from 'next/app'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'antd/dist/antd.css'
import '../styles/style.css'

const MyApp = ({ Component, pageProps }: AppProps) => (
    <Component {...pageProps} />
)

export default MyApp
