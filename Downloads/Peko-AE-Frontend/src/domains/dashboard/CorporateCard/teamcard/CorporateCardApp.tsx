import { useEffect, useRef } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import React from 'react';

/**
 * Renders the Corporate Card app in a completely isolated React root.
 * This avoids all context/router conflicts with Peko's BrowserRouter.
 * The inner app mounts after the container div is in the DOM.
 */
export default function CorporateCardApp() {
    const containerRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<ReactDOMClient.Root | null>(null);

    useEffect(() => {
        if (!containerRef.current || rootRef.current) return;

        // Dynamically import the full app to avoid any top-level module issues
        import('./inner/InnerApp').then(({ default: InnerApp }) => {
            if (containerRef.current && !rootRef.current) {
                rootRef.current = ReactDOMClient.createRoot(containerRef.current);
                rootRef.current.render(React.createElement(InnerApp));
            }
        }).catch(err => {
            if (containerRef.current) {
                containerRef.current.innerHTML = `
                    <div style="padding:24px;font-family:monospace;background:#fff1f0;border:1px solid #ff4d4f;border-radius:8px;margin:16px">
                        <strong style="color:#cf1322">Corporate Cards failed to load:</strong>
                        <pre style="margin-top:8px;white-space:pre-wrap;font-size:11px">${err?.message}\n${err?.stack}</pre>
                    </div>
                `;
            }
        });

        return () => {
            rootRef.current?.unmount();
            rootRef.current = null;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="tc-root"
            style={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}
        />
    );
}
