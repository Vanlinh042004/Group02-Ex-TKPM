import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
function Footer() {
  return (
    <>
      <div className="row">
        <div className="col-md-12 text-center">
          <p>
            &copy; {new Date().getFullYear()} All rights reserved | This
            template is made with
            <i className="icon-heart" aria-hidden="true"></i> by{" "}
            <Link to="/" className="text-primary text-decoration-none">
              Dom Dom
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
export default Footer;
