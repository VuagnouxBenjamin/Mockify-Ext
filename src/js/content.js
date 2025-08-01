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

// Bloquer tous les éléments interactifs de la page
function blockAllInteractiveElements(isEnabled) {
  // Bloquer les liens
  const links = document.getElementsByTagName('a');
  for (const link of links) {
    if (isEnabled) {
      link.addEventListener('click', preventNavigation);
      link.style.cursor = 'not-allowed';
    } else {
      link.removeEventListener('click', preventNavigation);
      link.style.cursor = 'pointer';
    }
  }

  // Bloquer les boutons
  const buttons = document.getElementsByTagName('button');
  for (const button of buttons) {
    if (isEnabled) {
      button.addEventListener('click', preventNavigation);
      button.disabled = true;
      button.style.cursor = 'not-allowed';
      button.style.opacity = '0.6';
    } else {
      button.removeEventListener('click', preventNavigation);
      button.disabled = false;
      button.style.cursor = 'pointer';
      button.style.opacity = '1';
    }
  }

  // Bloquer les inputs de type submit et button
  const inputs = document.querySelectorAll('input[type="submit"], input[type="button"]');
  for (const input of inputs) {
    if (isEnabled) {
      input.addEventListener('click', preventNavigation);
      input.disabled = true;
      input.style.cursor = 'not-allowed';
      input.style.opacity = '0.6';
    } else {
      input.removeEventListener('click', preventNavigation);
      input.disabled = false;
      input.style.cursor = 'pointer';
      input.style.opacity = '1';
    }
  }
}

// Fonction pour empêcher la navigation
function preventNavigation(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Observer les modifications du DOM pour bloquer les nouveaux liens
function setupMutationObserver(isEnabled) {
  if (window.mockifyObserver) {
    window.mockifyObserver.disconnect();
  }

  if (isEnabled) {
    window.mockifyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          blockAllInteractiveElements(true);
        }
      });
    });

    window.mockifyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Gérer l'affichage du message et le blocage des liens
function handleProtectionMessage(isEnabled) {
  let messageDiv = document.getElementById('mockify-protection-message');
  
  if (isEnabled) {
    if (!messageDiv) {
      messageDiv = createProtectionMessage();
      document.body.appendChild(messageDiv);
    }
    blockAllInteractiveElements(true);
    setupMutationObserver(true);
  } else {
    if (messageDiv) {
      messageDiv.remove();
    }
    blockAllInteractiveElements(false);
    setupMutationObserver(false);
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