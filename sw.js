/* Cenník — service worker
   ------------------------------------------------------------
   Stratégia: appka sa vždy načíta okamžite z cache (aj bez signálu),
   na pozadí sa medzitým stiahne aktuálna verzia do cache. O tom, že
   je k dispozícii novšia verzia, rozhoduje samotná appka — porovná
   svoje APP_VERSION s tým, čo je na serveri, a ponúkne aktualizáciu.
   ------------------------------------------------------------ */
const CACHE = "cennik-shell-v1";
const SHELL = ["./", "./index.html"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Cudzie servery (GitHub API, CDN) nechávame úplne na pokoji.
  if (url.origin !== self.location.origin) return;

  // Kontrola verzie si výslovne pýta čerstvý súbor — cache obchádzame.
  if (url.searchParams.has("nocache")) return;

  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: false });

    const fromNetwork = fetch(req).then(res => {
      if (res && res.ok && res.type === "basic") {
        caches.open(CACHE).then(c => c.put(req, res.clone())).catch(() => {});
      }
      return res;
    }).catch(() => null);

    if (cached) return cached;                    // okamžite, aj offline

    const net = await fromNetwork;
    if (net) return net;

    // Posledná záchrana: pri navigácii vrátime uloženú appku.
    if (req.mode === "navigate") {
      const shell = await caches.match("./index.html") || await caches.match("./");
      if (shell) return shell;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  })());
});
