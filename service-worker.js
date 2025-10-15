// Nome do cache
const CACHE_NAME = 'bus-schedule-cache-v1';

// Arquivos essenciais que o Service Worker deve armazenar em cache
const urlsToCache = [
    '/', // O root da aplicação
    'horarios_dos_onibus_offline.html',
    'manifest.json',
    'service-worker.js' // O próprio Service Worker
    // Nota: Os ícones do manifest são URLs de placeholder, mas em uma app real você os incluiria aqui.
];

// Instalação: Armazena todos os assets estáticos no cache
self.addEventListener('install', event => {
    // Força o Service Worker a ativar imediatamente
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto com sucesso. Arquivos cacheados.');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativação: Limpa caches antigos (para quando você atualizar a versão do app)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Deleta caches que não estão na whitelist
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Busca: Estratégia "Cache-First" (servir do cache se possível)
self.addEventListener('fetch', event => {
    // Intercepta todas as requisições
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se o recurso estiver no cache, retorna o cache
                if (response) {
                    return response;
                }
                // Caso contrário, faz a requisição na rede
                return fetch(event.request);
            })
    );
});
