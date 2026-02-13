(function () {
    'use strict';

    /**
     * UATUT.FUN — універсальний парсер
     * Версія: 1.0.0
     * Опис: Автоматичний пошук відео на tv.uatut.fun для будь-якого фільму/серіалу
     */

    const PLUGIN_NAME = 'UATUT';
    const SEARCH_URL = 'https://tv.uatut.fun/index.php?do=search&subaction=search&story=';

    // ============================================
    // 1. ДОДАЄМО БАЛАНСЕР У СИСТЕМУ LAMPA
    // ============================================
    function addBalancer() {
        if (!Lampa.Manifest?.stream?.balancer) {
            setTimeout(addBalancer, 1000);
            return;
        }

        if (Lampa.Manifest.stream.balancer.some(b => b.name === PLUGIN_NAME)) {
            console.log(`✅ ${PLUGIN_NAME} вже додано`);
            return;
        }

        Lampa.Manifest.stream.balancer.push({
            name: PLUGIN_NAME,
            priority: 3,
            filter: function(video, movie) {
                return true; // Працює для всього
            },
            handler: async function(play, data) {
                console.log(`🔍 ${PLUGIN_NAME} шукає:`, data.movie?.names?.[0] || data.movie?.title);
                
                try {
                    const streamUrl = await findVideoOnUatut(data.movie);
                    if (streamUrl) {
                        play({
                            url: streamUrl,
                            title: `${PLUGIN_NAME} • знайдено`,
                            method: 'play'
                        });
                        return true;
                    }
                } catch (e) {
                    console.error(`${PLUGIN_NAME} помилка:`, e);
                }
                return false;
            }
        });

        console.log(`🔥 ${PLUGIN_NAME} балансер активовано!`);
    }

    // ============================================
    // 2. ПОШУК ВІДЕО НА UATUT.FUN
    // ============================================
    async function findVideoOnUatut(movie) {
        if (!movie) return null;

        // Отримуємо назву
        let title = movie.names?.[0] || movie.title || movie.original_title || '';
        let year = movie.year || '';
        let imdb = movie.imdb_id || '';

        if (!title) return null;

        // Формуємо пошуковий запит
        let searchQuery = encodeURIComponent(title);
        let searchUrl = SEARCH_URL + searchQuery;

        console.log(`🌐 Запит до UATUT: ${searchUrl}`);

        try {
            // Завантажуємо сторінку пошуку
            let html = await fetch(searchUrl).then(r => r.text());
            
            // Шукаємо перше посилання на фільм/серіал
            let match = html.match(/<a[^>]+href="([^"]+)"[^>]*class="title"[^>]*>(.*?)<\/a>/i);
            
            if (!match) {
                // Альтернативний пошук
                match = html.match(/<div[^>]*class="short"[^>]*>.*?<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/is);
            }

            if (!match) {
                console.log(`❌ Нічого не знайдено на UATUT`);
                return null;
            }

            let moviePageUrl = match[1];
            if (!moviePageUrl.startsWith('http')) {
                moviePageUrl = 'https://tv.uatut.fun' + moviePageUrl;
            }

            console.log(`📄 Сторінка фільму: ${moviePageUrl}`);

            // Завантажуємо сторінку фільму
            let movieHtml = await fetch(moviePageUrl).then(r => r.text());

            // ШУКАЄМО M3U8 ПОТІК (найважливіше!)
            let streamUrl = extractM3U8(movieHtml);
            
            if (streamUrl) {
                console.log(`✅ Знайдено M3U8: ${streamUrl}`);
                return streamUrl;
            }

            // Якщо не знайшли — шукаємо iframe плеєра
            let iframeMatch = movieHtml.match(/<iframe[^>]+src=["']([^"']*\.(?:m3u8|mp4)[^"']*)["']/i);
            if (iframeMatch) {
                return iframeMatch[1];
            }

            // Шукаємо будь-яке відео
            let videoMatch = movieHtml.match(/"(https?:\/\/[^"]+\.(?:m3u8|mp4)[^"]*)"/i);
            if (videoMatch) {
                return videoMatch[1];
            }

        } catch (e) {
            console.error(`${PLUGIN_NAME} помилка пошуку:`, e);
        }

        return null;
    }

    // ============================================
    // 3. ЕКСТРАКТОР M3U8
    // ============================================
    function extractM3U8(html) {
        // Шаблони для пошуку m3u8
        const patterns = [
            /"(https?:\/\/[^"]+\.m3u8[^"]*)"/i,
            /'(https?:\/\/[^']+\.m3u8[^']*)'/i,
            /src=["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /file["']?\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /url["']?\s*:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
            /<(?:video|source)[^>]+src=["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i
        ];

        for (let pattern of patterns) {
            let match = html.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    // ============================================
    // 4. ЗАПУСК ПЛАГІНА
    // ============================================
    function startPlugin() {
        if (window.plugin_uatut_ready) return;
        window.plugin_uatut_ready = true;

        console.log(`🚀 Запуск ${PLUGIN_NAME} парсера...`);

        // Додаємо балансер
        addBalancer();

        // Додаємо кнопку в меню (опціонально)
        function addMenuButton() {
            let menu = $('.menu .menu__list').eq(0);
            if (!menu.length) return;
            if (menu.find('.menu__item[data-sid="uatut"]').length) return;

            let btn = $(`<li class="menu__item selector" data-sid="uatut">
                <div class="menu__ico">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 6h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>
                    </svg>
                </div>
                <div class="menu__text">UATUT</div>
            </li>`);

            btn.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: 'https://tv.uatut.fun/',
                    title: 'UATUT',
                    component: 'webview'
                });
            });

            menu.append(btn);
        }

        if (window.appready) addMenuButton();
        else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') addMenuButton(); });

        setInterval(addMenuButton, 4000);
    }

    startPlugin();
})();
