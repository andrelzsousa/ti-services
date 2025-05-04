document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("change-password-form");
  const emailInput = document.getElementById("email");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const clearButton = document.getElementById("clear-button");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearError("error-message");
    let isValid = true;

    const email = emailInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!email) {
      displayError("error-message", "O campo de login (e-mail) é obrigatório.");
      isValid = false;
    } else if (!isValidEmail(email)) {
      displayError("error-message", "Formato de e-mail inválido.");
      isValid = false;
    }

    if (!newPassword) {
      displayError(
        "error-message",
        (document.getElementById("error-message").textContent
          ? document.getElementById("error-message").textContent + " "
          : "") + "O campo Nova Senha é obrigatório."
      );
      isValid = false;
    }

    if (!confirmPassword) {
      displayError(
        "error-message",
        (document.getElementById("error-message").textContent
          ? document.getElementById("error-message").textContent + " "
          : "") + "O campo Confirmar Nova Senha é obrigatório."
      );
      isValid = false;
    }

    if (newPassword && confirmPassword) {
      if (newPassword !== confirmPassword) {
        displayError(
          "error-message",
          (document.getElementById("error-message").textContent
            ? document.getElementById("error-message").textContent + " "
            : "") + "As senhas não coincidem."
        );
        isValid = false;
      } else if (!isValidPassword(newPassword)) {
        displayError(
          "error-message",
          (document.getElementById("error-message").textContent
            ? document.getElementById("error-message").textContent + " "
            : "") +
            "A senha não atende aos critérios de segurança (verifique as regras)."
        );
        isValid = false;
      }
    }

    if (isValid) {
      console.log("Simulating password change for:", email);
      alert("Validação realizada com sucesso");
      window.history.back();
    }
  });

  clearButton.addEventListener("click", () => {
    emailInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
    clearError("error-message");
    emailInput.focus();
  });
});
