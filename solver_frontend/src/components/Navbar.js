import React from 'react';
import axios from 'axios'
import {
  Col,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { useNavigate } from "react-router-dom"

function NavBar() {
  const navigate = useNavigate()
  let token = localStorage.getItem('token')

  const goSettings = () => {
    navigate('/settings')
  }

  const goHome = () => {
    navigate('/solver')
  }

  const handleLogout = () => {
    axios.post('http://localhost:8000/api/users/revoke_token', { token: token })
      .then((res) => {
        localStorage.removeItem('token');
        navigate('/login')
        console.log(res.status)
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <div>
      <Navbar expand={true}>
        <Col md="10.5">
          <NavbarBrand onClick={goHome} style={{cursor: 'pointer'}}>Wordle Helper</NavbarBrand>
        </Col>
        <Col md="1.5">
          <Nav className="me-auto" navbar>
            <NavItem>
              <NavLink style={{cursor: 'pointer'}} onClick={goSettings}>Settings</NavLink>
            </NavItem>
            <NavItem>
              <NavLink style={{ cursor: 'pointer' }} onClick={handleLogout}>
                Logout
              </NavLink>
            </NavItem>
          </Nav>
        </Col>
      </Navbar>
    </div>
  );
}

export default NavBar;
