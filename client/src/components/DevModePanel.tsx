import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  activateDevMode,
  clearDevSession,
  hasDevSession,
  isDevMode,
  mockDataFunctions,
  setMockUserState
} from '@/lib/dev-mode';
import { getAuth, signOut } from 'firebase/auth';

const quickNavPages = [
  { name: 'Dashboard', path: '/' },
  { name: 'AI Chat', path: '/ai-chat' },
  { name: 'Resume', path: '/resume-templates' },
  { name: 'Skill Gap', path: '/skill-gap' },
  { name: 'Job Matching', path: '/job-matching' },
  { name: 'Market Trends', path: '/market-trends' }
];

const buttonStyle =
  'border border-gray-300 dark:border-white text-gray-800 dark:text-white bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs shadow-sm';

export default function DevModePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDevModeActive, setIsDevModeActive] = useState(hasDevSession());
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isDevMode() && !isDevModeActive) {
      activateDevMode().then((success) => {
        if (success) {
          setIsDevModeActive(true);
          console.log('[DEV MODE] Auto-activated development mode');
        }
      });
    }
  }, [isDevModeActive]);

  if (!isDevMode()) return null;

  const handleExitDevMode = () => {
    clearDevSession();
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = '/';
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOpen ? (
        <Button
          className="rounded-full bg-white-100 text-black font-bold border border-gray-300 shadow-md"
          onClick={() => setIsOpen(true)}
        >
          DEV MODE
        </Button>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg border border-yellow-500 max-w-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-black dark:text-white font-bold">Developer Mode</h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-black dark:text-white"
              onClick={() => setIsOpen(false)}
            >
              X
            </Button>
          </div>

          <div className="space-y-4">
            {/* Quick Navigation */}
            <div>
              <p className="text-black dark:text-white text-sm font-medium mb-2">Quick Navigation:</p>
              <div className="grid grid-cols-2 gap-1">
                {quickNavPages.map((page) => (
                  <Button
                    key={page.path}
                    variant="outline"
                    size="sm"
                    className={buttonStyle}
                    onClick={() => setLocation(page.path)}
                  >
                    {page.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mock Data */}
            <div>
              <p className="text-black dark:text-white text-sm font-medium mb-2">Simulate User State:</p>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${buttonStyle}`}
                  onClick={() => setMockUserState('free')}
                >
                  Free User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${buttonStyle}`}
                  onClick={() => setMockUserState('premium')}
                >
                  Paid User
                </Button>
              </div>
            </div>
            <div>
              <p className="text-black dark:text-white text-sm font-medium mb-2">Mock Data:</p>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${buttonStyle}`}
                  onClick={mockDataFunctions.prefillResume}
                >
                  Prefill Resume
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${buttonStyle}`}
                  onClick={mockDataFunctions.triggerSkillAnalysis}
                >
                  Auto-Run Skill Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${buttonStyle}`}
                  onClick={mockDataFunctions.clearMockData}
                >
                  Clear Mock Data
                </Button>
              </div>
            </div>

            {/* Debug Tools */}
            <div>
              <p className="text-black dark:text-white text-sm font-medium mb-2">Debug Tools:</p>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`w-full ${buttonStyle}`}
                  onClick={mockDataFunctions.logAuthState}
                >
                  Log Auth State
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleExitDevMode}
                >
                  Exit Dev Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}