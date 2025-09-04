// hooks | libraries
import { ReactElement, useState } from "react";
import { MdBugReport } from "react-icons/md";

// hooks
import { usePWA, usePWAInstall, useOnlineStatus } from "../../utils/hooks/usePWA";

interface PWADebugProps {
  className?: string;
}

function PWADebug({ className = "" }: PWADebugProps): ReactElement | null {
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const { isSupported, isRegistered, updateAvailable } = usePWA();
  const { isInstallable, isInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Seulement en mode développement
  const isDev = (() => {
    try {
      return import.meta.env?.DEV || false;
    } catch {
      return false;
    }
  })();
  
  if (!isDev) {
    return null;
  }

  if (!showDebug) {
    return (
      <button
        className={`pwa-debug-toggle ${className}`}
        onClick={() => setShowDebug(true)}
        style={{
          background: 'rgba(255, 165, 0, 0.1)',
          border: '1px solid rgba(255, 165, 0, 0.3)',
          borderRadius: '8px',
          padding: '0.5em 0.75em',
          color: '#ff6b00',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          margin: '0.5em 0',
          fontSize: '0.8em'
        }}
      >
        <MdBugReport />
        <span>Debug PWA</span>
      </button>
    );
  }

  return (
    <div 
      className={`pwa-debug-panel ${className}`}
      style={{
        background: 'rgba(255, 165, 0, 0.1)',
        border: '1px solid rgba(255, 165, 0, 0.3)',
        borderRadius: '8px',
        padding: '1em',
        margin: '0.5em 0',
        fontSize: '0.8em',
        color: '#333'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
        <strong>🐛 Debug PWA</strong>
        <button 
          onClick={() => setShowDebug(false)}
          style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}
        >
          ❌
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5em', fontSize: '0.75em' }}>
        <div>PWA Support: {isSupported ? '✅' : '❌'}</div>
        <div>Service Worker: {isRegistered ? '✅' : '❌'}</div>
        <div>Is Installed: {isInstalled ? '✅' : '❌'}</div>
        <div>Is Installable: {isInstallable ? '✅' : '❌'}</div>
        <div>Online: {isOnline ? '✅' : '❌'}</div>
        <div>Update Available: {updateAvailable ? '⚠️' : '✅'}</div>
      </div>
      
      <div style={{ marginTop: '0.5em', fontSize: '0.7em', opacity: 0.7 }}>
        <div>Display Mode: {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}</div>
        <div>User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
      </div>
      
      <button
        onClick={() => {
          console.log('[PWA Debug] Full PWA State:', {
            isSupported,
            isRegistered,
            isInstalled,
            isInstallable,
            isOnline,
            updateAvailable,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            userAgent: navigator.userAgent
          });
        }}
        style={{
          background: '#ff6b00',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '0.25em 0.5em',
          marginTop: '0.5em',
          cursor: 'pointer',
          fontSize: '0.75em'
        }}
      >
        Log to Console
      </button>
    </div>
  );
}

export default PWADebug;