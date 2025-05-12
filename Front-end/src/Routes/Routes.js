import CourseRegistration from "../Pages/CourseRegistration/CourseRegistration";
import Layout from "../LayoutDefaut/Layout";
import Student from "../Pages/Student";
import Course from "../Pages/Course/index";

export const Routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Student />,
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
