import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface WebViewProps {
  src: string;
  className?: string;
}

export interface WebViewRef {
  goBack: () => void;
  goForward: () => void;
  reload: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  getURL: () => string;
  getTitle: () => string;
  getMainContent: () => Promise<string | null>;
}

export const WebView = forwardRef<WebViewRef, WebViewProps & { onPageLoad?: (url: string, title: string, favicon?: string) => void }>(({ src, className = '', onPageLoad }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  useImperativeHandle(ref, () => ({
    goBack: () => {
      try {
        if (webviewRef.current && isReady) {
          // Prefer built-in API
          if (typeof webviewRef.current.goBack === 'function') {
            webviewRef.current.goBack();
            return;
          }
          // Fallback to history.back()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          webviewRef.current.executeJavaScript && webviewRef.current.executeJavaScript('history.back()');
        }
      } catch (e) {
        console.error('goBack fallback failed:', e);
      }
    },
    goForward: () => {
      try {
        if (webviewRef.current && isReady) {
          // Prefer built-in API
          if (typeof webviewRef.current.goForward === 'function') {
            webviewRef.current.goForward();
            return;
          }
          // Fallback to history.forward()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          webviewRef.current.executeJavaScript && webviewRef.current.executeJavaScript('history.forward()');
        }
      } catch (e) {
        console.error('goForward fallback failed:', e);
      }
    },
    reload: () => {
      if (webviewRef.current && isReady) {
        webviewRef.current.reload();
      }
    },
    canGoBack: () => {
      try {
        return webviewRef.current && isReady && typeof webviewRef.current.canGoBack === 'function' ? webviewRef.current.canGoBack() : false;
      } catch (e) {
        console.error('canGoBack check failed:', e);
        return false;
      }
    },
    canGoForward: () => {
      try {
        return webviewRef.current && isReady && typeof webviewRef.current.canGoForward === 'function' ? webviewRef.current.canGoForward() : false;
      } catch (e) {
        console.error('canGoForward check failed:', e);
        return false;
      }
    },
    getURL: () => {
      return webviewRef.current && isReady ? webviewRef.current.getURL() : '';
    },
    getTitle: () => {
      return webviewRef.current && isReady ? webviewRef.current.getTitle() : '';
    },
    // Execute JS inside the webview to extract the main content text
    getMainContent: async () => {
      try {
        if (!webviewRef.current || !isReady) return null;

        const script = `
          (function() {
            try {
              // Prefer an element with id or class 'mainContent'
              var el = document.querySelector('#mainContent') || document.querySelector('.mainContent') || document.getElementById('mainContent') || document.body;
              if (!el) return '';
              // Return visible text only
              return (el.innerText || el.textContent || '').toString();
            } catch (e) {
              return '';
            }
          })();
        `;

        // executeJavaScript returns a Promise with the result
        // Some pages may block execution; guard with try/catch
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const result = await webviewRef.current.executeJavaScript(script);
        if (!result) return null;
        // Normalize whitespace and trim
        return String(result).replace(/\s{2,}/g, ' ').trim();
      } catch (error) {
        console.error('Error extracting mainContent from webview:', error);
        return null;
      }
    },
  }), [isReady]);

  useEffect(() => {
    if (containerRef.current && !webviewRef.current) {
      // Create webview element only once
      const webview = document.createElement('webview') as Electron.WebviewTag;
      webviewRef.current = webview;

      // Set attributes
      webview.style.width = '100%';
      webview.style.height = '100%';
      webview.style.border = 'none';
      webview.setAttribute('webpreferences', 'webSecurity=yes,allowRunningInsecureContent=no,contextIsolation=no,nodeIntegration=no,devTools=yes');
      webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      // Enable text selection and clipboard operations
      webview.addEventListener('dom-ready', () => {
        // Inject CSS to ensure text is selectable
        webview.insertCSS(`
          * {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }

          /* Ensure text selection works on all elements */
          body, p, div, span, h1, h2, h3, h4, h5, h6, a, li, td, th {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }

          /* Remove any CSS that might prevent selection */
          * {
            -webkit-touch-callout: default !important;
            -webkit-user-drag: auto !important;
          }
        `);

        // Enable right-click context menu for copy operations
        webview.executeJavaScript(`
          document.addEventListener('contextmenu', function(e) {
            // Allow default context menu for text selection
            return true;
          });

          // Ensure clipboard API is available
          if (navigator.clipboard) {
            console.log('Clipboard API available');
          } else {
            console.log('Clipboard API not available, using fallback');
          }
        `);
      });

      // Set up event listeners
      const handleDomReady = () => {
        console.log('WebView DOM ready for:', src);
        setIsReady(true);
      };

      const handleLoadCommit = (event: any) => {
        console.log('WebView load commit:', event.url);
        // Call onPageLoad callback when page loads
        if (onPageLoad && event.url) {
          // Get title and favicon after a short delay to ensure it's loaded
          setTimeout(() => {
            try {
              const title = webview.getTitle() || '';
              console.log('Extracted title:', title);

              // Extract favicon using JavaScript execution
              webview.executeJavaScript(`
                (function() {
                  try {
                    // Try multiple favicon selectors
                    const selectors = [
                      'link[rel="icon"]',
                      'link[rel="shortcut icon"]',
                      'link[rel="apple-touch-icon"]',
                      'link[rel="apple-touch-icon-precomposed"]'
                    ];

                    for (const selector of selectors) {
                      const link = document.querySelector(selector);
                      if (link && link.href) {
                        console.log('Found favicon:', link.href);
                        return link.href;
                      }
                    }

                    // Fallback to default favicon location
                    const url = new URL(window.location.href);
                    const defaultFavicon = url.origin + '/favicon.ico';
                    console.log('Using default favicon:', defaultFavicon);
                    return defaultFavicon;
                  } catch (e) {
                    console.error('Error in favicon extraction:', e);
                    return null;
                  }
                })();
              `).then((favicon: string | null) => {
                console.log('Calling onPageLoad with:', event.url, title, favicon);
                onPageLoad(event.url, title, favicon || undefined);
              }).catch((error: any) => {
                console.error('Error extracting favicon:', error);
                console.log('Calling onPageLoad with title only:', event.url, title);
                onPageLoad(event.url, title, undefined);
              });
            } catch (error) {
              console.error('Error getting title:', error);
              onPageLoad(event.url, '', undefined);
            }
          }, 1500); // Increased delay for SPA loading
        }
      };

      const handleDidFailLoad = (event: any) => {
        console.error('WebView failed to load:', event.errorDescription);
      };

      const handleWillDownload = async (event: any, item: any) => {
        console.log('Download started:', item.getFilename(), item.getTotalBytes());

        // Prevent default download behavior
        event.preventDefault();

        // Get download details
        const filename = item.getFilename();
        const totalBytes = item.getTotalBytes();
        const url = item.getURL();

        try {
          // Show save dialog to user
          const result = await (window as any).electronAPI.showSaveDialog({
            title: 'Save Download',
            defaultPath: filename,
            filters: [
              { name: 'All Files', extensions: ['*'] }
            ]
          });

          if (result.canceled) {
            console.log('Download cancelled by user');
            item.cancel();

            // Add cancelled download to history
            if ((window as any).electronAPI && (window as any).electronAPI.addDownloadEntry) {
              (window as any).electronAPI.addDownloadEntry({
                filename,
                url,
                fileSize: totalBytes,
                filePath: '',
                status: 'cancelled'
              });
            }
            return;
          }

          const savePath = result.filePath;

          // Set the save path for the download
          item.setSavePath(savePath);

          // Track download progress
          item.on('updated', (event: any, state: string) => {
            if (state === 'progressing') {
              if (item.isPaused()) {
                console.log('Download paused');
              } else {
                const received = item.getReceivedBytes();
                const total = item.getTotalBytes();
                const progress = total > 0 ? (received / total) * 100 : 0;
                console.log(`Download progress: ${progress.toFixed(2)}%`);
              }
            }
          });

          item.once('done', (event: any, state: string) => {
            if (state === 'completed') {
              console.log('Download completed successfully');

              // Add completed download to history
              if ((window as any).electronAPI && (window as any).electronAPI.addDownloadEntry) {
                (window as any).electronAPI.addDownloadEntry({
                  filename,
                  url,
                  fileSize: totalBytes,
                  filePath: savePath,
                  status: 'completed'
                });
              }
            } else {
              console.log('Download failed:', state);

              // Add failed download to history
              if ((window as any).electronAPI && (window as any).electronAPI.addDownloadEntry) {
                (window as any).electronAPI.addDownloadEntry({
                  filename,
                  url,
                  fileSize: totalBytes,
                  filePath: savePath,
                  status: 'failed'
                });
              }
            }
          });

          // Resume the download with the chosen path
          item.resume();

        } catch (error) {
          console.error('Error handling download:', error);
          item.cancel();

          // Add failed download to history
          if ((window as any).electronAPI && (window as any).electronAPI.addDownloadEntry) {
            (window as any).electronAPI.addDownloadEntry({
              filename,
              url,
              fileSize: totalBytes,
              filePath: '',
              status: 'failed'
            });
          }
        }
      };

      const handlePageTitleUpdated = (event: any) => {
        console.log('Page title updated:', event.title);
        // Update title in real-time when it changes
        if (onPageLoad && event.title) {
          const url = webview.getURL();
          // Extract favicon again in case it changed
          webview.executeJavaScript(`
            (function() {
              const favicon = document.querySelector('link[rel="icon"]') ||
                             document.querySelector('link[rel="shortcut icon"]') ||
                             document.querySelector('link[rel="apple-touch-icon"]');
              if (favicon) {
                return favicon.href;
              }
              // Fallback to default favicon location
              const url = new URL(window.location.href);
              return url.origin + '/favicon.ico';
            })();
          `).then((favicon: string) => {
            onPageLoad(url, event.title, favicon);
          }).catch((error: any) => {
            console.error('Error extracting favicon on title update:', error);
            onPageLoad(url, event.title);
          });
        }
      };

      webview.addEventListener('dom-ready', handleDomReady);
      webview.addEventListener('load-commit', handleLoadCommit);
      webview.addEventListener('page-title-updated', handlePageTitleUpdated);
      webview.addEventListener('did-fail-load', handleDidFailLoad);
      (webview as any).addEventListener('will-download', handleWillDownload);

      // Clear container and append webview
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(webview);

      return () => {
        if (containerRef.current && containerRef.current.contains(webview)) {
          containerRef.current.removeChild(webview);
        }
        webviewRef.current = null;
        setIsReady(false);
      };
    }
  }, []); // Only run once to create the webview

  useEffect(() => {
    if (webviewRef.current && src && isReady) {
      // Check if the current URL is different from the new src
      const currentUrl = webviewRef.current.getURL();
      if (currentUrl !== src) {
        console.log('Loading new URL in WebView:', src);
        // Load new URL without recreating the webview
        webviewRef.current.loadURL(src);
      }
    } else if (webviewRef.current && src && !isReady) {
      console.log('Setting initial src in WebView:', src);
      // Set initial src if webview is created but not ready yet
      webviewRef.current.src = src;
    }
  }, [src, isReady]);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} />
  );
});
