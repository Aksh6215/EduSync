import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Dropdown, ListGroup, ProgressBar } from 'react-bootstrap';

const Navbar = () => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  let userName = '';
  let userEmail = '';
  // Try to decode token for name/email if available
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      userName = payload.name || payload.username || '';
      userEmail = payload.email || '';
    } catch (e) {
      // ignore
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <div style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.07)', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      <BootstrapNavbar expand="lg" style={{ background: 'transparent', minHeight: 64 }}>
        <Container fluid>
          <BootstrapNavbar.Brand as={Link} to="/" style={{ fontWeight: 800, fontSize: '2rem', color: '#4f46e5', letterSpacing: '-1px', display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1 60%, #a5b4fc 100%)', borderRadius: '50%', width: 36, height: 36, marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff' }}>📘</span>
            EduSync
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="navbarNav" />
          <BootstrapNavbar.Collapse id="navbarNav">
            <Nav className="ms-auto align-items-center">
              {!token && (
                <Nav.Link as={Link} to="/" className="nav-link-custom">Home</Nav.Link>
              )}
              {!isAuthPage && (
                <>
                  <Nav.Link as={Link} to="/courses" className="nav-link-custom">
                    {userRole && userRole.toLowerCase() === 'instructor' ? 'My Courses' : 'Courses'}
                  </Nav.Link>
                  <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">Dashboard</Nav.Link>
                </>
              )}
              {!token ? (
                <>
                  <Nav.Link as={Link} to="/register" className="ms-2">
                    <span className="btn btn-primary rounded-pill px-4 py-1">Register</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/login" className="ms-2">
                    <span className="btn btn-outline-primary rounded-pill px-4 py-1">Login</span>
                  </Nav.Link>
                </>
              ) : (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" id="dropdown-profile" className="rounded-pill px-4 py-1">
                    Profile
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ minWidth: '350px', whiteSpace: 'normal', wordBreak: 'break-all' }}>
                    <Dropdown.Header>Profile Info</Dropdown.Header>
                    <Dropdown.ItemText><strong>ID:</strong> {userId}</Dropdown.ItemText>
                    <Dropdown.ItemText><strong>Name:</strong> {userName}</Dropdown.ItemText>
                    <Dropdown.ItemText><strong>Email:</strong> {userEmail}</Dropdown.ItemText>
                    <Dropdown.ItemText><strong>Role:</strong> {userRole}</Dropdown.ItemText>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>
      <style>{`
        .nav-link-custom {
          color: #3730a3 !important;
          font-weight: 500;
          font-size: 1.08rem;
          margin-left: 0.5rem;
          margin-right: 0.5rem;
          transition: color 0.18s, background 0.18s, box-shadow 0.18s;
          border-radius: 8px;
          padding: 0.4rem 1.1rem;
        }
        .nav-link-custom:hover, .nav-link-custom.active {
          color: #fff !important;
          background: linear-gradient(90deg, #6366f1 60%, #a5b4fc 100%);
          box-shadow: 0 2px 8px rgba(99,102,241,0.08);
          text-decoration: none;
        }
        .navbar-nav .btn {
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Navbar; 