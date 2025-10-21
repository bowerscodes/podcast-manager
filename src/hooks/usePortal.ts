import { useEffect, useState } from 'react';

export function usePortal(id = 'portal-root'): HTMLElement | null {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }

    setPortalElement(element);

    return () => {
      // Only remove if empty (pther portals might be using it)
      if (element && element.childNodes.length === 0) {
        element.remove();
      }
    };
  }, [id]);

  return portalElement;
}
