import { Outlet } from "react-router-dom";
import Header from "./Header/indexHeader";
import Footer from "./Footer/indexFooter";
function Layout() {
  return (
    <>
      <Header></Header>
      <main>
        <Outlet></Outlet>
      </main>
      <Footer></Footer>
    </>
  );
}
export default Layout;
