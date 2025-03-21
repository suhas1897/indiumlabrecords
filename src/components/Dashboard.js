
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import "./ChemicalPage.css";
import Footer from "./Footer";
import { FaSignOutAlt } from 'react-icons/fa';

function ChemicalPage() {
  const [role, setRole] = useState(null);
  const [chemicalData, setChemicalData] = useState([]);
  const [userUsageData, setUserUsageData] = useState([]);
  const [userName, setUserName] = useState("");
  const [selectedChemical, setSelectedChemical] = useState("");
  const [selectedChemicalDetails, setSelectedChemicalDetails] = useState(null);
  const [requestedGrams, setRequestedGrams] = useState("");
  const [scrapRequestChemicalId, setScrapRequestChemicalId] = useState("");
  const [newChemicalRequestName, setNewChemicalRequestName] = useState("");
  const [newChemical, setNewChemical] = useState({
    chemicalName: "",
    chemicalType: "",
    type: "",
    gramsAvailable: "",
    make: "",
    dateOfMFG: "",
    dateOfExp: "",
    purchase: "",
    purchaseDate: "",
    invoiceNumber: "",
    isAbsolute: false,
    isApproximately: false,
    rack: ""
  });
  const [editChemical, setEditChemical] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [scrapChemicals, setScrapChemicals] = useState([]);
  const [newChemicalRequests, setNewChemicalRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 5;
  const navigate = useNavigate();
  const API_URL = 'https://labrecordsbackend.onrender.com';
  const rackOptions = [
    "ALKALI METALS", "ALKALI EARTH METALS", "POST TRANSITION METALS",
    "TRANSITION METALS", "OTHERS", "ACIDS", "OTHER SOLUTIONS", "REFRIGERATOR"
  ];

  const customLabels = {
    chemicalName: "Name of Chemical",
    chemicalType: "Type of Chemical",
    type: "Reagent Category",
    gramsAvailable: "Available Quantity (g)",
    make: "Make",
    dateOfMFG: "Manufacturing Date",
    dateOfExp: "Expiration Date",
    purchase: "Purchase Quantity",
    purchaseDate: "Date of Purchase",
    invoiceNumber: "Invoice #",
    rack: "Storage Rack"
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "Please log in to continue.",
      }).then(() => navigate("/login"));
      return;
    }

    const fetchData = async () => {
      try {
        const roleRes = await axios.get(`${API_URL}/userRole`, { headers: { Authorization: `Bearer ${token}` } });
        setRole(roleRes.data.role || "user");

        const promises = [
          axios.get(`${API_URL}/getchemicals`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/getUserDetails`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/getUserChemicals`, { headers: { Authorization: `Bearer ${token}` } }),
        ];

        if (roleRes.data.role === "admin") {
          promises.push(
            axios.get(`${API_URL}/getScrapChemicals`, { headers: { Authorization: `Bearer ${token}` } })
          );
        }

        const [chemicalsRes, userDetailsRes, userChemicalsRes, ...adminResponses] = await Promise.all(promises);

        setChemicalData(chemicalsRes.data || []);
        setUserName(userDetailsRes.data.userName || "Unknown User");
        setUserUsageData(userChemicalsRes.data || []);

        if (roleRes.data.role === "admin") {
          setScrapChemicals(Array.isArray(adminResponses[0]?.data) ? adminResponses[0].data : []);
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.message || "Error fetching data!",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>;

  const filteredChemicalData = chemicalData.filter((chem) =>
    chem.chemicalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChemicalChange = (e) => {
    const chemicalId = e.target.value;
    setSelectedChemical(chemicalId);
    const chemical = chemicalData.find((chem) => chem.chemicalId === chemicalId);
    setSelectedChemicalDetails(chemical || null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : name === "chemicalName" ? value.toUpperCase() : value;

    if (type === "checkbox") {
      if (name === "isAbsolute" && checked) {
        setNewChemical((prev) => ({ ...prev, isApproximately: false, [name]: finalValue }));
      } else if (name === "isApproximately" && checked) {
        setNewChemical((prev) => ({ ...prev, isAbsolute: false, [name]: finalValue }));
      } else {
        setNewChemical((prev) => ({ ...prev, [name]: finalValue }));
      }
    } else {
      setNewChemical((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : name === "chemicalName" ? value.toUpperCase() : value;

    if (type === "number") {
      finalValue = parseFloat(value) || "";
    }

    if (type === "checkbox") {
      if (name === "isAbsolute" && checked) {
        setEditChemical((prev) => ({ ...prev, isApproximately: false, [name]: finalValue }));
      } else if (name === "isApproximately" && checked) {
        setEditChemical((prev) => ({ ...prev, isAbsolute: false, [name]: finalValue }));
      } else {
        setEditChemical((prev) => ({ ...prev, [name]: finalValue }));
      }
    } else {
      setEditChemical((prev) => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(`${API_URL}/addChemical`, newChemical, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Chemical added successfully! Chemical ID: ${response.data.chemicalId}`,
      });
      const chemicalsRes = await axios.get(`${API_URL}/getchemicals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChemicalData(chemicalsRes.data || []);
      setNewChemical({
        chemicalName: "", chemicalType: "", type: "", gramsAvailable: "", make: "",
        dateOfMFG: "", dateOfExp: "", purchase: "", purchaseDate: "", invoiceNumber: "",
        isAbsolute: false, isApproximately: false, rack: ""
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Server error",
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const payload = {
      chemicalName: editChemical.chemicalName,
      gramsAvailable: parseFloat(editChemical.gramsAvailable) || 0,
      dateOfMFG: editChemical.dateOfMFG,
      dateOfExp: editChemical.dateOfExp,
      purchase: editChemical.purchase ? parseFloat(editChemical.purchase) : undefined,
      purchaseDate: editChemical.purchaseDate,
      invoiceNumber: editChemical.invoiceNumber,
      isAbsolute: editChemical.isAbsolute,
      isApproximately: editChemical.isApproximately,
      rack: editChemical.rack
    };

    try {
      const response = await axios.put(
        `${API_URL}/updateChemical/${encodeURIComponent(editChemical.chemicalId)}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: response.data.message,
      });
      setChemicalData((prev) =>
        prev.map((chem) =>
          chem.chemicalId === editChemical.chemicalId ? response.data.chemical : chem
        )
      );
      setEditChemical(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Server error",
      });
    }
  };

  const startEdit = (chem) => {
    setEditChemical({
      ...chem,
      dateOfMFG: new Date(chem.dateOfMFG).toISOString().split("T")[0],
      dateOfExp: new Date(chem.dateOfExp).toISOString().split("T")[0],
      purchaseDate: chem.purchaseDate ? new Date(chem.purchaseDate).toISOString().split("T")[0] : "",
    });
  };

  const handleDelete = async (chemicalId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.delete(`${API_URL}/deleteChemical/${encodeURIComponent(chemicalId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: response.data.message,
          confirmButtonColor: "#3085d6",
        });
        setChemicalData(chemicalData.filter((chem) => chem.chemicalId !== chemicalId));
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Server error",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const handleRequestChemical = async () => {
    if (!selectedChemical || !requestedGrams) {
      Swal.fire({
        icon: "warning",
        title: "Missing Input",
        text: "Please select a chemical and enter grams.",
      });
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${API_URL}/requestChemical`,
        { chemicalId: selectedChemical, requestedGrams: parseFloat(requestedGrams) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data.message,
      });
      setChemicalData((prev) =>
        prev.map((chem) =>
          chem.chemicalId === selectedChemical
            ? { ...chem, gramsAvailable: response.data.updatedStock }
            : chem
        )
      );
      const userChemicalsRes = await axios.get(`${API_URL}/getUserChemicals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserUsageData(userChemicalsRes.data);
      setRequestedGrams("");
      setSelectedChemical("");
      setSelectedChemicalDetails(null);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Server error",
      });
    }
  };

  const downloadExcel = (type) => {
    if (role !== "admin") return;

    let data, filename;
    switch (type) {
      case "usage":
        data = userUsageData;
        filename = "chemical_usage.xlsx";
        break;
      case "scrap":
        data = scrapChemicals;
        filename = "scrap_chemicals.xlsx";
        break;
      case "new":
        data = newChemicalRequests;
        filename = "new_chemical_requests.xlsx";
        break;
      default:
        data = chemicalData;
        filename = "all_chemicals.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="form-container" style={{ position: "relative", padding: "20px" }}>
      <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", alignItems: "center", gap: "15px" }}>
        <h2 style={{ margin: 0, color: "#fff" }}>Welcome, {userName}!</h2>
        <FaSignOutAlt
          onClick={() => navigate("/login")}
          style={{ fontSize: "24px", color: "#d33", cursor: "pointer" }}
          title="Logout"
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '40px' }}>
        <img
          src='https://res.cloudinary.com/dcggiwav8/image/upload/v1742464649/Alchemira/i8fvli3uwr7017odgbss.png'
          alt="Logo"
          style={{ width: '150px', marginBottom: '20px' }}
        />
        <h1>CIMS - Chemical Inventory Management System</h1>
      </div>

      {role === "admin" && (
        <>
          <div style={{ marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 45%", minWidth: "200px" }}>
              <button onClick={() => downloadExcel("all")} style={{ width: "100%", marginBottom: "10px", padding: "8px 16px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Download All Chemicals
              </button>
              <button onClick={() => downloadExcel("usage")} style={{ width: "100%", padding: "8px 16px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Download Usage Data
              </button>
            </div>
            <div style={{ flex: "1 1 45%", minWidth: "200px" }}>
              <button onClick={() => downloadExcel("scrap")} style={{ width: "100%", marginBottom: "10px", padding: "8px 16px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Download Scrap Chemicals
              </button>
              <button onClick={() => downloadExcel("new")} style={{ width: "100%", padding: "8px 16px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                Download New Requests
              </button>
            </div>
          </div>

          <h2>Add New Chemical</h2>
          <form onSubmit={handleSubmit}>
            {Object.keys(newChemical)
              .filter((key) => key !== "isAbsolute" && key !== "isApproximately" && key !== "rack")
              .map((key) => (
                <div key={key} style={{ margin: "10px 0" }}>
                  <label htmlFor={key} style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels[key] || key}
                  </label>
                  <input
                    id={key}
                    type={
                      key.includes("date") || key === "purchaseDate"
                        ? "date"
                        : key === "gramsAvailable" || key === "purchase"
                        ? "number"
                        : "text"
                    }
                    name={key}
                    value={newChemical[key]}
                    onChange={handleChange}
                    required={key !== "purchase" && key !== "purchaseDate" && key !== "invoiceNumber"}
                    style={{ display: "block", padding: "5px", width: "100%" }}
                  />
                </div>
              ))}

            <div style={{ margin: "10px 0" }}>
              <label htmlFor="rack" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                {customLabels.rack}
              </label>
              <select
                id="rack"
                name="rack"
                value={newChemical.rack}
                onChange={handleChange}
                required
                style={{ padding: "5px", width: "100%" }}
              >
                <option value="">-- Select Rack --</option>
                {rackOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div style={{ margin: "20px 0", display: "flex", gap: "15px" }}>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  name="isAbsolute"
                  checked={newChemical.isAbsolute}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px", marginRight: "8px", accentColor: "#2c3e50", cursor: "pointer" }}
                />
                <span style={{ fontSize: "18px", color: "#f0e0c1" }}>Absolute</span>
              </label>
              <label style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  name="isApproximately"
                  checked={newChemical.isApproximately}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px", marginRight: "8px", accentColor: "#2c3e50", cursor: "pointer" }}
                />
                <span style={{ fontSize: "18px", color: "#f0e0c1" }}>Approximately</span>
              </label>
            </div>

            <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}>
              Add Chemical
            </button>
          </form>

          {editChemical && (
            <>
              <h2>Edit Chemical</h2>
              <form onSubmit={handleEditSubmit}>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="chemicalName" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.chemicalName}
                  </label>
                  <input
                    id="chemicalName"
                    type="text"
                    name="chemicalName"
                    value={editChemical.chemicalName}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="gramsAvailable" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.gramsAvailable}
                  </label>
                  <input
                    id="gramsAvailable"
                    type="number"
                    name="gramsAvailable"
                    value={editChemical.gramsAvailable}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="dateOfMFG" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.dateOfMFG}
                  </label>
                  <input
                    id="dateOfMFG"
                    type="date"
                    name="dateOfMFG"
                    value={editChemical.dateOfMFG}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="dateOfExp" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.dateOfExp}
                  </label>
                  <input
                    id="dateOfExp"
                    type="date"
                    name="dateOfExp"
                    value={editChemical.dateOfExp}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="purchase" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.purchase}
                  </label>
                  <input
                    id="purchase"
                    type="number"
                    name="purchase"
                    value={editChemical.purchase || ""}
                    onChange={handleEditChange}
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="purchaseDate" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.purchaseDate}
                  </label>
                  <input
                    id="purchaseDate"
                    type="date"
                    name="purchaseDate"
                    value={editChemical.purchaseDate || ""}
                    onChange={handleEditChange}
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="invoiceNumber" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.invoiceNumber}
                  </label>
                  <input
                    id="invoiceNumber"
                    type="text"
                    name="invoiceNumber"
                    value={editChemical.invoiceNumber || ""}
                    onChange={handleEditChange}
                    style={{ padding: "5px", width: "100%" }}
                  />
                </div>
                <div style={{ margin: "10px 0" }}>
                  <label htmlFor="rack" style={{ display: "block", marginBottom: "5px", fontSize: "18px", color: "#fff", fontWeight: "700" }}>
                    {customLabels.rack}
                  </label>
                  <select
                    id="rack"
                    name="rack"
                    value={editChemical.rack}
                    onChange={handleEditChange}
                    required
                    style={{ padding: "5px", width: "100%" }}
                  >
                    <option value="">-- Select Rack --</option>
                    {rackOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div style={{ margin: "20px 0", display: "flex", gap: "15px" }}>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      name="isAbsolute"
                      checked={editChemical.isAbsolute}
                      onChange={handleEditChange}
                      style={{ width: "16px", height: "16px", marginRight: "8px", accentColor: "#2c3e50", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "18px", color: "#f0e0c1" }}>Absolute</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      name="isApproximately"
                      checked={editChemical.isApproximately}
                      onChange={handleEditChange}
                      style={{ width: "16px", height: "16px", marginRight: "8px", accentColor: "#2c3e50", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "18px", color: "#f0e0c1" }}>Approximately</span>
                  </label>
                </div>
                <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#2c3e50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditChemical(null)} style={{ padding: "8px 16px", backgroundColor: "#d33", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", marginLeft: "10px" }}>
                  Cancel
                </button>
              </form>
            </>
          )}

          <h3>All Chemicals Data</h3>
          {chemicalData.length === 0 ? (
            <p>No chemicals available.</p>
          ) : (
            <table border="1">
              <thead>
                <tr>
                  <th>Chemical ID</th>
                  <th>Chemical Name</th>
                  <th>Chemical Type</th>
                  <th>Reagent Type</th>
                  <th>Grams Available</th>
                  <th>Date Of MFD</th>
                  <th>Date Of EXP</th>
                  <th>Purchase</th>
                  <th>Purchase Date</th>
                  <th>Invoice Number</th>
                  <th>Absolute</th>
                  <th>Approximately</th>
                  <th>Rack</th>
                  {role === "admin" && <th>User Usage</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChemicalData.map((chem) => (
                  <tr key={chem.chemicalId}>
                    <td>{chem.chemicalId}</td>
                    <td style={{ textTransform: "capitalize" }}>{chem.chemicalName}</td>
                    <td>{chem.chemicalType}</td>
                    <td>{chem.type}</td>
                    <td>{chem.gramsAvailable}</td>
                    <td>{new Date(chem.dateOfMFG).toLocaleDateString()}</td>
                    <td>{new Date(chem.dateOfExp).toLocaleDateString()}</td>
                    <td>{chem.purchase}</td>
                    <td>{chem.purchaseDate ? new Date(chem.purchaseDate).toLocaleDateString() : "N/A"}</td>
                    <td>{chem.invoiceNumber || "N/A"}</td>
                    <td>{chem.isAbsolute ? "Yes" : "No"}</td>
                    <td>{chem.isApproximately ? "Yes" : "No"}</td>
                    <td>{chem.rack}</td>
                    {role === "admin" && (
                      <td>
                        {chem.userUsage && chem.userUsage.length > 0 ? (
                          <ul>
                            {chem.userUsage.map((usage, index) => (
                              <li key={index}>
                                {usage.userName} used {usage.gramsUsed}g on {new Date(usage.date).toLocaleDateString()}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "No usage recorded"
                        )}
                      </td>
                    )}
                    <td>
                      <button onClick={() => startEdit(chem)}>Edit</button>
                      <button onClick={() => handleDelete(chem.chemicalId)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <h2>Select Chemical</h2>
      {chemicalData.length === 0 ? (
        <p>No chemicals available to select.</p>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search by chemical name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
          />
          <select
            onChange={handleChemicalChange}
            value={selectedChemical}
            style={{ display: "block", marginBottom: "10px", padding: "5px" }}
          >
            <option value="">-- Select a Chemical --</option>
            {filteredChemicalData.map((chem) => (
              <option key={chem.chemicalId} value={chem.chemicalId}>
                {chem.chemicalName} ({chem.gramsAvailable}g available)
              </option>
            ))}
          </select>

          {selectedChemicalDetails && (
            <table border="1">
              <thead>
                <tr>
                  <td>Chemical Id</td>
                  <th>Chemical Name</th>
                  <th>Type</th>
                  <th>Grams Available</th>
                  <th>Make</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{selectedChemicalDetails.chemicalId}</td>
                  <td>{selectedChemicalDetails.chemicalName}</td>
                  <td>{selectedChemicalDetails.type}</td>
                  <td>{selectedChemicalDetails.gramsAvailable}</td>
                  <td>{selectedChemicalDetails.make}</td>
                </tr>
              </tbody>
            </table>
          )}
        </>
      )}

      <input
        type="number"
        placeholder="Enter grams"
        value={requestedGrams}
        onChange={(e) => setRequestedGrams(e.target.value)}
      />
      <button style={{ marginBottom: "50px" }} onClick={handleRequestChemical}>Use Chemical</button>

      <Footer />
    </div>
  );
}

export default ChemicalPage;
