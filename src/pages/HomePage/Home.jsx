import React from "react";
import NavBar from "./NavBar";
import Section1 from "./Section1";
import Footer from "./Footer";
// import NotificationsPage from "../NotificationsPage/Section1";

export default function Home({ darkMode, toggleDarkMode }) {
  return (
    <div className={`home-container ${darkMode ? "dark" : ""}`}>
      <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Section1 darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Footer darkMode={darkMode} />
    </div>
  );
}
