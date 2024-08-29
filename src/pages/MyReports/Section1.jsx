import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { deleteReport, updateReport } from "../../redux/reportSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaSpinner } from "react-icons/fa";
import "tailwindcss/tailwind.css";
// import "./Section1.css";
import moment from "moment-timezone";
export default function Section1({ darkMode }) {
  const user = useSelector(selectUser);
  const [listings, setListings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editData, setEditData] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [sortOrder, setSortOrder] = useState("latest"); // Default is 'latest'
  const istTimestamp = moment()
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const logEndpoint = "https://lost-and-found-backend-6lgc.onrender.com/api/logs/user-logs";
  useEffect(() => {
    if (!user) {
      console.error("User not authenticated");
      toast.error("User not authenticated");
      return;
    }

    async function fetchListings() {
      setIsLoading(true);
      try {
        console.log("Fetching listings for user:", user._id);
        const response = await axios.get(
          `https://lost-and-found-backend-6lgc.onrender.com/api/reports/user`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
              email: user.email,
            },
          }
        );

        console.log("Listings fetched successfully:", response.data);
        if (sortOrder === "latest") {
          response.data.sort(
            (a, b) => new Date(b.claimedAt) - new Date(a.claimedAt)
          );
        } else if (sortOrder === "oldest") {
          response.data.sort(
            (a, b) => new Date(a.claimedAt) - new Date(b.claimedAt)
          );
        }
        setListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("An error occurred while fetching your listings.");
      } finally {
        setIsLoading(false); // Stop loading
      }
    }

    fetchListings();
  }, [user, sortOrder]);

  const handleSortChange = (order) => {
    setSortOrder(order);
  };

  const handleDelete = async (id) => {
    try {
      console.log("Deleting listing with id:", id);
      await axios.delete(`https://lost-and-found-backend-6lgc.onrender.com/api/reports/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          email: user.email,
        },
      });
      await axios.post(
        logEndpoint,
        {
          userId: user._id,
          userEmail: user.email,
          action: `Delted Report ${id}`,
          timestamp: istTimestamp,
        },
        {
          headers: {
            Email: user.email,
          },
          withCredentials: true,
        }
      );
      setListings(listings.filter((listing) => listing._id !== id));
      dispatch(deleteReport(id));
      toast.success("Listing deleted successfully.");
      console.log("Listing deleted successfully.");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("An error occurred while deleting the listing.");
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    const formattedDate = new Date(item.date).toISOString().split("T")[0];
    setEditData({
      itemName: item.itemName,
      location: item.location,
      category: item.category,
      date: formattedDate,
      description: item.description,
      images: [],
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const readerPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises)
      .then((images) => {
        setEditData((prevData) => ({
          ...prevData,
          images,
        }));
      })
      .catch((error) => {
        console.error("Error reading images:", error);
      });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        ...editData,
        user: currentItem.user,
      };

      const response = await axios.put(
        `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${currentItem._id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            Email: user.email,
          },
        }
      );
      await axios.post(
        logEndpoint,
        {
          userId: user._id,
          userEmail: user.email,
          action: `Edited Report ${currentItem._id}`,
          timestamp: istTimestamp,
        },
        {
          headers: {
            Email: user.email,
          },
          withCredentials: true,
        }
      );
      if (response.data && response.data._id) {
        dispatch(updateReport(response.data));
      } else {
        console.error("Response data is missing _id:", response.data);
      }

      setIsEditing(false);
      setCurrentItem(null);
      setListings((prevItems) =>
        prevItems.map((item) =>
          item._id === response.data._id
            ? { ...response.data, user: item.user }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating report:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setEditData({});
  };

  return (
    <div
      className={`flex flex-col items-center py-4 px-2 md:py-10 md:px-4 w-full ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <ToastContainer />
      <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
        My Listings
      </h1>
      {listings.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => handleSortChange("latest")}
            className={`mr-2 px-4 py-2 rounded ${
              sortOrder === "latest"
                ? darkMode
                  ? "bg-blue-700 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "bg-gray-800 text-white"
                : "bg-gray-300 text-black"
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => handleSortChange("oldest")}
            className={`px-4 py-2 rounded ${
              sortOrder === "oldest"
                ? darkMode
                  ? "bg-blue-700 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "bg-gray-800 text-white"
                : "bg-gray-300 text-black"
            }`}
          >
            Oldest
          </button>
        </div>
      )}
      {isLoading && ( // Conditionally render the loading overlay
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      )}
      <div className="w-full flex flex-wrap justify-center space-y-6 px-4">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <div
              key={listing._id}
              className={`flex flex-col lg:flex-row items-start p-6 rounded-lg shadow-lg w-full max-w-5xl ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              style={{ minHeight: "280px" }}
            >
              <div className="w-full lg:w-2/5 h-64 lg:h-80 mb-4 lg:mb-0 lg:mr-8">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.itemName}
                    className="w-full h-full object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 rounded-lg">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-grow w-full lg:w-3/5 flex flex-col justify-between">
                <div>
                  <p className="text-gray-500">
                    <span className="font-semibold">Report ID:</span>{" "}
                    {listing.reportID}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-semibold mb-4">
                    {listing.itemName}
                  </h3>
                  <p className="text-gray-500">
                    <span className="font-semibold">Location:</span>{" "}
                    {listing.location}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(listing.date))}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold">Description:</span>{" "}
                    {listing.description}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold">Category:</span>{" "}
                    {listing.category}
                  </p>
                </div>
                <div className="mt-6 flex flex-col lg:flex-row justify-between items-start lg:items-center">
                  <div className="flex space-x-4 mb-4 lg:mb-0">
                    {!listing.claimedBy && (
                      <>
                        <button
                          className="p-3 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
                          onClick={() => handleEdit(listing)}
                        >
                          Edit
                        </button>
                        <button
                          className="p-3 bg-red-500 text-white text-lg rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
                          onClick={() => handleDelete(listing._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {listing.claimedBy && (
                  <div className="mt-4 flex flex-col lg:flex-row lg:space-x-4">
                    <span
                      className={`text-base bg-orange-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-orange-600 transition duration-300 ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Claimed by: {listing.claimedBy}
                    </span>
                    {listing.verificationStatus && (
                      <span
                        className={`text-base font-semibold px-4 py-2 rounded-lg shadow-sm mt-2 lg:mt-0 ${
                          listing.verificationStatus === "Verified"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        } transition duration-300`}
                      >
                        Verification Status: {listing.verificationStatus}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xl text-gray-500">No listings found.</p>
        )}
      </div>

      {isEditing && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 ${
            darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
          }`}
        >
          <div
            className={`p-6 md:p-8 rounded-lg shadow-lg w-full max-w-full md:max-w-4xl ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4">Edit Listing</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="itemName"
                >
                  Item Name
                </label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={editData.itemName || ""}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="location"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={editData.location || ""}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="category"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={editData.category || ""}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="date"
                >
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={editData.date || ""}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editData.description || ""}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="images"
                >
                  Images
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md ${
                    darkMode
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
