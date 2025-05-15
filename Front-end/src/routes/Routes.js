import CourseRegistration from "../pages/CourseRegistration/CourseRegistration";
import Layout from "../layouts/Layout";
import Student from "../pages/Student";
import Course from "../pages/Course";

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
