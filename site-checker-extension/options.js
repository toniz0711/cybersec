document.addEventListener("DOMContentLoaded", async () => {
  const dados = await obterConfiguracao("safeBrowsingApiKey");
  if (dados.safeBrowsingApiKey) {
    document.getElementById("apiKey").value = dados.safeBrowsingApiKey;
  }
});

document.getElementById("save").addEventListener("click", async () => {
  const apiKey = document.getElementById("apiKey").value.trim();
  await salvarConfiguracao({ safeBrowsingApiKey: apiKey });

  const status = document.getElementById("status");
  status.textContent = "Configurações salvas.";
  setTimeout(() => (status.textContent = ""), 2000);
});
