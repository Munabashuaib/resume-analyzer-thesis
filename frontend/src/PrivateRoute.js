import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ element: Element, allowedRoles = [] }) {
  const isLoggedIn = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("role");

  if (!isLoggedIn) return <Navigate to="/login" />;

  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />; // or redirect to a 403 page
  }

  return <Element />;
}

export default PrivateRoute;


// import React from "react";
// import { Navigate } from "react-router-dom";

// function PrivateRoute({ element: Component, allowedRoles }) {
//   const isLoggedIn = localStorage.getItem("user_id");
//   const role = localStorage.getItem("role");

//   if (!isLoggedIn) {
//     return <Navigate to="/login" />;
//   }

//   if (allowedRoles && !allowedRoles.includes(role)) {
//     return <Navigate to="/" />;
//   }

//   return <Component />;
// }

// export default PrivateRoute;



// import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import api from "./api";

// const PrivateRoute = ({ element: Element }) => {
//   const [isAuth, setIsAuth] = useState(null);

//   useEffect(() => {
//     api.get("/auth/status")
//       .then(() => setIsAuth(true))
//       .catch(() => setIsAuth(false));
//   }, []);

//   if (isAuth === null) return <p>Loading...</p>;
//   return isAuth ? <Element /> : <Navigate to="/login" />;
// };

// export default PrivateRoute;
