function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password) {
  if (password.length < 6) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[@#$%&!?\/+=.]/.test(password)) return false;
  if (/[{}[\]<>;]/.test(password)) return false;
  return true;
}

function displayError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  } else {
    alert(message);
  }
}

function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = "";
  }
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
}

// Função para criar o header padrão
function createHeader(title) {
  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  return `
    <header class="main-header">
      <div class="container">
        <img src="placeholder_logo.png" alt="Logo TechSolutions" id="logo" />
        <h1>${title}</h1>
        <nav>
          <a href="login.html" id="login-link" style="${
            isLoggedIn ? "display: none" : "display: inline"
          }">Login Cliente</a>
          <a href="register.html" id="register-link" style="${
            isLoggedIn ? "display: none" : "display: inline"
          }">Cadastrar Cliente</a>
          <a href="service_request.html" id="service-link" style="${
            isLoggedIn ? "display: inline" : "display: none"
          }">Solicitar Serviço</a>
          <button id="logout-btn" class="logout-btn" style="${
            isLoggedIn ? "display: inline" : "display: none"
          }">Sair</button>
        </nav>
      </div>
    </header>
  `;
}

// Função para criar o footer padrão
function createFooter() {
  return `
    <footer class="main-footer">
      <div class="container">
        <div id="contact">
          <h3>Contato</h3>
          <ul>
            <li>Telefone Fixo: (81) 3333-4444</li>
            <li>WhatsApp: (81) 99999-8888</li>
            <li><a href="mailto:contato@techsolutions.com.br">contato@techsolutions.com.br</a></li>
          </ul>
        </div>
        <div id="address">
          <h3>Endereço</h3>
          <p>Av. Cais do Apolo, 222, 16º andar, Bairro do Recife, Recife - PE, CEP 50030-220</p>
        </div>
        <div id="payment-methods">
          <h3>Formas de Pagamento</h3>
          <img src="placeholder_payment1.png" alt="Cartão de Crédito" class="payment-icon" />
          <img src="placeholder_payment2.png" alt="Boleto Bancário" class="payment-icon" />
          <img src="placeholder_payment3.png" alt="PIX" class="payment-icon" />
        </div>
      </div>
    </footer>
  `;
}

// Função para inicializar o header e footer
function initCommonElements(title) {
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");

  if (header) {
    header.outerHTML = createHeader(title);

    // Adicionar evento de logout
    const logoutBtn = document.getElementById("logout-btn");
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
  }

  if (footer) {
    footer.outerHTML = createFooter();
  }
}
