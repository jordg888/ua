// ============================================
// Плагін: Cizari замість постера (Виправлена версія)
// Автор: Твоє Ім'я
// Версія: 1.1
// Опис: Показує цізери фільмів замість постера
// ============================================

(function() {
    // Перевірка чи плагін вже завантажено
    if (window.pluginCizerLoaded) return;
    window.pluginCizerLoaded = true;

    console.log('🔄 Завантаження плагіна цізерів...');

    // Функція ініціалізації плагіна
    function initializeCizerPlugin() {
        console.log('✅ Плагін цізерів ініціалізовано');

        // Слухаємо зміну активності (відкриття карток)
        Lampa.Listener.follow('activity', function(activity) {
            if (activity && activity.data && activity.data.type === 'movie') {
                console.log('🎬 Відкрито фільм:', activity.data.title);
                
                // Чекаємо трохи, поки DOM завантажиться
                setTimeout(function() {
                    findAndReplacePoster(activity.data);
                }, 800);
            }
        });
    }

    // Функція пошуку та заміни постера
    function findAndReplacePoster(movieData) {
        // Спробуємо різні селектори для постеру
        const selectors = [
            '.full-start__poster',
            '.movie-poster',
            '.poster--big',
            '.full-start__poster .poster',
            '.full-start__poster img',
            '.media-poster'
        ];
        
        let posterElement = null;
        
        for (let selector of selectors) {
            posterElement = document.querySelector(selector);
            if (posterElement) {
                console.log('Знайдено постер за селектором:', selector);
                break;
            }
        }
        
        if (!posterElement) {
            console.log('❌ Постер не знайдено');
            return;
        }

        // Зберігаємо оригінал
        const originalPoster = posterElement.innerHTML;
        const parentContainer = posterElement.parentElement || posterElement;

        // Показуємо завантаження
        showLoading(parentContainer, posterElement);

        // Шукаємо цізер
        searchCizer(movieData)
            .then(function(videoUrl) {
                if (videoUrl) {
                    showVideo(parentContainer, videoUrl);
                } else {
                    showOriginalPoster(parentContainer, originalPoster);
                }
            })
            .catch(function(error) {
                console.error('Помилка:', error);
                showOriginalPoster(parentContainer, originalPoster);
            });
    }

    // Показуємо завантаження
    function showLoading(container, posterElement) {
        if (!container || !posterElement) return;
        
        // Зберігаємо розміри постера
        const posterStyle = window.getComputedStyle(posterElement);
        const width = posterStyle.width;
        const height = posterStyle.height;
        
        container.innerHTML = `
            <div style="
                width: ${width};
                height: ${height};
                min-height: 250px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 12px;
                position: relative;
                overflow: hidden;
            ">
                <div style="text-align: center; color: #fff;">
                    <div style="font-size: 48px; margin-bottom: 15px; animation: pulse 1.5s infinite;">🎬</div>
                    <div style="font-size: 16px; font-family: Arial, sans-serif;">Завантаження цізера...</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.7;">${movieData.title || ''}</div>
                </div>
            </div>
        `;

        // Додаємо анімацію
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Пошук цізера через різні джерела
    function searchCizer(movieData) {
        return new Promise(function(resolve, reject) {
            const title = movieData.title || '';
            const year = movieData.year || '';
            
            // Пробуємо різні джерела послідовно
            searchYouTube(title, year)
                .then(resolve)
                .catch(function() {
                    // Якщо YouTube не спрацював, пробуємо запасний варіант
                    return searchTmdb(movieData.id)
                        .then(resolve)
                        .catch(function() {
                            resolve(null);
                        });
                });
        });
    }

    // Пошук на YouTube
    function searchYouTube(title, year) {
        return new Promise(function(resolve, reject) {
            const searchQuery = encodeURIComponent(`${title} ${year} official trailer`);
            
            // Використовуємо публічний API
            fetch(`https://webtask.futurememes.com/api/youtube/search?q=${searchQuery}&maxResults=5`)
                .then(function(response) {
                    if (!response.ok) throw new Error('Network error');
                    return response.json();
                })
                .then(function(data) {
                    if (data && data.items && data.items.length > 0) {
                        // Шукаємо відео зі словами trailer/teaser в назві
                        const trailerVideo = data.items.find(function(item) {
                            const title = item.snippet.title.toLowerCase();
                            return title.includes('trailer') || 
                                   title.includes('teaser') || 
                                   title.includes('трейлер') || 
                                   title.includes('тизер');
                        }) || data.items[0];
                        
                        if (trailerVideo) {
                            resolve(trailerVideo.id.videoId);
                        } else {
                            reject('No video found');
                        }
                    } else {
                        reject('No data');
                    }
                })
                .catch(function(error) {
                    console.warn('YouTube search failed:', error);
                    reject(error);
                });
        });
    }

    // Запасний пошук через TMDB (якщо є API ключ, але це просто приклад)
    function searchTmdb(movieId) {
        return new Promise(function(resolve, reject) {
            // Тут можна додати пошук через TMDB API
            // Але для простоти поки повертаємо null
            reject('TMDB search not implemented');
        });
    }

    // Показуємо відео
    function showVideo(container, videoId) {
        if (!container) return;
        
        container.innerHTML = `
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
                    src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&controls=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
                <div style="
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    background: rgba(255, 0, 0, 0.8);
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
        
        console.log('✅ Відео вставлено:', videoId);
    }

    // Показуємо оригінальний постер
    function showOriginalPoster(container, originalPoster) {
        if (!container) return;
        
        container.innerHTML = originalPoster;
        
        // Додаємо позначку
        const badge = document.createElement('div');
        badge.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #ffaa00;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            z-index: 100;
            pointer-events: none;
        `;
        badge.textContent = '🚫 Немає цізера';
        
        if (container.firstChild) {
            container.firstChild.style.position = 'relative';
            container.firstChild.appendChild(badge);
        }
    }

    // Чекаємо готовності Lampa
    function waitForLampa() {
        if (window.Lampa && Lampa.Listener) {
            console.log('Lampa готова, запускаємо плагін');
            initializeCizerPlugin();
        } else {
            console.log('Чекаємо Lampa...');
            setTimeout(waitForLampa, 100);
        }
    }

    // Запускаємо
    waitForLampa();

})();
