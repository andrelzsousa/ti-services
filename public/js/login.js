document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const clearButton = document.getElementById("clear-button");
  const errorMessageDiv = document.getElementById("error-message");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError("error-message");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let isValid = true;

    if (!email) {
      displayError("error-message", "O campo de login (e-mail) é obrigatório.");
      isValid = false;
    } else if (!isValidEmail(email)) {
      displayError("error-message", "Formato de e-mail inválido.");
      isValid = false;
    }

    if (!password) {
      const currentError = errorMessageDiv.textContent;
      displayError(
        "error-message",
        (currentError ? currentError + " " : "") +
          "O campo de senha é obrigatório."
      );
      isValid = false;
    }

    if (isValid) {
      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert("Login realizado com sucesso!");
          localStorage.setItem("userLoggedIn", "true");
          localStorage.setItem("userEmail", email);
          window.location.href = "index.html";
        } else {
          displayError(
            "error-message",
            result.message || "Erro ao tentar fazer login. Tente novamente."
          );
        }
      } catch (error) {
        console.error("Login fetch error:", error);
        displayError(
          "error-message",
          "Erro de comunicação com o servidor. Verifique sua conexão."
        );
      }
    }
  });

  clearButton.addEventListener("click", () => {
    emailInput.value = "";
    passwordInput.value = "";
    clearError("error-message");
    emailInput.focus();
  });
});
