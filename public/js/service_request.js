document.addEventListener("DOMContentLoaded", () => {
  const serviceSelect = document.getElementById("service-type");
  const priceSpan = document.getElementById("service-price");
  const deadlineSpan = document.getElementById("service-deadline");
  const predictedDateSpan = document.getElementById("service-predicted-date");
  const newRequestForm = document.getElementById("new-request-form");
  const requestsTableBody = document.querySelector("#requests-table tbody");
  const errorMessageDiv = document.getElementById("error-message");
  const userNameSpan = document.getElementById("user-name");
  const userEmailSpan = document.getElementById("user-email");

  const loggedInUserEmail = localStorage.getItem("userEmail");
  if (loggedInUserEmail) {
    userEmailSpan.textContent = loggedInUserEmail;
  } else {
    console.warn(
      "User email not found in localStorage. Service requests might not work correctly."
    );
  }

  function renderTableRow(request) {
    const newRow = requestsTableBody.insertRow();
    newRow.dataset.requestId = request.id;

    newRow.innerHTML = `
          <td>${request.request_date || formatDate(new Date())}</td>
          <td>${request.id}</td>
          <td>${request.service_name}</td>
          <td>${request.status}</td>
          <td>${parseFloat(request.price).toFixed(2)}</td>
          <td>${request.predicted_date}</td>
          <td><button class="delete-btn">Excluir</button></td>
      `;
    newRow
      .querySelector(".delete-btn")
      .addEventListener("click", handleDeleteRow);
  }

  async function loadRequests() {
    if (!loggedInUserEmail) {
      displayError(
        "error-message",
        "Usuário não identificado. Faça login novamente."
      );
      return;
    }
    try {
      const response = await fetch(
        `/api/service-requests?userEmail=${encodeURIComponent(
          loggedInUserEmail
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const requests = await response.json();

      requestsTableBody.innerHTML = "";

      requests.forEach(renderTableRow);
      sortTableByDate();
    } catch (error) {
      console.error("Error loading service requests:", error);
      displayError(
        "error-message",
        "Erro ao carregar solicitações existentes."
      );
    }
  }

  serviceSelect.addEventListener("change", () => {
    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const price = selectedOption.getAttribute("data-price");
    const deadline = selectedOption.getAttribute("data-deadline");

    clearError("error-message");

    if (price && deadline) {
      priceSpan.textContent = parseFloat(price).toFixed(2);
      deadlineSpan.textContent = deadline;

      const today = new Date();
      const predicted = addDays(today, parseInt(deadline));
      predictedDateSpan.textContent = formatDate(predicted);
    } else {
      priceSpan.textContent = "--";
      deadlineSpan.textContent = "--";
      predictedDateSpan.textContent = "--";
    }
  });

  newRequestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError("error-message");

    const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
    const serviceName = selectedOption.text;
    const priceText = priceSpan.textContent;
    const predictedDate = predictedDateSpan.textContent;
    const status = document.getElementById("service-status").textContent;

    if (!selectedOption.value || priceText === "--") {
      displayError("error-message", "Por favor, selecione um serviço válido.");
      return;
    }
    if (!loggedInUserEmail) {
      displayError(
        "error-message",
        "Usuário não identificado para salvar a solicitação."
      );
      return;
    }

    const requestData = {
      userEmail: loggedInUserEmail,
      service_name: serviceName,
      status: status,
      price: parseFloat(priceText),
      predicted_date: predictedDate,
      request_date: formatDate(new Date()),
    };

    try {
      const response = await fetch("/api/service-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        renderTableRow(result.newRequest);
        sortTableByDate();

        serviceSelect.value = "";
        priceSpan.textContent = "--";
        deadlineSpan.textContent = "--";
        predictedDateSpan.textContent = "--";

        console.log(
          "Solicitação incluída com sucesso (ID: " + result.newRequest.id + ")"
        );
      } else {
        displayError(
          "error-message",
          result.message || "Erro ao salvar solicitação no servidor."
        );
      }
    } catch (error) {
      console.error("Error adding service request:", error);
      displayError(
        "error-message",
        "Erro de comunicação ao salvar solicitação."
      );
    }
  });

  async function handleDeleteRow(event) {
    const row = event.target.closest("tr");
    const requestId = row.dataset.requestId;

    if (!requestId) {
      console.error("Could not find request ID for deletion.");
      alert("Erro: ID da solicitação não encontrado para exclusão.");
      return;
    }
    if (!loggedInUserEmail) {
      alert("Erro: Usuário não identificado para exclusão.");
      return;
    }

    if (
      !confirm(`Tem certeza que deseja excluir a solicitação ${requestId}?`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userEmail: loggedInUserEmail }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        row.remove();
        console.log(`Solicitação ${requestId} excluída com sucesso.`);
      } else {
        alert(
          `Erro ao excluir solicitação: ${
            result.message || "Erro desconhecido."
          }`
        );
      }
    } catch (error) {
      console.error("Error deleting service request:", error);
      alert("Erro de comunicação ao excluir solicitação.");
    }
  }

  function sortTableByDate() {
    const rows = Array.from(requestsTableBody.querySelectorAll("tr"));
    rows.sort((a, b) => {
      const dateA = new Date(a.cells[0].textContent);
      const dateB = new Date(b.cells[0].textContent);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
    rows.forEach((row) => requestsTableBody.appendChild(row));
  }

  loadRequests();
});
