import React from "react";
import { Link } from "react-router-dom";
import "./Section2.css";

// Import images
import boxImage from "../../Images/box.jpg";
import foundItemImage from "../../Images/found_items.png";
import droppingItemsImage from "../../Images/dropping_items.png";

const Section2 = ({ darkMode }) => {
  return (
    <section className={`section-container ${darkMode ? "dark" : "light"}`}>
      <div className={`box ${darkMode ? "dark-box" : "light-box"}`}>
        <Link to="/Report">
          <img src={droppingItemsImage} alt="Lost an Item" />
          <p>Lost an Item</p>
          <p>Report</p>
        </Link>
      </div>
      <div className={`box ${darkMode ? "dark-box" : "light-box"}`}>
        <Link to="/FoundItems">
          <img src={foundItemImage} alt="Found an Item" />
          <p>Found an Item</p>
          <p>Report</p>
        </Link>
      </div>
      <div className={`box ${darkMode ? "dark-box" : "light-box"}`}>
        <Link to="/FoundItems">
          <img src={boxImage} alt="Find Your Lost Item" />
          <p>Find Your Lost Item</p>
          <p>Browse</p>
        </Link>
      </div>
    </section>
  );
};

export default Section2;
