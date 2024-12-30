import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light" style={{backgroundColor: 'rgba(0,0,0,0) !important'}}>
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">SO Ordering</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li key={1} className="nav-item">
                            <Link className="nav-link active" aria-current="Master Data" to="/masterData">Master Data</Link>
                        </li>
                        <li key={2} className="nav-item">
                            <Link className="nav-link" to="/workingCalendar">Working Calendar</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;