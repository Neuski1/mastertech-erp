import { useEffect } from 'react';

/**
 * Keep a list/board screen current without the user hitting refresh.
 *
 * Behaviour:
 *   - Polls `refresh` on an interval (default 30s) while the tab is visible.
 *   - Refreshes immediately when the tab/window regains focus.
 *   - Stops polling entirely while the tab is hidden (idle browsers stay quiet).
 *   - SKIPS a refresh while the user is typing in a field or has a dropdown /
 *     editor focused, so a background reload can never wipe an in-progress edit.
 *     These screens use uncontrolled inputs that save on blur, so re-rendering
 *     mid-edit would discard what was typed.
 *
 * `refresh` should be a stable useCallback that does a QUIET reload (no loading
 * spinner), otherwise the screen will flash on every poll.
 */
export default function useAutoRefresh(refresh, intervalMs = 30000) {
  useEffect(() => {
    if (typeof refresh !== 'function') return undefined;

    const isEditing = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = (el.tagName || '').toUpperCase();
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
    };

    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      if (isEditing()) return; // never clobber an in-progress edit
      Promise.resolve(refresh()).catch(() => {});
    };

    let timer = null;
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const start = () => { stop(); timer = setInterval(tick, intervalMs); };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') { tick(); start(); } else { stop(); }
    };
    const onFocus = () => tick();

    start();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh, intervalMs]);
}
