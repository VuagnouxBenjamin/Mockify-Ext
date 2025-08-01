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

// Bloquer tous les éléments interactifs de la page selon les paramètres
function blockAllInteractiveElements(isEnabled, settings) {
  if (!isEnabled) {
    // Si la protection est désactivée, tout débloquer
    unblockAll();
    return;
  }

  // Bloquer les liens si activé dans les paramètres
  if (settings.blockLinks) {
    const regularLinks = document.querySelectorAll('a:not(.btn)');
    for (const link of regularLinks) {
      link.addEventListener('click', preventNavigation);
      link.style.cursor = 'not-allowed';
    }
  }

  // Bloquer les inputs de type submit si activé dans les paramètres
  if (settings.blockSubmit) {
    const submits = document.querySelectorAll('input[type="submit"]');
    for (const submit of submits) {
      submit.addEventListener('click', preventNavigation);
      submit.disabled = true;
      submit.style.cursor = 'not-allowed';
    }
  }

  // Bloquer les inputs de type button et les liens-boutons si activé dans les paramètres
  if (settings.blockButton) {
    const buttons = document.querySelectorAll('input[type="button"], button, a.btn');
    for (const button of buttons) {
      button.addEventListener('click', preventNavigation);
      if (button.tagName.toLowerCase() !== 'a') {
        button.disabled = true;
      }
      button.style.cursor = 'not-allowed';
      // Empêcher aussi les événements de souris pour les liens-boutons
      if (button.tagName.toLowerCase() === 'a') {
        button.addEventListener('mousedown', preventNavigation);
        button.addEventListener('mouseup', preventNavigation);
      }
    }
  }
}

// Fonction pour débloquer tous les éléments
function unblockAll() {
  // Débloquer les liens réguliers
  const regularLinks = document.querySelectorAll('a:not(.btn)');
  for (const link of regularLinks) {
    link.removeEventListener('click', preventNavigation);
    link.style.cursor = 'pointer';
  }

  // Débloquer les inputs de type submit
  const submits = document.querySelectorAll('input[type="submit"]');
  for (const submit of submits) {
    submit.removeEventListener('click', preventNavigation);
    submit.disabled = false;
    submit.style.cursor = 'pointer';
  }

  // Débloquer les inputs de type button, les boutons et les liens-boutons
  const buttons = document.querySelectorAll('input[type="button"], button, a.btn');
  for (const button of buttons) {
    button.removeEventListener('click', preventNavigation);
    button.removeEventListener('mousedown', preventNavigation);
    button.removeEventListener('mouseup', preventNavigation);
    if (button.tagName.toLowerCase() !== 'a') {
      button.disabled = false;
    }
    button.style.cursor = 'pointer';
  }
}

// Fonction pour empêcher la navigation
function preventNavigation(event) {
  event.preventDefault();
  event.stopPropagation();
}

// Observer les modifications du DOM pour bloquer les nouveaux liens
function setupMutationObserver(isEnabled, settings) {
  if (window.mockifyObserver) {
    window.mockifyObserver.disconnect();
  }

  if (isEnabled) {
    window.mockifyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          blockAllInteractiveElements(true, settings);
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
function handleProtectionMessage(isEnabled, settings) {
  let messageDiv = document.getElementById('mockify-protection-message');
  
  if (isEnabled) {
    if (!messageDiv) {
      messageDiv = createProtectionMessage();
      document.body.appendChild(messageDiv);
    }
    blockAllInteractiveElements(true, settings);
    setupMutationObserver(true, settings);
  } else {
    if (messageDiv) {
      messageDiv.remove();
    }
    blockAllInteractiveElements(false, settings);
    setupMutationObserver(false, settings);
  }
}

// Écouter les changements d'état de la protection et des paramètres
chrome.storage.local.get([
  'protectionEnabled',
  'blockLinks',
  'blockSubmit',
  'blockButton'
], function(result) {
  const settings = {
    blockLinks: result.blockLinks !== false,
    blockSubmit: result.blockSubmit !== false,
    blockButton: result.blockButton !== false
  };
  handleProtectionMessage(result.protectionEnabled || false, settings);
});

// Écouter les mises à jour de l'état et des paramètres
chrome.storage.onChanged.addListener(function(changes) {
  chrome.storage.local.get([
    'protectionEnabled',
    'blockLinks',
    'blockSubmit',
    'blockButton'
  ], function(result) {
    const settings = {
      blockLinks: result.blockLinks !== false,
      blockSubmit: result.blockSubmit !== false,
      blockButton: result.blockButton !== false
    };
    
    if (changes.protectionEnabled) {
      handleProtectionMessage(changes.protectionEnabled.newValue, settings);
    } else if (changes.blockLinks || changes.blockSubmit || changes.blockButton) {
      handleProtectionMessage(result.protectionEnabled || false, settings);
    }
  });
});