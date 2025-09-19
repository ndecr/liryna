// Script d'urgence pour désactiver le Service Worker
// À inclure temporairement dans index.html pour tester si le SW cause le problème

console.log('[DEBUG] Désactivation du Service Worker...');

if ('serviceWorker' in navigator) {
  // Désinscrire tous les Service Workers
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('[DEBUG] Service Workers trouvés:', registrations.length);
    
    for(let registration of registrations) {
      console.log('[DEBUG] Désinscription de:', registration.scope);
      registration.unregister().then(function(success) {
        if (success) {
          console.log('[DEBUG] Service Worker désinscrit avec succès');
        } else {
          console.log('[DEBUG] Échec de la désinscription du Service Worker');
        }
      });
    }
  }).catch(function(error) {
    console.error('[DEBUG] Erreur lors de la désinscription:', error);
  });

  // Empêcher l'enregistrement de nouveaux Service Workers
  const originalRegister = navigator.serviceWorker.register;
  navigator.serviceWorker.register = function() {
    console.log('[DEBUG] Tentative d\'enregistrement SW bloquée');
    return Promise.reject(new Error('Service Worker disabled for debugging'));
  };
}

console.log('[DEBUG] Service Worker désactivé pour cette session');