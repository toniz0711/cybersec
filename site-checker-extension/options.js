
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["safeBrowsingApiKey"], data => {
    if (data.safeBrowsingApiKey) {
      document.getElementById("apiKey").value = data.safeBrowsingApiKey;
    }
  });
});

document.getElementById("save").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value.trim();
  chrome.storage.sync.set({ safeBrowsingApiKey: apiKey }, () => {
    const status = document.getElementById("status");
    status.textContent = "Configurações salvas!";
    setTimeout(() => (status.textContent = ""), 2000);
  });
});
