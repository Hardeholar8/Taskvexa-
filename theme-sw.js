const VERSION='taskvexa-theme-v8';
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
// Theme is now handled directly by theme.js. Do not rewrite or intercept page HTML.
