// ============================================
// ДІАГНОСТИЧНИЙ ПЛАГІН - тестове відео
// ============================================
(function() {
    if (window.test_video_plugin_loaded) return;
    window.test_video_plugin_loaded = true;

    console.log('🔧 Діагностичний плагін запущено');

    function initTestPlugin() {
        console.log('Слухаємо події...');

        Lampa.Listener.follow('full', function(event) {
            if (event && event.type === 'movie') {
                console.log('Відкрито фільм, чекаємо 2 секунди...');
                
                setTimeout(function() {
                    // Шукаємо контейнер постера
                    var poster = document.querySelector('.full-start__poster');
                    
                    if (poster) {
                        console.log('✅ Знайдено постер, вставляємо ТЕСТОВЕ відео');
                        
                        // Вставляємо ЗАВІДОМО РОБОЧЕ відео
                        poster.innerHTML = `
                            <div style="
                                position: relative;
                                width: 100%;
                                padding-bottom: 56.25%;
                                background: #000;
                            ">
                                <iframe
                                    style="
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                    "
                                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0"
                                    frameborder="0"
                                    allowfullscreen
                                ></iframe>
                                <div style="
                                    position: absolute;
                                    bottom: 10px;
                                    left: 10px;
                                    background: red;
                                    color: white;
                                    padding: 5px;
                                    z-index: 999;
                                ">
                                    🎬 ТЕСТОВЕ ВІДЕО (не цізер)
                                </div>
                            </div>
                        `;
                    } else {
                        console.log('❌ Постер не знайдено! Селектор .full-start__poster не працює');
                        // Спробуємо інші селектори
                        var allPosters = document.querySelectorAll('[class*="poster"]');
                        console.log('Знайдені елементи з "poster" в класі:', allPosters.length);
                    }
                }, 2000);
            }
        });
    }

    // Запуск
    if (window.Lampa) {
        initTestPlugin();
    } else {
        window.addEventListener('load', function() {
            setTimeout(initTestPlugin, 3000);
        });
    }
})();
