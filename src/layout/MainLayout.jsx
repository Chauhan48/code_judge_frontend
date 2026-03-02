import Navbar from '../components/Navbar'

function MainLayout({ children, isDashboard }) {
    return (
        <Navbar children={children} isDashboard={isDashboard} />
    )
}

export default MainLayout