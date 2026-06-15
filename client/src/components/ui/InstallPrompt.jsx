import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [prompt, setPrompt]   = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === 'accepted') {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-50">
      <div className="card p-4 shadow-lifted border-violet-200 bg-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            🏛️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900">Install CivicApp</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Add to your home screen for the best experience
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-slate-600 text-lg flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setVisible(false)}
            className="btn-secondary text-xs flex-1 py-2"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="btn-primary text-xs flex-1 py-2"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;