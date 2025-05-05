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
    errorElement.classList.add("show");
  } else {
    alert(message);
  }
}

function clearError(elementId) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = "";
    errorElement.classList.remove("show");
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
  return `${day}/${month}/${year}`;
}

// Função para criar o header padrão
function createHeader(title) {
  const isLoggedIn = localStorage.getItem("userLoggedIn") === "true";

  return `
    <header class="main-header">
      <div class="container">
        <a href="index.html">
          <img src="/images/logo.png" alt="Logo Nandeco" id="logo" />
        </a>
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
            <li><a href="mailto:contato@nandeco.com.br">contato@nandeco.com.br</a></li>
          </ul>
        </div>
        <div id="address">
          <h3>Endereço</h3>
          <p>Av. Cais do Apolo, 77, Sala 17, Bairro do Recife, Recife - PE, CEP 50030-220</p>
        </div>
        <div id="address">
          <h3>Formas de Pagamento</h3>
          <div id="payment-methods">
            <div class="payment-method">
              <img src="/images/credit.png" alt="Cartão de Crédito" class="payment-icon" />
              <p>Cartão de Crédito</p>
            </div>
            <div class="payment-method">
              <img src="/images/invoice.png" alt="Boleto Bancário" class="payment-icon" />
              <p>Boleto Bancário</p>
            </div>
            <div class="payment-method">
              <img src="/images/pix.png" alt="PIX" class="payment-icon" />
              <p>PIX</p>
            </div>
          </div>
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
