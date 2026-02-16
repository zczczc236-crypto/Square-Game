// ===============================
// NEON DODGE - FINAL STABLE SW
// ===============================

const CACHE_VERSION = "neon-dodge-v3";
const CACHE_NAME = CACHE_VERSION;

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// ===============================
// 설치
// ===============================
self.addEventListener("install", event => {
  console.log("SW: Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("SW: Caching files");
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // 바로 새 SW 활성화
  );
});

// ===============================
// 활성화 (이전 캐시 제거)
// ===============================
self.addEventListener("activate", event => {
  console.log("SW: Activating...");

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("SW: Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // 바로 페이지 제어
  );
});

// ===============================
// 요청 처리 (Cache First 전략)
// ===============================
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        return caches.match("./index.html");
      })
  );
});
