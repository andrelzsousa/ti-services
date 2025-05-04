document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";
  const serviceLink = document.getElementById("service-link");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutBtn = document.getElementById("logout-btn");

  if (isLoggedIn) {
    if (serviceLink) serviceLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline";
  } else {
    if (serviceLink) serviceLink.style.display = "none";
    if (loginLink) loginLink.style.display = "inline";
    if (registerLink) registerLink.style.display = "inline";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // Limpar dados do localStorage
      localStorage.removeItem("userLoggedIn");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      
      // Redirecionar para a página inicial
      window.location.href = "index.html";
    });
  }
}); 