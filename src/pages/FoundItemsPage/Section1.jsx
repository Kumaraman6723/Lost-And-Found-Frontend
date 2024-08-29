import { useEffect, useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { deleteReport, updateReport } from "../../redux/reportSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Section1.css";
import moment from "moment-timezone";
import {
  FaGlasses,
  FaKey,
  FaBriefcase,
  FaMobileAlt,
  FaWallet,
  FaHeadphones,
  FaUmbrella,
  FaLaptop,
  FaBook,
} from "react-icons/fa";
export default function Found({ darkMode }) {
  const [search, setSearch] = useState("");
  const [selectCategory, setSelectCategory] = useState("latest");
  const [foundItems, setFoundItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editData, setEditData] = useState({});
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [proofDescription, setProofDescription] = useState("");
  const istTimestamp = moment()
    .tz("Asia/Kolkata")
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");
  const logEndpoint = "https://lost-and-found-backend-6lgc.onrender.com/api/logs/user-logs";
  const isAdmin = user && user.role === "admin";
  useEffect(() => {
    async function fetchFoundItems() {
       setIsLoading(true);
      try {
        const response = await axios.get("https://lost-and-found-backend-6lgc.onrender.com/api/reports");
        const foundItems = response.data.filter(
          (item) => item.reportType === "found"
        );
        setFoundItems(foundItems);
        setFilteredItems(foundItems);
      } catch (error) {
        console.error("Error fetching lost items:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
    fetchFoundItems();
  }, [user]);

  useEffect(() => {
    const searchTerm = search.toLowerCase();
    let filtered = foundItems.filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm)
    );

    // Category filtering
    if (
      selectCategory !== "All" &&
      selectCategory !== "latest" &&
      selectCategory !== "oldest" &&
      selectCategory !== "claimed" &&
      selectCategory !== "unclaimed"
    ) {
      filtered = filtered.filter((item) =>
        item.itemName.toLowerCase().includes(selectCategory.toLowerCase())
      );
    }

    // Sorting and additional filters
    switch (selectCategory) {
      case "latest":
        filtered = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        filtered = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "claimed":
        filtered = filtered.filter((item) => item.claimedBy);
        break;
      case "unclaimed":
        filtered = filtered.filter((item) => !item.claimedBy);
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [search, foundItems, selectCategory]);

  const handleDelete = async (id) => {
    if (!id) {
      console.error("Invalid ID provided for deletion:", id);
      return;
    }
    try {
      if (isAdmin) {
        await axios.delete(`https://lost-and-found-backend-6lgc.onrender.com/api/reports/${id}`, {
          headers: { Email: user.email },
        });
        await axios.post(
          "https://lost-and-found-backend-6lgc.onrender.com/api/logs/admin-logs",
          {
            adminId: user._id, // Assuming _id represents the admin's ObjectId
            action: `Deleted Report ${id}`,
            timestamp: new Date(), // Automatically handled by Mongoose
          },
          {
            headers: {
              Email: user.email,
            },
            withCredentials: true,
          }
        );
      } else {
        await axios.delete(`https://lost-and-found-backend-6lgc.onrender.com/api/reports/${id}`, {
          headers: { Email: user.email },
        });
        await axios.post(
          logEndpoint,
          {
            userId: user._id,
            userEmail: user.email,
            action: `User Deleted Report ${id}`,
            timestamp: istTimestamp,
          },
          {
            headers: {
              Email: user.email,
            },
            withCredentials: true,
          }
        );
      }
      dispatch(deleteReport(id));
      setFoundItems((prevItems) => prevItems.filter((item) => item._id !== id));
      setFilteredItems((prevItems) =>
        prevItems.filter((item) => item._id !== id)
      );
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setEditData({
      itemName: item.itemName,
      location: item.location,
      category: item.category,
      date: item.date,
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
        user: currentItem.user, // Ensure the user object is retained
      };
      let response;
      if (isAdmin) {
        response = await axios.put(
          `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${currentItem._id}`,
          updatedData,
          {
            headers: {
              Email: user.email,
            },
          }
        );

        await axios.post(
          "https://lost-and-found-backend-6lgc.onrender.com/api/logs/admin-logs",
          {
            adminId: user._id,
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
      } else {
        response = await axios.put(
          `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${currentItem._id}`,
          updatedData,
          {
            headers: {
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
      }
      dispatch(updateReport(response.data));
      setIsEditing(false);
      setCurrentItem(null);
      setFoundItems((prevItems) =>
        prevItems.map((item) =>
          item._id === response.data._id
            ? { ...response.data, user: item.user }
            : item
        )
      );
      setFilteredItems((prevItems) =>
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

  const handleClaim = async (item) => {
    if (user) {
      if (item.user.email === user.email) {
        toast.error("You can't claim your own item");
        return;
      }
      try {
        setIsLoading(true); // Set loading to true
        setModalItem(item); // Set the item to be claimed
        setShowModal(true); // Show the modal for proof submission
        setIsLoading(false); // Set loading to false immediately after setting state
      } catch (error) {
        console.error("Error handling claim:", error);
        toast.error(error.response?.data?.message || "Error handling claim.");
        setIsLoading(false);
      }
    } else {
      console.error("User is not logged in.");
      toast.error("You need to be logged in to claim an item.");
    }
  };
  

  // const handleClaim = async (item) => {
  //   if (user) {
  //     if (item.user.email === user.email) {
  //       toast.error("You can't claim your own item");
  //       return;
  //     }
  //     try {
  //       setIsLoading(true); // Set loading to true
  //       console.log(`Claiming item with id: ${item._id}`);
  //       let response;

  //       // Claim the item
  //       setModalItem(item);
  //       setShowModal(true);
    

  //       // Log the action depending on whether the user is an admin or not
  //       if (isAdmin) {
  //         response = await axios.post(
  //           `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${item._id}/claim`,
  //           {
  //             verificationStatus: "Not Verified", // Set default verification status
  //           },
  //           {
  //             headers: { Email: user.email },
  //           }
  //         );
  //         await axios.post(
  //           "https://lost-and-found-backend-6lgc.onrender.com/api/logs/admin-logs",
  //           {
  //             adminId: user._id, // Assuming _id represents the admin's ObjectId
  //             action: `Claimed Report ${item._id} as Admin`,
  //             timestamp: new Date(), // Automatically handled by Mongoose
  //           },
  //           {
  //             headers: {
  //               Email: user.email,
  //             },
  //             withCredentials: true,
  //           }
  //         );
  //       } else {
  //         response = await axios.post(
  //           `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${item._id}/claim`,
  //           {
  //             // verificationStatus: "Not Verified", // Set default verification status
  //           },
  //           {
  //             headers: { Email: user.email },
  //           }
  //         );
  //         await axios.post(
  //           logEndpoint,
  //           {
  //             userId: user._id,
  //             userEmail: user.email,
  //             action: `Claimed Report ${item._id}`,
  //             timestamp: istTimestamp,
  //           },
  //           {
  //             headers: {
  //               Email: user.email,
  //             },
  //             withCredentials: true,
  //           }
  //         );
  //       }

  //       console.log("Claim response:", response.data);
  //       setFoundItems(
  //         foundItems.map((i) => (i._id === item._id ? response.data : i))
  //       );
  //       setFilteredItems(
  //         filteredItems.map((i) => (i._id === item._id ? response.data : i))
  //       );

  //       setTimeout(() => {
  //         setIsLoading(false); // Set loading to false after 2-3 seconds
  //         toast.success("Item claimed successfully!"); // Show toast after loading completes
  //         setTimeout(() => {
  //           window.location.reload(); // Refresh the page
  //         }, 1000); // Adjust the time as needed
  //       }, 2000); // Adjust the time as needed
  //     } catch (error) {
  //       console.error("Error claiming item:", error);
  //       toast.error("Error claiming item.");
  //       setIsLoading(false);
  //     }
  //   } else {
  //     console.error("User is not logged in.");
  //     toast.error("You need to be logged in to claim an item.");
  //   }
  // };
  // const handleClaim = async (item) => {
  //   if (user) {
  //     if (item.user.email === user.email) {
  //       toast.error("You can't claim your own item");
  //       return;
  //     }
  //     try {
  //       setIsLoading(true); // Set loading to true
  //       console.log(`Claiming item with id: ${item._id}`);
  //       let response;
  
  //       // Set modal item and show modal if needed for proof submission
  //       setModalItem(item);
  //       setShowModal(true);
  
  //       // Claim the item
  //       response = await axios.post(
  //         `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${item._id}/claim`,
  //         {}, // No need to pass verificationStatus from the frontend
  //         {
  //           headers: { Email: user.email },
  //         }
  //       );
  
  //       // Update the state with the response data
  //       setFoundItems(
  //         foundItems.map((i) => (i._id === item._id ? response.data : i))
  //       );
  //       setFilteredItems(
  //         filteredItems.map((i) => (i._id === item._id ? response.data : i))
  //       );
  
  //       setTimeout(() => {
  //         setIsLoading(false); // Set loading to false after 2-3 seconds
  //         toast.success("Item claimed successfully!"); // Show toast after loading completes
  //         setTimeout(() => {
  //           window.location.reload(); // Refresh the page
  //         }, 1000); // Adjust the time as needed
  //       }, 2000); // Adjust the time as needed
  //     } catch (error) {
  //       console.error("Error claiming item:", error);
  //       toast.error(error.response?.data?.message || "Error claiming item.");
  //       setIsLoading(false);
  //     }
  //   } else {
  //     console.error("User is not logged in.");
  //     toast.error("You need to be logged in to claim an item.");
  //   }
  // };
  

  // const handleSubmitProof = async () => {
  //   if (!proofDescription.trim()) {
  //     toast.error("Please provide a description.");
  //     return;
  //   }
  
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.post(
  //       `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${modalItem._id}/claim`,
  //       { proofDescription },
  //       {
  //         headers: { Email: user.email },
  //       }
  //     );
  
  //     // Update the state after a successful claim
  //     setFoundItems((prevItems) =>
  //       prevItems.map((item) =>
  //         item._id === modalItem._id
  //           ? { ...item, status: "Verification Pending", claimedBy: user.email }
  //           : item
  //       )
  //     );
  
  //     setFilteredItems((prevItems) =>
  //       prevItems.map((item) =>
  //         item._id === modalItem._id
  //           ? { ...item, status: "Verification Pending", claimedBy: user.email }
  //           : item
  //       )
  //     );
  
  //     setShowModal(false);
  //     setProofDescription("");
  //     toast.success(response.data.responseMessage);
  //   } catch (error) {
  //     toast.error(error.response.data.message || "Error claiming item.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmitProof = async () => {
    if (!proofDescription.trim() || proofDescription.split(' ').length < 100) {
      toast.error("Please provide a description with at least 100 words.");
      return;
    }
  
    try {
      setIsLoading(true);
      const response = await axios.put(
        `https://lost-and-found-backend-6lgc.onrender.com/api/reports/${modalItem._id}/claim`,
        { proofDescription },
        {
          headers: { Email: user.email },
        }
      );
  
      // Update the state after a successful claim
      setFoundItems((prevItems) =>
        prevItems.map((item) =>
          item._id === modalItem._id
            ? { ...item, status: "Verification Pending", claimedBy: user.email }
            : item
        )
      );
  
      setFilteredItems((prevItems) =>
        prevItems.map((item) =>
          item._id === modalItem._id
            ? { ...item, status: "Verification Pending", claimedBy: user.email }
            : item
        )
      );
  
      setShowModal(false);
      setProofDescription("");
      toast.success(response.data.responseMessage);
    } catch (error) {
      toast.error(error.response.data.message || "Error claiming item.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div
      className={`flex flex-col items-center py-10 px-4 w-full ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Found Items List</h1>
        <h6 className="text-lg text-gray-600">
          {" "}
          Browse through found items and find your belongings
        </h6>
        <form onSubmit={(e) => e.preventDefault()} className="mt-4">
          <div className="flex items-center justify-center space-x-2">
            <input
              type="text"
              placeholder="Search Item"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search"
              className={`p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 w-80 ${
                darkMode
                  ? "bg-gray-800 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-black"
              }`}
            />
            <button
              type="submit"
              className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              <FaSearch />
            </button>
          </div>
        </form>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {[
          {
            name: "Keys",
            icon: (
              <FaKey
                className={`text-4xl mb-2 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            ),
          },
          {
            name: "Phones",
            icon: (
              <FaMobileAlt
                className={`text-4xl mb-2 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            ),
          },
          {
            name: "Wallets",
            icon: (
              <FaWallet
                className={`text-4xl mb-2 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            ),
          },
          {
            name: "EarPods",
            icon: (
              <FaHeadphones
                className={`text-4xl mb-2 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            ),
          },
          {
            name: "Books",
            icon: (
              <FaBook
                className={`text-4xl mb-2 ${
                  darkMode ? "text-white" : "text-black"
                }`}
              />
            ),
          },
        ].map((category) => (
          <div
            key={category.name}
            onClick={() => setSelectCategory(category.name)}
            className={`flex flex-col items-center p-4 rounded-md cursor-pointer transition-all duration-300 ${
              selectCategory === category.name
                ? "bg-indigo-500 text-white shadow-lg"
                : `${
                    darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
                  } hover:bg-indigo-100 hover:text-indigo-600`
            }`}
          >
            {category.icon}
            <span className="mt-2">{category.name}</span>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-center mb-8">
        <form onSubmit={(e) => e.preventDefault()}>
          <select
            className={`p-2 rounded-md ${
              darkMode
                ? "bg-gray-800 border-gray-600 text-white"
                : "bg-white border-gray-300 text-black"
            }`}
            id="sortId"
            value={selectCategory}
            onChange={(e) => setSelectCategory(e.target.value)}
          >
            <option value="All">ALL</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="claimed">Claimed</option>
            <option value="unclaimed">Unclaimed</option>
          </select>
        </form>
      </div>
      {isLoading && ( // Conditionally render the loading overlay
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
        </div>
      )}
      <div className="w-full flex flex-wrap justify-center space-y-6 px-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item._id}
              className={`flex flex-col lg:flex-row items-start p-6 rounded-lg shadow-lg w-full max-w-5xl ${
                darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
              style={{ minHeight: "280px" }}
            >
              <div className="w-full lg:w-2/5 h-64 lg:h-80 mb-4 lg:mb-0 lg:mr-8">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt="Lost item"
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
                    {item.reportID}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-semibold mb-4">
                    {item.itemName}
                  </h3>
                  <p className="text-gray-500">
                    <span className="font-semibold">Location:</span>{" "}
                    {item.location}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold">Date:</span>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(item.date))}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold">Description:</span>{" "}
                    {item.description}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-semibold">Category:</span>{" "}
                    {item.category}
                  </p>
                </div>
                <div className="mt-6 flex flex-col lg:flex-row justify-between items-start lg:items-center">
                  <div className="flex space-x-4 mb-4 lg:mb-0">
                    {user &&
                      (user.role === "admin" ||
                        item.user.email === user.email) &&
                      !item.claimedBy && (
                        <>
                          <button
                            className="p-3 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition duration-300 shadow-md"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="p-3 bg-red-500 text-white text-lg rounded-lg hover:bg-red-600 transition duration-300 shadow-md"
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                  </div>
                  {user && !item.claimedBy && (
                    <button
                      className="p-3 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition duration-300 w-full lg:w-auto shadow-md"
                      onClick={() => handleClaim(item)}
                    >
                      Claim
                    </button>
                  )}
                </div>
                {item.claimedBy && (
                  <div className="mt-4 flex flex-col lg:flex-row lg:space-x-4">
                    <span
                      className={`text-base bg-orange-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-orange-600 transition duration-300 ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Claimed by: {item.claimedBy}
                    </span>
                    {item.verificationStatus && (
                      <span
                        className={`text-base font-semibold px-4 py-2 rounded-lg shadow-sm mt-2 lg:mt-0 ${
                          item.verificationStatus === "Verified"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        } transition duration-300`}
                      >
                        Verification Status: {item.verificationStatus}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xl text-gray-500">No items found.</p>
        )}
      </div>
      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div
      className={`p-6 rounded-lg shadow-lg w-11/12 sm:w-2/3 md:w-1/2 lg:w-1/3 ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h3 className="text-2xl mb-4">Claim Item</h3>
      <p>Please provide a description of the item to prove ownership:</p>
      <textarea
        className={`w-full p-2 border rounded-lg mt-2 ${
          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-800"
        }`}
        rows="4"
        value={proofDescription}
        onChange={(e) => setProofDescription(e.target.value)}
      ></textarea>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          className="px-4 py-2 rounded-lg transition duration-300 shadow-md bg-red-500 hover:bg-red-600 text-white"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-lg transition duration-300 shadow-md bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSubmitProof}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Submit"}
        </button>
      </div>
    </div>
  </div>
)}

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-full max-w-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-2xl font-semibold mb-4">Edit Item</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  name="itemName"
                  value={editData.itemName}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editData.location}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={new Date(editData.date).toISOString().split("T")[0]}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`p-2 rounded-md w-full ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-black"
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="p-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
