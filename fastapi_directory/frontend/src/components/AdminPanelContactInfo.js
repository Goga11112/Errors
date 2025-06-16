import React, { useEffect, useState } from "react";
import { fetchContactInfos } from "../apiClient";

function AdminPanelContactInfo() {
  const [contactInfos, setContactInfos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching contact infos...");
    fetchContactInfos()
      .then((data) => {
        console.log("Contact infos fetched:", data);
        setContactInfos(data);
      })
      .catch((err) => {
        console.error("Error fetching contact infos:", err);
        if (err.message.includes("No access token")) {
          setError("Access token is missing. Please login.");
        } else if (err.message.includes("401")) {
          setError("Unauthorized access. Please check your credentials.");
        } else {
          setError(err.message);
        }
      });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Contact Infos</h2>
      <ul>
        {contactInfos.map((info) => (
          <li key={info.id}>
            {info.name} - {info.phone_number} - {info.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminPanelContactInfo;
