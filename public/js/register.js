document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const nameInput = document.getElementById("name");
  const cpfInput = document.getElementById("cpf");
  const birthdateInput = document.getElementById("birthdate");
  const phoneInput = document.getElementById("phone");
  const educationSelect = document.getElementById("education");
  const maritalStatusRadios = document.querySelectorAll(
    'input[name="marital_status"]'
  );
  const clearButton = document.getElementById("clear-button");
  const backButton = document.getElementById("back-button");
  const errorMessageDiv = document.getElementById("error-message");

  cpfInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = value;
  });

  function isValidCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf === "" || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  function isValidName(name) {
    if (!name) return false;
    if (/[@#$%&!?\/+=.{}[\]<>;0-9]/.test(name)) return false;
    const words = name.trim().split(/\s+/);
    if (words.length < 2) return false;
    if (words[0].length < 2) return false;
    return true;
  }

  function isAdult(birthdate) {
    if (!birthdate) return false;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }

  function isValidPhone(phone) {
    if (!phone) return true;
    const phoneDigits = phone.replace(/\D/g, "");
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
    return (
      phoneRegex.test(phone) &&
      (phoneDigits.length === 10 || phoneDigits.length === 11)
    );
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError("error-message");
    let validationMessage = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const name = nameInput.value.trim();
    const cpf = cpfInput.value;
    const birthdate = birthdateInput.value;
    const phone = phoneInput.value.trim();
    const education = educationSelect.value;
    let marital_status = "";
    maritalStatusRadios.forEach((radio) => {
      if (radio.checked) {
        marital_status = radio.value;
      }
    });

    if (!email) validationMessage += "E-mail é obrigatório. ";
    else if (!isValidEmail(email)) validationMessage += "Formato de e-mail inválido. ";

    if (!password) validationMessage += "Senha é obrigatória. ";
    if (!confirmPassword)
      validationMessage += "Confirmação de senha é obrigatória. ";

    if (password && confirmPassword) {
      if (password !== confirmPassword)
        validationMessage += "As senhas não coincidem. ";
      else if (!isValidPassword(password))
        validationMessage += "Senha inválida (verifique as regras). ";
    }

    if (!name) validationMessage += "Nome completo é obrigatório. ";
    else if (!isValidName(name))
      validationMessage +=
        "Formato de nome inválido (mín. 2 palavras, 1ª com mín. 2 letras, sem caracteres especiais ou números). ";

    if (!cpf) validationMessage += "CPF é obrigatório. ";
    else if (!isValidCPF(cpf)) validationMessage += "CPF inválido. ";

    if (!birthdate) validationMessage += "Data de nascimento é obrigatória. ";
    else if (!isAdult(birthdate))
      validationMessage += "É necessário ser maior de 18 anos. ";

    if (!isValidPhone(phone))
      validationMessage +=
        "Formato de telefone inválido (use (XX) XXXXX-XXXX ou (XX) XXXX-XXXX). ";

    if (validationMessage) {
      displayError("error-message", validationMessage.trim());
    } else {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
            name: name,
            cpf: cpf.replace(/[^\d]+/g, ""),
            birthdate: birthdate,
            phone: phone,
            marital_status: marital_status,
            education: education,
          }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert("Cadastro realizado com sucesso!");
          clearForm();
          window.location.href = "login.html";
        } else {
          displayError(
            "error-message",
            result.message || "Erro ao tentar cadastrar. Tente novamente."
          );
        }
      } catch (error) {
        console.error("Registration fetch error:", error);
        displayError(
          "error-message",
          "Erro de comunicação com o servidor durante o cadastro."
        );
      }
    }
  });

  function clearForm() {
    form.reset();
    document.getElementById("education").value = "2_completo";
    document.getElementById("single").checked = true;
    clearError("error-message");
    emailInput.focus();
  }

  clearButton.addEventListener("click", clearForm);

  backButton.addEventListener("click", () => {
    window.history.back();
  });
});
