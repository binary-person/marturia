import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Header.scss';
import {tokenIsStillValid} from '../utils/utils';

const Header = () => {
  return (
    <div className="header-container">
      <header className="main-header">
        <Link className="logo" to="/"><p>Testimony Database</p></Link>
        <nav className="main-navigation">
          <ul>
            <li>
              <NavLink to="/" className="header-btn-hover" activeClassName="active">Victims</NavLink>
            </li>            
			{tokenIsStillValid() && 
			<li>
              <NavLink to="/submit" className="header-btn-hover" activeClassName="active">Submit</NavLink>
            </li>
			}			
            <li>
              <NavLink exact to="/admin" className="header-btn-hover" activeClassName="active">Admin</NavLink>
            </li>
			<li>
              <NavLink exact to="/home" className="header-btn-hover" activeClassName="active">About</NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default Header;
