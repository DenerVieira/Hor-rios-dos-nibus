const CACHE_NAME = 'bus-schedule-v1';
// Lista de arquivos que devem ser armazenados em cache
const urlsToCache = [
    '/',
    '/horario-onibus.html', // Seu arquivo principal
    '/manifest.json',
    // Ícones (se você seguiu a estrutura recomendada no manifest)
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    // Nota: O Tailwind e a fonte Inter são carregados via CDN.
    // O Service Worker pode ou não conseguir cacheadas, mas o app
    // ainda deve funcionar (apenas com estilo básico) se o cache falhar.
];

// Instalação: Cacheia os arquivos estáticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache aberto: Arquivos de base pré-cacheados.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch: Serve o conteúdo a partir do cache (Estratégia Cache-First)
self.addEventListener('fetch', (event) => {
    // Apenas intercepta requisições HTTP/HTTPS (ignora extensões, etc.)
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // Retorna o recurso do cache, se encontrado
                    if (response) {
                        return response;
                    }
                    // Caso contrário, busca na rede
                    return fetch(event.request).catch(() => {
                        // Se falhar na rede, pode retornar uma página offline, se você tiver uma.
                        // Como seu app é offline-first, a falha só deve ocorrer
                        // se o recurso não estiver na lista `urlsToCache`.
                        console.error('Falha ao buscar recurso na rede:', event.request.url);
                    });
                })
        );
    }
});