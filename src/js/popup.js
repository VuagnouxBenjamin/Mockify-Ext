document.addEventListener('DOMContentLoaded', function() {
  const protectionToggle = document.getElementById('protectionToggle');
  const statusText = document.getElementById('statusText');

  // Charger l'état sauvegardé
  chrome.storage.local.get(['protectionEnabled'], function(result) {
    protectionToggle.checked = result.protectionEnabled || false;
    updateStatus(protectionToggle.checked);
  });

  // Gérer le changement d'état
  protectionToggle.addEventListener('change', function() {
    const isEnabled = this.checked;
    
    // Sauvegarder l'état
    chrome.storage.local.set({ protectionEnabled: isEnabled }, function() {
      updateStatus(isEnabled);
    });
  });

  function updateStatus(isEnabled) {
    statusText.textContent = isEnabled ? 'ON' : 'OFF';
    statusText.style.color = isEnabled ? '#4CAF50' : '#666';
  }
});