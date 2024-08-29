import React from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import MainLogo from "../../Images/ncu.png";
import MainLogoDark from "../../Images/ncuDark.png";

export default function Footer({ darkMode }) {
  return (
    <footer
      className={`py-8 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="footer-container grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8 text-center md:text-left">
          <div className="footer-item flex flex-col items-center md:items-start col-span-2 lg:col-span-3">
            <img
              src={darkMode ? MainLogoDark : MainLogo}
              alt="Logo"
              className="w-32 h-auto mb-6"
            />
            <p
              className={`text-base flex items-center ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <FaMapMarkerAlt className="mr-2" /> Sector-23 A, Gurugram, Haryana
            </p>
          </div>

          <div className="footer-item flex flex-col items-center md:items-start lg:col-span-1 lg:-ml-[20vw]">
            <h5
              className={`footer-title text-xl mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Download & Projects
            </h5>
            <ul
              className={`footer-links space-y-3 text-base ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Android App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  iOS App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Desktop
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Projects
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  My Tasks
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-item flex flex-col items-center md:items-start lg:col-span-1 lg:-ml-[10vw]">
            <h5
              className={`footer-title text-xl mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Help & Documentation
            </h5>
            <ul
              className={`footer-links space-y-3 text-base ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Reporting
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Support Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-400 hover:underline">
                  Privacy
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-item flex flex-col items-center md:items-start lg:col-span-1">
            <h5
              className={`footer-title text-xl mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Follow Us
            </h5>
            <div className="footer-social flex space-x-4">
              <a
                href="#"
                className={`hover:text-gray-400 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className={`hover:text-gray-400 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className={`hover:text-gray-400 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <hr
          className={`my-8 ${darkMode ? "border-gray-600" : "border-gray-300"}`}
        />

        <div className="footer-bottom flex flex-col md:flex-row justify-center md:justify-between items-center">
          <p
            className={`text-base flex items-center mb-4 md:mb-0 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            } text-center`}
          >
            <FaEnvelope className="mr-2" /> For any queries:{" "}
            <a
              href="mailto:ncu@ncuindia.edu"
              className="hover:text-gray-300 hover:underline"
            >
              ncu@ncuindia.edu
            </a>
          </p>
          <p
            className={`text-base ${
              darkMode ? "text-gray-300" : "text-gray-700"
            } text-center`}
          >
            &copy; The NorthCap University {new Date().getFullYear()}.
            <br />
            All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
