import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; // New import
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { addReport } from "../../redux/reportSlice"; // New import
import moment from "moment-timezone";

export default function ReportForm({ darkMode }) {
  const [reportType, setReportType] = useState("lost");
  const [location, setLocation] = useState("Location");
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("Category");
  const [date, setDate] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]);
  const [fileNames, setFileNames] = useState([]); // New state for file names
  const [showOtherLocation, setShowOtherLocation] = useState(false);
  const [otherLocation, setOtherLocation] = useState("");
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [otherCategory, setOtherCategory] = useState("");

  function handleLocationChange(e) {
    const selectedLocation = e.target.value;
    if (selectedLocation === "other") {
      setShowOtherLocation(true);
      setLocation(""); // Clear the location field
    } else {
      setShowOtherLocation(false);
      setLocation(selectedLocation);
    }
  }

  function handleCategoryChange(e) {
    const selectedCategory = e.target.value;
    if (selectedCategory === "other") {
      setShowOtherCategory(true);
      setCategory(""); // Clear the category field
    } else {
      setShowOtherCategory(false);
      setCategory(selectedCategory);
    }
  }

  const user = useSelector(selectUser);
  const dispatch = useDispatch(); // New
  const navigate = useNavigate(); // New

  const endpoint = "https://lost-and-found-backend-6lgc.onrender.com/api/reports";
  const signInRef = useRef(null);
  const logEndpoint = "https://lost-and-found-backend-6lgc.onrender.com/api/logs/user-logs";

  function clearForm() {
    setReportType("lost");
    setLocation("Location");
    setCategory("Category");
    setItemName("");
    setDate("");
    setDesc("");
    setImages([]);
    setFileNames([]); // Clear file names
  }

  function handleImage(e) {
    const files = Array.from(e.target.files);
    Promise.all(files.map((file) => convertToBase64(file)))
      .then((base64Images) => {
        setImages(base64Images);
        setFileNames(files.map((file) => file.name)); // Set file names
      })
      .catch((error) => console.error("Error converting images:", error));
  }

  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleReport(e) {
    e.preventDefault();

    if (!user) {
      if (signInRef.current) {
        signInRef.current.click();
      }
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image!");
      return;
    }

    const finalLocation = showOtherLocation ? otherLocation : location;
    const finalCategory = showOtherCategory ? otherCategory : category;

    const report = {
      reportType,
      location: finalLocation,
      itemName,
      category: finalCategory,
      date,
      description: desc,
      images,
    };
    const istTimestamp = moment()
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

    try {
      const response = await axios.post(endpoint, report, {
        headers: {
          Email: user.email,
        },
        withCredentials: true,
      });

      await axios.post(
        logEndpoint,
        {
          userId: user._id, // Add user ID here
          userEmail: user.email,
          action: "Created Report",
          timestamp: istTimestamp, // Use IST timestamp
        },
        {
          headers: {
            Email: user.email,
          },
          withCredentials: true,
        }
      );

      toast.success("Item reported successfully!", {
        autoClose: 2000, // 2 seconds
        onClose: () => navigate("/"), // Redirect to home page
      });
      dispatch(addReport(response.data.report));
      clearForm();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("There was an error submitting the report!");
    }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      }`}
    >
      <div
        className={`max-w-4xl w-full space-y-8 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-2xl rounded-3xl p-8`}
      >
        <ToastContainer />
        <div className="text-center">
          <h2
            className={`mt-6 text-3xl font-extrabold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Report an Item
          </h2>
          <p
            className={`mt-2 text-sm ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Please provide details about the {reportType} item
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleReport}>
          <div className="flex justify-center space-x-4 mb-8">
            {["lost", "found"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`px-6 py-2 rounded-full text-sm font-medium ${
                  reportType === type
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-200 text-gray-700"
                } transition-colors duration-200`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="itemName"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Item Name
                </label>
                <input
                  id="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows="4"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="Describe the item"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="location"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Location
                </label>
                <select
                  id="location"
                  value={location}
                  onChange={handleLocationChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="Location" disabled>
                    Select a location
                  </option>
                  {[
                    "sportRoom",
                    "cricketGround",
                    "cafe10",
                    "cafe1",
                    "cadLab",
                    "commonRoom",
                    "library",
                    "other",
                  ].map((loc) => (
                    <option key={loc} value={loc}>
                      {loc
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </option>
                  ))}
                </select>
                {showOtherLocation && (
                  <input
                    type="text"
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    className={`mt-2 block w-full px-3 py-2 border ${
                      darkMode
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter other location"
                  />
                )}
              </div>

              <div>
                <label
                  htmlFor="category"
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={handleCategoryChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-white text-gray-900"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                >
                  <option value="Category" disabled>
                    Select a category
                  </option>
                  {["electronic", "notebook", "personal", "other"].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    )
                  )}
                </select>
                {showOtherCategory && (
                  <input
                    type="text"
                    value={otherCategory}
                    onChange={(e) => setOtherCategory(e.target.value)}
                    className={`mt-2 block w-full px-3 py-2 border ${
                      darkMode
                        ? "border-gray-600 bg-gray-700 text-white"
                        : "border-gray-300 bg-white text-gray-900"
                    } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    placeholder="Enter other category"
                  />
                )}
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Upload Images
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    darkMode ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className={`mx-auto h-12 w-12 ${
                        darkMode ? "text-gray-400" : "text-gray-400"
                      }`}
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className={`relative cursor-pointer rounded-md font-medium ${
                          darkMode
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-blue-600 hover:text-blue-500"
                        } focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleImage}
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      PNG, JPG, GIF up to 10MB
                    </p>
                    <div className="mt-2">
                      {fileNames.map((fileName, index) => (
                        <p
                          key={index}
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {fileName}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
      {!user && (
        <button
          ref={signInRef}
          className="hidden"
          onClick={() => toast("Please sign in to submit a report.")}
        >
          Sign In
        </button>
      )}
    </div>
  );
}
