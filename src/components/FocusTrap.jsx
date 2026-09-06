import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function FocusTrap({ children }) {
  const containerRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    previouslyFocusedRef.current = document.activeElement;

    const getFocusable = () =>
      [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(el => el.offsetParent !== null);

    // Move focus into the modal on open
    const initialFocus = getFocusable()[0];
    if (initialFocus) initialFocus.focus();

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element on close
      if (previouslyFocusedRef.current && previouslyFocusedRef.current.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

FocusTrap.propTypes = {
  children: PropTypes.node.isRequired
};