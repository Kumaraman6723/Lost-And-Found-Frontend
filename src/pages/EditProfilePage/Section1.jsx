import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, setUser } from "../../redux/userSlice";


export default function EditProfile({ darkMode, toggleDarkMode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `https://lost-and-found-backend-6lgc.onrender.com/api/users/${user._id}`,
        formData
      );
      dispatch(setUser(res.data));
      toast.success("Profile updated successfully", {
        autoClose: 1000,
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Profile update failed", {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <ToastContainer />
      <div className="flex flex-col items-center py-10 px-4 w-full flex-grow">
        <div className="w-full max-w-xl p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label htmlFor="firstName" className="block mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`p-2 w-full rounded-md ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
            </div>
            <div className="form-group mb-4">
              <label htmlFor="lastName" className="block mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`p-2 w-full rounded-md ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
            </div>
            <div className="form-group mb-6">
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`p-2 w-full rounded-md ${
                  darkMode
                    ? "bg-gray-800 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
                disabled
              />
            </div>
            <button
              type="submit"
              className={`w-full p-2 rounded-md text-white ${
                darkMode
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
