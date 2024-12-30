import {Outlet, Link} from "react-router-dom";

function Layout() {
    return (
        <>
            <div className="nav-bar">
                <Link className="nav-link" to="/">Home</Link>
            </div>
            <main>
                <Outlet />
            </main>
        </>
    )
}

export default Layout;