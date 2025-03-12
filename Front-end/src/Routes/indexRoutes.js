import { Routes } from "./Routes";
import { useRoutes } from "react-router-dom";
function AllRoutes() {
  const routes = useRoutes(Routes);
  return <>{routes}</>;
}
export default AllRoutes;
