const API_DOMAIN = "http://localhost:5000/api/student";
export const get = async (url) => {
  const response = await fetch(`${API_DOMAIN}${url}`);
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorMessage}`
    );
  }

  return response.json();
};
export const post = async (url, data) => {
  const response = await fetch(`${API_DOMAIN}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorMessage}`
    );
  }

  return response.json();
};
export const remove = async (url) => {
  const response = await fetch(`${API_DOMAIN}${url}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorMessage}`
    );
  }
  return response.json();
};
