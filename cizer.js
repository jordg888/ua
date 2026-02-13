// ============================================
// Плагін: Cizari замість постера (виправлена версія)
// Автор: Твоє Ім'я
// Версія: 1.1
// ============================================

(function() {
    if (window.plugin_cizer_fixed_ready) return;
    window.plugin_cizer_fixed_ready = true;

    console.log('🔄 Завантаження плагіна цізерів (виправлена версія)...');

    // Безпечна реєстрація плагіна
    if (typeof Lampa !== 'undefined' && Lampa.Manifest) {
        Lampa.Manifest.plugins.push({
            name: "Цізери замість постера",
            version: "1.1",
            author: "Твоє Ім'я",
            description: "Показує цізери/трейлери замість постера",
            icon: "https://cdn-icons-png.flaticon.com/512/1946/1946482.png",
            id: "cizer_plugin_fixed"
        });
    }

    // Головна функція
    function initPlugin() {
        console.log('🎬 Плагін активовано, слухаємо події...');

        if (!Lampa || !Lampa.Listener) {
            console.error('Lampa не доступна!');
            return;
        }

        // Слухаємо подію відкриття картки
        Lampa.Listener.follow('full', function(event) {
            // Перевіряємо, чи це фільм і чи є дані
            if (event && event.type === 'movie' && event.data) {
                console.log('Знайдено фільм:', event.data.title);
                
                // Чекаємо на рендер DOM
                setTimeout(function() {
                    findAndReplacePoster(event.data);
                }, 800); // Збільшено затримку
            }
        });
    }

    // Функція пошуку та заміни постера
    function findAndReplacePoster(movieData) {
        // Розширений список селекторів
        var posterSelectors = [
            '.full-start__poster',
            '.full-start__poster .poster',
            '.movie-poster',
            '.poster--big',
            '.media-poster',
            '.full-start [data-poster]',
            '.card-poster'
        ];

        var posterContainer = null;
        for (var i = 0; i < posterSelectors.length; i++) {
            posterContainer = document.querySelector(posterSelectors[i]);
            if (posterContainer) {
                console.log('Знайдено контейнер:', posterSelectors[i]);
                break;
            }
        }

        if (!posterContainer) {
            console.log('Контейнер постера не знайдено');
            return;
        }

        // Зберігаємо оригінальний вміст та батька
        var originalHTML = posterContainer.innerHTML;
        var parentElement = posterContainer.parentNode;

        // Показуємо заглушку завантаження
        showLoadingPlaceholder(posterContainer, movieData);

        // Шукаємо відео
        searchForCizer(movieData)
            .then(function(videoInfo) {
                if (videoInfo && videoInfo.videoId) {
                    embedVideoPlayer(parentElement, videoInfo.videoId);
                } else {
                    console.log('Відео не знайдено, повертаємо постер');
                    restoreOriginalPoster(parentElement, originalHTML);
                }
            })
            .catch(function(error) {
                console.error('Помилка пошуку:', error);
                restoreOriginalPoster(parentElement, originalHTML);
            });
    }

    // Індикатор завантаження
    function showLoadingPlaceholder(container, movieData) {
        if (!container) return;
        
        container.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                min-height: 250px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1e1e2f, #2a2a40);
                color: white;
                border-radius: 12px;
                text-align: center;
                padding: 20px;
                box-sizing: border-box;
            ">
                <div>
                    <div style="font-size: 40px; margin-bottom: 10px;">🎬</div>
                    <div>Шукаємо цізер для:</div>
                    <div style="font-weight: bold; margin-top: 5px;">${movieData.title || ''}</div>
                    <div style="font-size: 12px; margin-top: 15px; opacity: 0.7;">зачекайте...</div>
                </div>
            </div>
        `;
    }

    // Пошук відео через публічне API (з обходом CORS)
    function searchForCizer(movieData) {
        return new Promise(function(resolve, reject) {
            var title = movieData.title || '';
            var year = movieData.year || '';
            var query = encodeURIComponent(title + ' ' + year + ' trailer');

            // Використовуємо публічний проксі-сервіс для обходу CORS
            var proxyUrl = 'https://api.allorigins.win/raw?url=';
            var searchApi = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=' + query + '&type=video&key=AIzaSyA_1z1Pk2vBQlE9lB7KkUeJ0lFgVzW6nX8'; // Публічний тестовий ключ (обмежений)

            // Використовуємо публічний API YouTube через JSONP (обходить CORS)
            var script = document.createElement('script');
            var callbackName = 'youtube_callback_' + Date.now();
            
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                
                if (data && data.items && data.items.length > 0) {
                    var videoId = data.items[0].id.videoId;
                    console.log('Знайдено відео:', data.items[0].snippet.title);
                    resolve({ videoId: videoId });
                } else {
                    reject('No videos found');
                }
            };

            script.src = 'https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=' + query + '&type=video&key=AIzaSyA_1z1Pk2vBQlE9lB7KkUeJ0lFgVzW6nX8&callback=' + callbackName;
            document.body.appendChild(script);

            // Таймаут на випадок помилки
            setTimeout(function() {
                if (window[callbackName]) {
                    window[callbackName] = function(){};
                    delete window[callbackName];
                    reject('Timeout');
                }
            }, 10000);
        });
    }

    // Вставка відеоплеєра
    function embedVideoPlayer(parentElement, videoId) {
        if (!parentElement) return;

        parentElement.innerHTML = `
            <div style="
                position: relative;
                width: 100%;
                padding-bottom: 56.25%;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
            ">
                <iframe
                    style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                    "
                    src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1&autoplay=0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
                <div style="
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    background: rgba(255,0,0,0.8);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 10;
                ">
                    🎬 ЦІЗЕР
                </div>
            </div>
        `;
        console.log('✅ Відео вставлено');
    }

    // Відновлення оригінального постера
    function restoreOriginalPoster(parentElement, originalHTML) {
        if (!parentElement) return;
        
        parentElement.innerHTML = originalHTML;
        
        // Додаємо непомітну позначку про відсутність цізера
        var poster = parentElement.querySelector('img, [data-poster], .poster');
        if (poster) {
            var badge = document.createElement('div');
            badge.style.cssText = 'position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);color:#ffaa00;padding:2px 5px;border-radius:3px;font-size:10px;z-index:5;';
            badge.textContent = '🚫';
            
            if (poster.style.position !== 'absolute' && poster.style.position !== 'relative') {
                poster.style.position = 'relative';
            }
            poster.appendChild(badge);
        }
    }

    // Запуск плагіна після готовності Lampa
    function startPlugin() {
        if (window.appready || (Lampa && Lampa.Listener)) {
            initPlugin();
        } else {
            if (Lampa && Lampa.Listener) {
                Lampa.Listener.follow('app', function(event) {
                    if (event.type === 'ready') {
                        initPlugin();
                    }
                });
            } else {
                // Якщо Lampa ще не завантажено, чекаємо
                setTimeout(startPlugin, 500);
            }
        }
    }

    startPlugin();
})();
