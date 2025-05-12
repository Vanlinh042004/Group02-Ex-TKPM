import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import "../../Style/style.css";
import "../../Style/Header.scss";
function Header() {
  return (
    <>
      <Navbar variant="light" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <i className="fas fa-university"></i> Dom Dom <br />
            <small>Group</small>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ml-auto">
              <Nav.Link as={NavLink} to="/" className="navbar__item">
                Quản lý sinh viên
              </Nav.Link>
              <Nav.Link as={NavLink} to="/course" className="navbar__item">
                Quản lý khóa học{" "}
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/course-registration"
                className="navbar__item"
              >
                Đăng ký khóa học{" "}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
