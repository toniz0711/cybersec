const form = document.querySelector("#loginForm");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const error = document.querySelector("#error");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!email.value.trim() || !password.value) {
    error.textContent = "Preencha os campos para concluir a simulação.";
    error.hidden = false;
    return;
  }

  /*
   * IMPORTANTE:
   * A senha nunca é armazenada, enviada ou registrada.
   * Registramos somente o resultado da interação.
   */
  const eventData = {
    type: "simulation_attempt",
    timestamp: new Date().toISOString(),
    emailProvided: Boolean(email.value.trim())
  };

  // Demonstração local בלבד: não envia dados para servidor.
  console.info("Evento de treinamento:", eventData);

  sessionStorage.setItem("phishingSimulationCompleted", "true");
  window.location.href = "resultado.html";
});
