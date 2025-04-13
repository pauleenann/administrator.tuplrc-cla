import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from 'axios';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);  // Loading state to handle async behavior

  useEffect(() => {
    // Fetch user role from the server via cookies (JWT stored in HttpOnly cookie)
    const fetchUserRole = async () => {
      try {
        // Request server to verify the JWT token
        const response = await axios.get('http://localhost:3001/api/user/check-session', { withCredentials: true });

        // If session is valid, set the role
        if (response.data.loggedIn) {
          setUserRole(response.data.userRole);
        } else {
          setUserRole(null); // If not logged in, clear the role
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        setUserRole(null); // Set null if there's an error
      } finally {
        setLoading(false);  // Stop loading once the request completes
      }
    };

    fetchUserRole();
  }, []);

  if (loading) {
    // Optionally, you can show a loading spinner or placeholder while checking login status
    return <div></div>;
  }

  if (!userRole) {
    // If no role is found, redirect to the login page
    return <Navigate to="/" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // If user is not authorized based on roles, redirect to an unauthorized page
    return <Navigate to="/" />;
  }

  // If user is authenticated and authorized, render the children (protected content)
  return children;
};

export default ProtectedRoute;
