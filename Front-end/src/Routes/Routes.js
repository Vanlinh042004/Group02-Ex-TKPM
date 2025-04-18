import CourseRegistration from "../Pages/CourseRegistration/CourseRegistration";
import Layout from "../LayoutDefaut/Layout";
import Home from "../Pages/Home/indexHome";
import Course from "../Pages/Course/index";

export const Routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "course-registration",
        element: <CourseRegistration />,
      },
      {
        path: "course",
        element: <Course />,
      },
    ],
  },
];
