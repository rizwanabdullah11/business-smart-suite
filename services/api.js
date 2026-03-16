const BASE_URL = "/api"

export const getToken = () => {
  return localStorage.getItem("token")
}

export const api = async (url, method = "GET", body) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: body ? JSON.stringify(body) : undefined
  })

  return res.json()
}