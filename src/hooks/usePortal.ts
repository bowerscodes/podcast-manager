import { useLayoutEffect, useState } from 'react';

export function usePortal(id = 'portal-root'): HTMLElement | null {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  // Use useLayoutEffect to ensure portal is created before paint
  useLayoutEffect(() => {
    let element = document.getElementById(id);
    let created = false;

    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
      created = true;
    }

    setPortalElement(element);

    return () => {
      // Only remove if we created it AND it's empty
      // This prevents removing portals that other instances are using
      if (created && element && element.childNodes.length === 0) {
        element.remove();
      }
    };
  }, [id]);

  return portalElement;
}
