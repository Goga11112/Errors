import React, { useEffect, useState } from "react";
import axios from "axios";

function ErrorsList() {
  const [errors, setErrors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/errors/");
      setErrors(response.data);
    } catch (err) {
      if (err.response) {
        setError(`Ошибка загрузки: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        setError("Ошибка: сервер не отвечает");
      } else {
        setError(`Ошибка: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>Ошибка: {error}</div>;
  }

  if (errors.length === 0) {
    return <div>Список ошибок пуст</div>;
  }

  return (
    <div>
      <h2>Список ошибок</h2>
      <div>
        {errors.map((err) => (
          <div key={err.id} style={{ border: "1px solid #ccc", marginBottom: 8, borderRadius: 4 }}>
            <div
              onClick={() => toggleExpand(err.id)}
              style={{ cursor: "pointer", padding: 10, backgroundColor: "#f0f0f0" }}
            >
              {err.name}
            </div>
            {expandedId === err.id && (
              <div style={{ padding: 10 }}>
                <p>{err.description}</p>
                {err.images && err.images.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {err.images.map((img) => (
                      <img
                        key={img.id}
                        src={img.image_url}
                        alt={`Error illustration ${img.id}`}
                        style={{ maxWidth: "30%", maxHeight: 200, objectFit: "contain" }}
                      />
                    ))}
                  </div>
                )}


              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ErrorsList;
