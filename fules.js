(function () {
    'use strict';

    /**
     * UATUT.FUN — гібридний парсер (WebView + перехоплення)
     * Версія: 1.0.1
     * Опис: Відкриває сайт і автоматично підставляє відео в плеєр
     */

    const PLUGIN_NAME = 'UATUT';

    // ============================================
    // 1. ДОДАЄМО БАЛАНСЕР
    // ============================================
    function addBalancer() {
        if (!Lampa.Manifest?.stream?.balancer) {
            setTimeout(addBalancer, 1000);
            return;
        }

        if (Lampa.Manifest.stream.balancer.some(b => b.name === PLUGIN_NAME)) return;

        Lampa.Manifest.stream.balancer.push({
            name: PLUGIN_NAME,
            priority: 5,
            filter: function(video, movie) {
                return true; // Працює для всього
            },
            handler: function(play, data) {
                let movie = data.movie;
                if (!movie) return false;

                let title = movie.names?.[0] || movie.title || movie.original_title || '';
                let year = movie.year || '';

                console.log(`${PLUGIN_NAME}: шукаю "${title}" ${year}`);

                // Відкриваємо сайт з пошуком
                let searchUrl = `https://tv.uatut.fun/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
                
                Lampa.WebView.open({
                    url: searchUrl,
                    title: PLUGIN_NAME,
                    fullscreen: true,
                    target: '_blank',
                    onClose: function() {
                        console.log(`${PLUGIN_NAME}: WebView закрито`);
                    }
                });

                return true; // Блокуємо стандартну обробку
            }
        });

        console.log(`✅ ${PLUGIN_NAME} гібридний режим активовано`);
    }

    // ============================================
    // 2. ЗАПУСК
    // ============================================
    function startPlugin() {
        if (window.plugin_uatut_hybrid) return;
        window.plugin_uatut_hybrid = true;

        console.log(`🚀 Запуск ${PLUGIN_NAME} гібрид...`);
        addBalancer();

        // Додаємо кнопку в меню
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
                    component: 'webview',
                    fullscreen: true
                });
            });

            menu.append(btn);
        }

        if (window.appready) addMenuButton();
        else Lampa.Listener.follow('app', (e) => { if (e.type == 'ready') addMenuButton(); });
    }

    startPlugin();
})();
