document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  const serviceLink = document.getElementById("service-link");
  if (isLoggedIn && serviceLink) {
    serviceLink.style.display = "inline";
  }
});
