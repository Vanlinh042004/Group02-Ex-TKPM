import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import "../../styles/style.css";
import "../../styles/Header.scss";
import { useTranslation } from "react-i18next";

function Header() {
  const { t, i18n } = useTranslation("header");
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
                {t("student")}
              </Nav.Link>
              <Nav.Link as={NavLink} to="/course" className="navbar__item">
                {t("course")}
              </Nav.Link>
              <Nav.Link
                as={NavLink}
                to="/course-registration"
                className="navbar__item"
              >
                {t("registration")}
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <div>
            <span
              className={`ml-5 navbar__language${i18n.language === "vi" ? "--active" : ""}`}
              onClick={() => i18n.changeLanguage("vi")}
            >
              VI
            </span>
            <span className="mx-2 navbar__language">|</span>
            <span
              className={`navbar__language${i18n.language === "en" ? "--active" : ""}`}
              onClick={() => i18n.changeLanguage("en")}
            >
              EN
            </span>
          </div>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
