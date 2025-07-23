const API_BASE_URL = "/api";

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  console.log("Access token from localStorage:", token);
  if (!token) {
    console.error("No access token found, please login");
    throw new Error("No access token found, please login");
  }
  return { Authorization: `Bearer ${token}` };
}

export async function fetchUsers() {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return await response.json();
}

export async function createUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error("Failed to create user");
  }
  return await response.json();
}

export async function fetchErrors() {
  const response = await fetch(`${API_BASE_URL}/errors/`, {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch errors");
  }
  return await response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
  return true;
}

export async function updateUserRole(userId, newRoleId) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role_id: newRoleId }),
  });
  if (!response.ok) {
    throw new Error("Failed to update user role");
  }
  return await response.json();
}

export async function createError(errorData) {
  // Отправляем данные как FormData с local_kw
  const url = new URL(`${API_BASE_URL}/errors/`);

  const formData = new FormData();
  formData.append("name", errorData.name);
  if (errorData.description) {
    formData.append("description", errorData.description);
  }
  if (errorData.solution_description) {
    formData.append("solution_description", errorData.solution_description);
  }
  if (errorData.files && errorData.files.length > 0) {
    errorData.files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to create error");
  }
  return await response.json();
}

export async function updateError(errorId, errorData) {
  const response = await fetch(`${API_BASE_URL}/errors/${errorId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(errorData),
  });
  if (!response.ok) {
    throw new Error("Failed to update error");
  }
  return await response.json();
}

export async function deleteError(errorId) {
  const response = await fetch(`${API_BASE_URL}/errors/${errorId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete error");
  }
  return true;
}

export async function uploadErrorImage(errorId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/errors/${errorId}/images/`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload error image");
  }
  return await response.json();
}

// New function to fetch contact infos with local_kw=1
export async function fetchContactInfos() {
  const url = new URL(`${API_BASE_URL}/contact_info/`);
  url.searchParams.append("local_kw", "1");

  const response = await fetch(url.toString(), {
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch contact infos");
  }
  return await response.json();
}

// Add more API client functions as needed for other endpoints
