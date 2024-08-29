import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../../redux/userSlice";
import mainLogo from "../../Images/ncu.png";
import darkLogo from "../../Images/ncuDark.png";
import { FaSun, FaMoon, FaBell } from "react-icons/fa";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import "./Navbar.css";

export default function NavBar({ darkMode, toggleDarkMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("user");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getUserInitials = (user) => {
    if (user && user.firstName) {
      return user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : `${user.firstName[0]}`;
    }
    return "";
  };
  

  const handleLogout = async () => {
    try {
      const loggedOutUser = JSON.parse(localStorage.getItem("user"));

      if (loggedOutUser) {
        await axios.post(
          "https://lost-and-found-backend-6lgc.onrender.com/api/logs/admin-logs",
          {
            adminId: loggedOutUser._id,
            action: `User Logged Out (${loggedOutUser.email})`,
            timestamp: new Date(),
          },
          {
            headers: {
              Email: loggedOutUser.email,
            },
            withCredentials: true,
          }
        );
      }

      dispatch(setUser(null));
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");

      toast.success("Logged out successfully", {
        autoClose: 2000,
        onClose: () => navigate("/"),
      });
    } catch (error) {
      console.error("Error during logout", error);
      toast.error("Logout failed", {
        autoClose: 2000,
      });
    }
  };

  const handleLoginSuccess = async (response) => {
    try {
      const { credential } = response;
      const res = await axios.post("https://lost-and-found-backend-6lgc.onrender.com/api/auth/login", {
        token: credential,
        role,
      });
      const loggedInUser = res.data.user;
      dispatch(setUser(res.data.user));

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("isLoggedIn", true);

      setRole(res.data.user.role);
      await axios.post(
        "https://lost-and-found-backend-6lgc.onrender.com/api/logs/admin-logs",
        {
          adminId: loggedInUser._id,
          action: `User Logged In (${loggedInUser.email})`,
          timestamp: new Date(),
        },
        {
          headers: {
            Email: loggedInUser.email,
          },
          withCredentials: true,
        }
      );

      toast.success("Logged in successfully", {
        autoClose: 1000,
        onClose: () => navigate("/home"),
      });
    } catch (error) {
      console.error("Error during login", error);
      toast.error("Login failed", {
        autoClose: 2000,
      });
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Google login failed", error);
    toast.error("Login failed", {
      autoClose: 2000,
    });
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      dispatch(setUser(savedUser));
      setRole(savedUser.role);
    }
  }, [dispatch]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        const response = await axios.get("https://lost-and-found-backend-6lgc.onrender.com/api/reports", {
          headers: {
            Authorization: `Bearer ${user.token}`,
            email: user.email,
          },
        });

        let userNotifications;
        if (user.role === "admin") {
          userNotifications = response.data.filter(
            (notification) => notification.claimedBy
          );
        } else {
          userNotifications = response.data.filter(
            (report) =>
              (report.reportType === "lost" &&
                report.user.email === user.email &&
                report.claimedBy) ||
              (report.reportType === "found" && report.claimedBy === user.email)
          );
        }

        userNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setNotifications(userNotifications);

        const unreadCount = userNotifications.filter(
          (notification) => !notification.read
        ).length;
        setUnreadCount(unreadCount);

        const markAsReadPromises = userNotifications.map((notification) => {
          if (!notification.read) {
            return axios.put(
              `https://lost-and-found-backend-6lgc.onrender.com/api/reports/notification/${notification._id}/read`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  email: user.email,
                },
              }
            );
          }
          return null;
        });

        await Promise.all(markAsReadPromises);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleBellClick = () => {
    navigate("/notifications");
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <GoogleOAuthProvider clientId="860312032073-8mfimrab6r5t9e09hj8ibl0n498tmf9g.apps.googleusercontent.com">
        <nav
          className={`py-2 px-4 shadow ${
            darkMode
              ? "bg-gray-800 text-white border-b border-gray-700"
              : "bg-white text-black border-b border-gray-300"
          }`}
        >
          <div className="container mx-auto navbar-container">
            <div className="navbar-top">
              <div className="navbar-logo">
                <NavLink to="/">
                  <img
                    src={darkMode ? darkLogo : mainLogo}
                    alt="logo"
                    className="w-24 h-auto mx-auto"
                  />
                </NavLink>
              </div>
              <button className="mobile-menu-button" onClick={toggleSidebar}>
                ☰
              </button>
            </div>

            <div className="navbar-links desktop-links">
              <NavLink
                to="/"
                className={`nav-link ${darkMode ? "text-white" : "text-black"}`}
              >
                HOME
              </NavLink>
              <NavLink
                to="/LostItems"
                className={`nav-link ${darkMode ? "text-white" : "text-black"}`}
              >
                LOST ITEMS
              </NavLink>
              <NavLink
                to="/FoundItems"
                className={`nav-link ${darkMode ? "text-white" : "text-black"}`}
              >
                FOUND ITEMS
              </NavLink>
              <NavLink
                to="/Report"
                className={`nav-link ${darkMode ? "text-white" : "text-black"}`}
              >
                REPORT
              </NavLink>
              {user && role === "user" && (
                <NavLink
                  to="/Contactus"
                  className={`nav-link ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  CONTACT US
                </NavLink>
              )}
              {user && role === "admin" && (
                <NavLink
                  to="/VerificationPage"
                  className={`nav-link ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  VERIFICATION
                </NavLink>
              )}
            </div>

            <div className="navbar-icons desktop-icons bgTest">
              <div className="relative">
                <FaBell
                  className={`text-2xl ${
                    darkMode ? "text-white" : "text-black"
                  } cursor-pointer`}
                  onClick={handleBellClick}
                />
                {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {unreadCount}
                  </div>
                )}
              </div>
              <button
                onClick={toggleDarkMode}
                className={`text-2xl focus:outline-none ml-4 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              {user ? (
                <div className="relative navbar-user">
                            <div
  className="flex items-center space-x-2 cursor-pointer user-box"
  onClick={() => setDropdownOpen(!dropdownOpen)}
>
  <div className="user-initials bg-black">{getUserInitials(user)}</div>
  <span
    className={`text-lg ${
      darkMode ? "text-black" : "text-black"
    }`}
  >
    <b>{user.firstName} {user.lastName ? user.lastName : ''}
    </b>
  </span>
</div>
                  {dropdownOpen && (
                    <div
                      className={`dropdown-menu ${
                        darkMode ? "bg-gray-700" : "bg-white"
                      }`}
                    >
                      <NavLink
                        to="/EditProfile"
                        className={`block px-4 py-2 ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                      >
                        Edit Profile
                      </NavLink>
                      {role !== "admin" && (
                        <NavLink
                          to="/MyListings"
                          className={`block px-4 py-2 ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                          }`}
                        >
                          My Reports
                        </NavLink>
                      )}

                      {role === "admin" ? (
                        <>
                          <NavLink
                            to="/AdminLogs"
                            className={`block px-4 py-2 ${
                              darkMode
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            Admin Logs
                          </NavLink>
                          <NavLink
                            to="/AllUsersLogs"
                            className={`block px-4 py-2 ${
                              darkMode
                                ? "hover:bg-gray-600"
                                : "hover:bg-gray-200"
                            }`}
                          >
                            All Users Logs
                          </NavLink>
                        </>
                      ) : (
                        <NavLink
                          to="/UserLogs"
                          className={`block px-4 py-2 ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                          }`}
                        >
                          User Logs
                        </NavLink>
                      )}

                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 ${
                          darkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"
                        }`}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className={`p-2 border ${
                      darkMode
                        ? "bg-gray-700 text-white border-gray-600"
                        : "bg-white text-black border-gray-300"
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginFailure}
                    className="google-login-button"
                    width={100}
                  />
                </div>
              )}
            </div>
          </div>
        </nav>
<div
  className={`sidebar ${isSidebarOpen ? "open" : ""} ${
    darkMode
      ? "bg-gray-800 text-white border-r border-gray-700"
      : "bg-white text-black border-r border-gray-300"
  }`}
>
  <div className="sidebar-content p-4">
    <button
      className={`close-sidebar text-lg ${
        darkMode ? "text-white hover:text-gray-400" : "text-black hover:text-gray-600"
      } transition duration-200 ease-in-out`}
      onClick={toggleSidebar}
    >
      ✖
    </button>
    <h1
      className={`py-4 text-2xl font-semibold ${
        darkMode ? "text-white border-b border-gray-700" : "text-black border-b border-gray-300"
      }`}
    >
      MENU
    </h1>

    <NavLink
      to="/"
      className={`nav-link block py-3 px-4 mt-4 rounded-md transition-colors duration-300 ease-in-out  ${
        darkMode
          ? "text-white border-gray-700 hover:bg-gray-700 hover:text-gray-300"
          : "text-black border-gray-300 hover:bg-gray-200 hover:text-gray-800"
      }`}
    >
      HOME
    </NavLink>
    <NavLink
      to="/LostItems"
      className={`nav-link block py-3 px-4 mt-2 rounded-md transition-colors duration-300 ease-in-out border-t ${
        darkMode
          ? "text-white border-gray-700 hover:bg-gray-700 hover:text-gray-300"
          : "text-black border-gray-300 hover:bg-gray-200 hover:text-gray-800"
      }`}
    >
      LOST ITEMS
    </NavLink>
    <NavLink
      to="/FoundItems"
      className={`nav-link block py-3 px-4 mt-2 rounded-md transition-colors duration-300 ease-in-out border-t ${
        darkMode
          ? "text-white border-gray-700 hover:bg-gray-700 hover:text-gray-300"
          : "text-black border-gray-300 hover:bg-gray-200 hover:text-gray-800"
      }`}
    >
      FOUND ITEMS
    </NavLink>
    <NavLink
      to="/Report"
      className={`nav-link block py-3 px-4 mt-2 rounded-md transition-colors duration-300 ease-in-out border-t ${
        darkMode
          ? "text-white border-gray-700 hover:bg-gray-700 hover:text-gray-300"
          : "text-black border-gray-300 hover:bg-gray-200 hover:text-gray-800"
      }`}
    >
      REPORT
    </NavLink>
    {user && role === "admin" && (
      <NavLink
        to="/VerificationPage"
        className={`nav-link block py-3 px-4 mt-2 rounded-md transition-colors duration-300 ease-in-out border-t ${
          darkMode
            ? "text-white border-gray-700 hover:bg-gray-700 hover:text-gray-300"
            : "text-black border-gray-300 hover:bg-gray-200 hover:text-gray-800"
        }`}
      >
        VERIFICATION
      </NavLink>
    )}
    {user && role === "user" && (
      <NavLink
        to="/Contactus"
        className={`nav-link block py-3 px-4 mt-2 rounded-md transition-colors duration-300 ease-in-out border-t ${
          darkMode
            ? "text-white border-gray-700 hover:bg-gray-700 hover:text-gray-300"
            : "text-black border-gray-300 hover:bg-gray-200 hover:text-gray-800"
        }`}
      >
        CONTACT US
      </NavLink>
    )}
  </div>
</div>
      </GoogleOAuthProvider>
    </>
  );
}