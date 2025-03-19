import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import Select from "react-select";
import "./ChemicalPage.css";

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
  const [editable, setEditable] = useState(false);
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
  });
  const [editChemical, setEditChemical] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const API_URL = "https://labrecordsbackend.onrender.com";
  const [isLoading, setIsLoading] = useState(true);

  
  // Add to your state declarations at the top
const [repeatChemicalId, setRepeatChemicalId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

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
        const [roleRes, chemicalsRes, userDetailsRes, userChemicalsRes] = await Promise.all([
          axios.get(`${API_URL}/userRole`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/getchemicals`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/getUserDetails`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/getUserChemicals`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setRole(roleRes.data.role || "user");
        setChemicalData(chemicalsRes.data || []);
        setUserName(userDetailsRes.data.userName || "Unknown User");
        setUserUsageData(userChemicalsRes.data || []);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response?.data?.error || "Error fetching data!",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading) return <div>Loading...</div>;

  const handleChemicalChange = (e) => {
    const chemicalId = e.target.value;
    setSelectedChemical(chemicalId);
    const chemical = chemicalData.find((chem) => chem.chemicalId === chemicalId);
    setSelectedChemicalDetails(chemical || null);
  };

  const chemicalOptions = chemicalData.map((chem) => ({
    value: chem.chemicalId,
    label: `${chem.chemicalName} (${chem.gramsAvailable}g available)`,
  }));




  

// Add this new function
// const handleRepeatChemical = async () => {
//   const { value: chemicalId } = await Swal.fire({
//     title: 'Enter Chemical ID',
//     input: 'text',
//     inputLabel: 'Chemical ID',
//     inputPlaceholder: 'Enter the Chemical ID',
//     showCancelButton: true,
//     inputValidator: (value) => {
//       if (!value) {
//         return 'Please enter a Chemical ID!'
//       }
//     }
//   });

//   if (chemicalId) {
//     const token = localStorage.getItem("token");
//     try {
//       const response = await axios.get(`${API_URL}/getchemicals`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       const chemical = response.data.find(chem => chem.chemicalId === chemicalId);
      
//       if (chemical) {
//         // Auto-fill the edit form with existing data and increment counter
//         const updatedChemical = {
//           ...chemical,
//           dateOfMFG: new Date(chemical.dateOfMFG).toISOString().split("T")[0],
//           dateOfExp: new Date(chemical.dateOfExp).toISOString().split("T")[0],
//           purchase: chemical.purchase ? parseFloat(chemical.purchase) + 1 : 1 // Increment purchase counter
//         };
//         setEditChemical(updatedChemical);
//         setRepeatChemicalId(chemicalId);
        
//         Swal.fire({
//           icon: "success",
//           title: "Chemical Found!",
//           text: `Details for ${chemical.chemicalName} loaded for editing.`,
//         });
//       } else {
//         Swal.fire({
//           icon: "error",
//           title: "Not Found",
//           text: "Chemical ID not found!",
//         });
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.error || "Server error",
//       });
//     }
//   }
// };


const handleRepeatChemical = async () => {
  const { value: chemicalId } = await Swal.fire({
    title: 'Enter Chemical ID',
    input: 'text',
    inputLabel: 'Chemical ID',
    inputPlaceholder: 'Enter the Chemical ID',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Please enter a Chemical ID!';
      }
    },
  });

  if (chemicalId) {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_URL}/getchemicals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chemical = response.data.find((chem) => chem.chemicalId === chemicalId);

      if (chemical) {
        // Auto-fill the edit form with existing data, including purchaseDate
        const updatedChemical = {
          ...chemical,
          dateOfMFG: new Date(chemical.dateOfMFG).toISOString().split("T")[0],
          dateOfExp: new Date(chemical.dateOfExp).toISOString().split("T")[0],
          purchaseDate: chemical.purchaseDate
            ? new Date(chemical.purchaseDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0], // Default to today if not set
          purchase: chemical.purchase ? parseFloat(chemical.purchase) + 1 : 1, // Increment purchase counter
        };
        setEditChemical(updatedChemical);
        setRepeatChemicalId(chemicalId);

        Swal.fire({
          icon: "success",
          title: "Chemical Found!",
          text: `Details for ${chemical.chemicalName} loaded for editing.`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Not Found",
          text: "Chemical ID not found!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Server error",
      });
    }
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewChemical((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "gramsAvailable" || name === "purchase" ? parseFloat(value) || "" : value;
    setEditChemical((prev) => ({ ...prev, [name]: parsedValue }));
  };


  const filteredChemicals = chemicalData.filter((chem) =>
    chem.chemicalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        chemicalName: "",
        chemicalType: "",
        type: "",
        gramsAvailable: "",
        make: "",
        dateOfMFG: "",
        dateOfExp: "",
        purchase: "",
        
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
        gramsAvailable: parseFloat(editChemical.gramsAvailable) || 0,
        dateOfMFG: editChemical.dateOfMFG,
        dateOfExp: editChemical.dateOfExp,
        purchase: editChemical.purchase ? parseFloat(editChemical.purchase) : undefined,
    };

    try {
        console.log(`[FRONTEND] Sending PUT request for chemicalId: "${editChemical.chemicalId}"`);
        console.log(`[FRONTEND] Payload: ${JSON.stringify(payload)}`);

        const response = await axios.put(
          `${API_URL}/updateChemical/${encodeURIComponent(editChemical.chemicalId)}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
      );
        console.log(`[FRONTEND] Update response: ${JSON.stringify(response.data)}`);

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
        console.error('[FRONTEND] Edit Error:', {
            chemicalId: editChemical.chemicalId,
            payload, // Now accessible
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.error || "Server error",
        });
    }
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
          console.log(`[FRONTEND] Deleting chemicalId: "${chemicalId}" (length: ${chemicalId.length})`);
          const response = await axios.delete(`${API_URL}/deleteChemical/${encodeURIComponent(chemicalId)}`, {
    headers: { Authorization: `Bearer ${token}` },
});
          console.log(`[FRONTEND] Delete response: ${JSON.stringify(response.data)}`);
          Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: response.data.message,
              confirmButtonColor: "#3085d6",
          });
          const updatedChemicalData = chemicalData.filter((chem) => chem.chemicalId !== chemicalId);
          setChemicalData(updatedChemicalData);
      } catch (error) {
          console.error('[FRONTEND] Delete Error:', {
              chemicalId,
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
          });
          Swal.fire({
              icon: "error",
              title: "Error",
              text: error.response?.data?.error || "Server error",
              confirmButtonColor: "#d33",
          });
      }
  }
};
  const startEdit = (chem) => {
    setEditChemical({
      ...chem,
      dateOfMFG: new Date(chem.dateOfMFG).toISOString().split("T")[0],
      dateOfExp: new Date(chem.dateOfExp).toISOString().split("T")[0],
    });
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



  
  
  const downloadExcel = () => {
    if (role !== "admin") return;
    const worksheet = XLSX.utils.json_to_sheet(userUsageData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chemical Usage");
    XLSX.writeFile(workbook, "chemical_usage.xlsx");
  };

  const capitalizeText = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  

  const nextPage = () => {
    if (currentPage * itemsPerPage < userUsageData.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };




  // const handleScrapRequest = async () => {
  //   const { value: chemicalId } = await Swal.fire({
  //     title: "Enter Chemical ID for Scrap Request",
  //     input: "text",
  //     inputLabel: "Chemical ID",
  //     inputPlaceholder: "Enter the Chemical ID",
  //     showCancelButton: true,
  //     inputValidator: (value) => {
  //       if (!value) {
  //         return "Please enter a Chemical ID!";
  //       }
  //     },
  //   });
  
  //   if (chemicalId) {
  //     const token = localStorage.getItem("token");
  //     try {
  //       const response = await axios.post(
  //         `${API_URL}/scrapRequest`,
  //         { chemicalId },
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       Swal.fire({
  //         icon: "success",
  //         title: "Scrap Request Sent!",
  //         text: response.data.message,
  //       });
  //       setScrapRequestChemicalId(chemicalId);
  //     } catch (error) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Error",
  //         text: error.response?.data?.error || "Server error",
  //       });
  //     }
  //   }
  // };
  



  const handleScrapRequest = async () => {
    const { value } = await Swal.fire({
      title: "Scrap Request",
      html: `
        <input id="chemicalId" class="swal2-input" placeholder="Enter Chemical ID" style="width: 80%;">
        <input id="scrapPhoto" type="file" accept="image/*" class="swal2-file" style="margin-top: 10px;">
      `,
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: () => {
        const chemicalId = document.getElementById("chemicalId").value;
        const scrapPhoto = document.getElementById("scrapPhoto").files[0];
        if (!chemicalId) {
          Swal.showValidationMessage("Please enter a Chemical ID!");
          return null;
        }
        if (!scrapPhoto) {
          Swal.showValidationMessage("Please upload a photo!");
          return null;
        }
        return { chemicalId, scrapPhoto };
      },
    });
  
    if (value) {
      const { chemicalId, scrapPhoto } = value;
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("chemicalId", chemicalId);
      formData.append("scrapPhoto", scrapPhoto);
  
      try {
        const response = await axios.post(`${API_URL}/scrapRequest`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        Swal.fire({
          icon: "success",
          title: "Scrap Request Sent!",
          text: response.data.message,
        });
        setScrapRequestChemicalId(chemicalId);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Server error",
        });
      }
    }
  };


  const handleNewChemicalRequest = async () => {
    const { value: chemicalName } = await Swal.fire({
      title: "Enter New Chemical Name",
      input: "text",
      inputLabel: "Chemical Name",
      inputPlaceholder: "Enter the chemical name",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "Please enter a chemical name!";
        }
      },
    });
  
    if (chemicalName) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          `${API_URL}/newChemicalRequest`,
          { chemicalName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire({
          icon: "success",
          title: "New Chemical Request Sent!",
          text: response.data.message,
        });
        setNewChemicalRequestName(chemicalName);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.error || "Server error",
        });
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userUsageData.slice(indexOfFirstItem, indexOfLastItem);

  console.log('chemicalData:', chemicalData); // Debug log
  return (
    <div className="form-container">
      <h2>Welcome, {userName}!</h2>

      {role === "admin" && (
        <>
        <img src="https://res.cloudinary.com/dcggiwav8/image/upload/v1742386187/xqvlntnphywafdza7foi.png" />
          <h2>Admin Dashboard</h2>
          <button onClick={downloadExcel}>Download Excel</button>

          <h2>Add New Chemical</h2>
          <form onSubmit={handleSubmit}>
          {Object.keys(newChemical).map((key) => (
            <div key={key} style={{ margin: "10px 0" }}>
              <label
                htmlFor={key}
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "18px",
                  color: "#fff",
                  fontWeight: "700",
                }}
              >
                {key.replace(/([A-Z])/g, " $1").trim()}
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
                required={key !== "purchase" && key !== "purchaseDate"}
               
              />
            </div>
          ))}
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              backgroundColor: "#2c3e50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Add Chemical
          </button>
        </form>

          {/* New Checkboxes Section */}
          <div style={{ margin: "20px 0", display: "flex", gap: "15px" }}>
      <label style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) handleRepeatChemical();
          }}
          style={{
            width: "16px",
            height: "16px",
            marginRight: "8px",
            accentColor: "#2c3e50",
            cursor: "pointer",
          }}
        />
        Repeat
      </label>
    </div>

          {editChemical && (
            <>
              <h2>Edit Chemical</h2>
              <form onSubmit={handleEditSubmit}>
                <input
                  type="number"
                  name="gramsAvailable"
                  placeholder="Grams Available"
                  value={editChemical.gramsAvailable}
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="date"
                  name="dateOfMFG"
                  value={editChemical.dateOfMFG}
                  onChange={handleEditChange}
                  required
                />
                <input
                  type="date"
                  name="dateOfExp"
                  value={editChemical.dateOfExp}
                  onChange={handleEditChange}
                  required
                />

                {/* <input
                  type="string"
                  name="Make"
                  value={editChemical.dateOfExp}
                  onChange={handleEditChange}
                  required
                /> */}
                <input
                  type="number"
                  name="purchase"
                  placeholder="Purchase"
                  value={editChemical.purchase || ""}
                  onChange={handleEditChange}
                  disabled={!editable} 
                />


                <input
                  type="date"
                  name="purchaseDate"
                  placeholder="Purchase Date"
                  value={editChemical.purchaseDate}
                  onChange={handleEditChange}
                  required
                />
                <button type="submit">Save Changes</button>
                <button type="button" onClick={() => setEditChemical(null)}>Cancel</button>
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
                  {role === "admin" && <th>User Usage</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chemicalData.map((chem) => (
                  <tr key={chem.chemicalId}>
                    <td>{chem.chemicalId}</td>
                    {/* <td>{chem.chemicalName}</td> */}
                    {/* <td>{capitalizeText(chem.chemicalName)}</td> */}
                    <td style={{ textTransform: "capitalize" }}>{chem.chemicalName}</td>

                    <td>{chem.chemicalType}</td>
                    <td>{chem.type}</td>
                    <td>{chem.gramsAvailable}</td>
                    <td>{new Date(chem.dateOfMFG).toLocaleDateString()}</td>
                    <td>{new Date(chem.dateOfExp).toLocaleDateString()}</td>
                    <td>{chem.purchase}</td>
                    <td>{chem.purchaseDate ? new Date(chem.purchaseDate).toLocaleDateString() : "N/A"}</td>
                    {role === "admin" && (
                      <td>
                        {chem.userUsage && chem.userUsage.length > 0 ? (
                          <ul>
                            {chem.userUsage.map((usage, index) => (
                              <li key={index}>
                                {usage.userName} used {usage.gramsUsed}g on{" "}
                                {new Date(usage.date).toLocaleDateString()}
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
                      <button onClick={() => {
  console.log("chemicalId:", chem.chemicalId);
  handleDelete(chem.chemicalId);
}}>Delete</button>
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
            {filteredChemicals.map((chem) => (
              <option key={chem.chemicalId} value={chem.chemicalId}>
                {chem.chemicalName} ({chem.gramsAvailable}g available)
              </option>
            ))}
          </select>

  
          {/* <select onChange={handleChemicalChange} value={selectedChemical}>
            <option value="">-- Select a Chemical --</option>
            {chemicalData.map((chem) => (
              <option key={chem.chemicalId} value={chem.chemicalId}>
                {chem.chemicalName} ({chem.gramsAvailable}g available)
              </option>
            ))}
          </select> */}

          
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
      <button onClick={handleRequestChemical}>Use Chemical</button>



      {role !== "admin" && (
      <div style={{ margin: "20px 0", display: "flex", gap: "15px" }}>
      <label style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) handleScrapRequest();
          }}
          style={{
            width: "16px",
            height: "16px",
            marginRight: "8px",
            accentColor: "#2c3e50",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: "18px", color: "#f0e0c1" }}>Scrap Request</span>
      </label>
      <label style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) handleNewChemicalRequest();
          }}
          style={{
            width: "16px",
            height: "16px",
            marginRight: "8px",
            accentColor: "#2c3e50",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: "18px", color: "#f0e0c1", fontWeight: 500 }}>New Chemical Request</span>
      </label>
    </div>
    )}

      <button onClick={() => navigate("/login")}>Logout</button>
    </div>
  );
}

export default ChemicalPage;