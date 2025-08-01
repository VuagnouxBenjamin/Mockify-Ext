// Créer et configurer l'élément de message
function createProtectionMessage() {
  const messageDiv = document.createElement('div');
  messageDiv.id = 'mockify-protection-message';
  messageDiv.textContent = 'Mockup protected by Mockify';
  
  // Styles pour le message
  messageDiv.style.position = 'fixed';
  messageDiv.style.bottom = '10px';
  messageDiv.style.right = '10px';
  messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  messageDiv.style.color = '#666';
  messageDiv.style.padding = '5px 10px';
  messageDiv.style.borderRadius = '4px';
  messageDiv.style.fontSize = '12px';
  messageDiv.style.textAlign = 'right';
  messageDiv.style.zIndex = '9999';
  messageDiv.style.fontFamily = 'Arial, sans-serif';
  messageDiv.style.maxWidth = '200px';
  messageDiv.style.backdropFilter = 'blur(5px)';
  messageDiv.style.transition = 'opacity 0.3s ease';
  
  // Rendre le message semi-transparent au repos
  messageDiv.style.opacity = '0.7';
  
  // Rendre le message plus visible au survol
  messageDiv.addEventListener('mouseenter', () => {
    messageDiv.style.opacity = '1';
  });
  
  // Retourner à la semi-transparence quand la souris quitte
  messageDiv.addEventListener('mouseleave', () => {
    messageDiv.style.opacity = '0.7';
  });
  
  return messageDiv;
}

// Gérer l'affichage du message
function handleProtectionMessage(isEnabled) {
  let messageDiv = document.getElementById('mockify-protection-message');
  
  if (isEnabled) {
    if (!messageDiv) {
      messageDiv = createProtectionMessage();
      document.body.appendChild(messageDiv);
    }
  } else {
    if (messageDiv) {
      messageDiv.remove();
    }
  }
}

// Écouter les changements d'état de la protection
chrome.storage.local.get(['protectionEnabled'], function(result) {
  handleProtectionMessage(result.protectionEnabled || false);
});

// Écouter les mises à jour de l'état
chrome.storage.onChanged.addListener(function(changes) {
  if (changes.protectionEnabled) {
    handleProtectionMessage(changes.protectionEnabled.newValue);
  }
});