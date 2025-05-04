document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("change-password-form");
  const errorMessage = document.getElementById("error-message");
  const clearButton = document.getElementById("clear-button");

  // Função para validar a senha
  function validatePassword(password) {
    if (password.length < 6) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[@#$%&!?\/+=.]/.test(password)) return false;
    if (/[{}[\]<>;]/.test(password)) return false;
    return true;
  }

  // Função para limpar o formulário
  function clearForm() {
    form.reset();
    errorMessage.textContent = "";
  }

  // Função para verificar se o e-mail existe
  async function checkEmailExists(email) {
    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Erro ao verificar e-mail:", error);
      return false;
    }
  }

  // Evento de envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Validações
    if (!email) {
      errorMessage.textContent = "Por favor, informe seu e-mail.";
      return;
    }

    if (!newPassword || !confirmPassword) {
      errorMessage.textContent =
        "Por favor, preencha todos os campos de senha.";
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMessage.textContent = "As senhas não coincidem.";
      return;
    }

    if (!validatePassword(newPassword)) {
      errorMessage.textContent = "A senha não atende aos requisitos mínimos.";
      return;
    }

    // Verificar se o e-mail existe
    const emailExists = await checkEmailExists(email);
    if (!emailExists) {
      errorMessage.textContent =
        "E-mail não encontrado. Verifique se o e-mail está correto.";
      return;
    }

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao alterar senha");
      }

      const data = await response.json();
      alert("Senha alterada com sucesso!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      errorMessage.textContent =
        error.message || "Erro ao alterar a senha. Tente novamente.";
    }
  });

  // Evento do botão limpar
  clearButton.addEventListener("click", clearForm);
});
