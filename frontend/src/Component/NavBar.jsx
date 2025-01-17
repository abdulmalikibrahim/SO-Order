import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
    const Location = useLocation();
    const pageNow = Location.pathname;
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">SO Ordering</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li key={"nav-rundown-order"} className="nav-item">
                            <Link className={ pageNow === "/rundownOrder" ? "nav-link active" : "nav-link" } to="/rundownOrder"><i className="fas fa-truck me-2"></i>Rundown Order</Link>
                        </li>
                        <li key={"nav-master-data"} className="nav-item">
                            <Link className={ pageNow === "/masterData" ? "nav-link active" : "nav-link" } aria-current="Master Data" to="/masterData">Master Data</Link>
                        </li>
                        <li key={"nav-working-calendar"} className="nav-item">
                            <Link className={ pageNow === "/workingCalendar" ? "nav-link active" : "nav-link" } to="/workingCalendar">Working Calendar</Link>
                        </li>
                        <li key={"nav-reference-data"} className="nav-item">
                            <Link className={ pageNow === "/referenceData" ? "nav-link active" : "nav-link" } to="/referenceData">Reference Data</Link>
                            {/* //SAFETY STOCK
                            //AVERAGE USAGE
                            //ACTUAL GI */}
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;