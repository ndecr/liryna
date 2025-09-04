// Utilitaire pour désinstaller le Service Worker en développement
// À exécuter dans la console du navigateur ou via un script

async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`Found ${registrations.length} service worker(s)`);
      
      for (const registration of registrations) {
        console.log('Unregistering service worker:', registration.scope);
        const success = await registration.unregister();
        console.log('Unregistration result:', success);
      }
      
      // Vider tous les caches
      const cacheNames = await caches.keys();
      console.log(`Found ${cacheNames.length} cache(s)`);
      
      for (const cacheName of cacheNames) {
        console.log('Deleting cache:', cacheName);
        await caches.delete(cacheName);
      }
      
      console.log('✅ All service workers and caches cleared!');
      console.log('🔄 Please refresh the page to complete the cleanup.');
      
      // Optionnel: recharger automatiquement
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  } else {
    console.log('Service Workers not supported');
  }
}

// Exécuter automatiquement si ce script est chargé
unregisterServiceWorker();