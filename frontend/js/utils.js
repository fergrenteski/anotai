// padrão de URL da API
export const apiUrl = "http://localhost:3000/api";

// pega token do localStorage (supondo que você já salva no login)
export function getToken() {
  return localStorage.getItem("token") || "";
}

// desloga, limpa token e redireciona
export function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}
