import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
function Footer() {
  const { t } = useTranslation("footer");
  return (
    <>
      <div className="row">
        <div className="col-md-12 text-center">
          <p>
            &copy; {new Date().getFullYear()} {t("footer")}{" "}
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
