import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import colorContext from '../context/bgColor/colorContext';
import '../css/navbar.css';

const Navbar = () => {
  let location = useLocation();
  const context = useContext(colorContext);
  const { mode, toggleMode } = context;
  let history = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('refresh');
    localStorage.removeItem('access');
    history('/');
  };

  return (
    <nav className={`navbar sticky-top navbar-expand-lg navbar-${mode} bg-${mode}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          <img src={logo} alt="logo" width="30" height="30" className="d-inline-block align-top" />
          &nbsp; Online Voter
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className={`d-flex align-items-center text-${mode === 'light' ? 'dark' : 'light'}`}>
            <i className="fa-solid fa-sun mx-2"></i>
            <div className={`form-check form-switch text-${mode === 'light' ? 'dark' : 'light'} mx-2`}>
              <input
                className="form-check-input"
                onClick={toggleMode}
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
              />
            </div>
            <i className="fa-solid fa-moon"></i>
          </div>
          &nbsp;&nbsp;
          {location.pathname === '/election' ? (
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              LogOut <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          ) : (
            ''
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
