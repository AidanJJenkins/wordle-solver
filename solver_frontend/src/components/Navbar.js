import React from 'react';
import {
  Col,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';

function NavBar(props) {
  let  { handleLogout } = props

  return (
    <div>
      <Navbar expand={true}>
        <Col md="10.5">
          <NavbarBrand href="/">Wordle Helper</NavbarBrand>
        </Col>
        <Col md="1.5">
          <Nav className="me-auto" navbar>
            <NavItem>
              <NavLink href="/components/">Settings</NavLink>
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
