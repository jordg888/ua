// ============================================
// Плагін: Cizari замість постера
// Автор: Твоє Ім'я
// Версія: 1.0
// Опис: Показує цізери фільмів замість постера на картці фільму
// ============================================

if (typeof window.plugin_cizer_ready !== 'undefined') return;
window.plugin_cizer_ready = true;

// Реєструємо плагін
Lampa.Manifest.plugins.push({
    name: "Цізери замість постера",
    version: "1.0",
    author: "Твоє Ім'я",
    description: "Автоматично показує цізери фільмів замість постера",
    icon: "https://cdn-icons-png.flaticon.com/512/1946/1946482.png",
    id: "cizer_plugin"
});

// Головна логіка плагіна
function initCizerPlugin() {
    console.log('🎬 Плагін цізерів активовано');
    
    // Слухаємо подію відкриття картки фільму
    Lampa.Listener.follow('full', function(event) {
        if (event.type === 'movie' && event.data) {
            // Затримка, щоб DOM встиг завантажитись
            setTimeout(() => {
                replacePosterWithCizer(event.data);
            }, 500);
        }
    });
}

// Функція для пошуку цізера та заміни постера
function replacePosterWithCizer(movieData) {
    console.log('🎥 Спроба знайти цізер для:', movieData.title);
    
    // Знаходимо контейнер з постером
    const posterContainer = document.querySelector('.full-start__poster, .movie-poster, .poster--big');
    
    if (!posterContainer) {
        console.log('❌ Контейнер постера не знайдено');
        return;
    }
    
    // Зберігаємо оригінальний постер (про всяк випадок)
    const originalPoster = posterContainer.innerHTML;
    
    // Показуємо індикатор завантаження
    posterContainer.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
            border-radius: 12px;
            min-height: 300px;
        ">
            <div style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 10px;">🎬</div>
                <div>Завантаження цізера...</div>
            </div>
        </div>
    `;
    
    // Шукаємо цізер через YouTube API
    searchYouTubeCizer(movieData.title, movieData.year)
        .then(videoUrl => {
            if (videoUrl) {
                // Якщо знайшли відео - вставляємо плеєр
                embedYouTubePlayer(posterContainer, videoUrl);
            } else {
                // Якщо не знайшли - показуємо оригінальний постер з повідомленням
                console.log('⚠️ Цізер не знайдено, повертаємо постер');
                posterContainer.innerHTML = originalPoster;
                
                // Додаємо невелику позначку, що цізера немає
                const badge = document.createElement('div');
                badge.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    color: #ff6b6b;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 10;
                `;
                badge.textContent = '🚫 Немає цізера';
                posterContainer.style.position = 'relative';
                posterContainer.appendChild(badge);
            }
        })
        .catch(error => {
            console.error('❌ Помилка пошуку цізера:', error);
            posterContainer.innerHTML = originalPoster;
        });
}

// Функція пошуку на YouTube
async function searchYouTubeCizer(title, year) {
    // Формуємо пошуковий запит
    const searchQuery = encodeURIComponent(`${title} ${year || ''} цізер фільм трейлер`);
    
    // Використовуємо Invidious API (відкритий API для YouTube)
    const apiUrl = `https://inv.riverside.rocks/api/v1/search?q=${searchQuery}&type=video`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Шукаємо відео, яке найбільше підходить (цізери зазвичай короткі)
        const cizerVideo = data.find(video => {
            const title = video.title.toLowerCase();
            return (
                (title.includes('цізер') || 
                 title.includes('тизер') || 
                 title.includes('трейлер') ||
                 title.includes('teaser') || 
                 title.includes('trailer')) &&
                video.lengthSeconds < 180 // Коротші за 3 хвилини
            );
        }) || data[0]; // Якщо нічого не знайшли, беремо перше відео
        
        if (cizerVideo) {
            console.log('✅ Знайдено цізер:', cizerVideo.title);
            return cizerVideo.videoId;
        }
        
        return null;
    } catch (error) {
        console.error('Помилка YouTube API:', error);
        
        // Альтернативний API на випадок помилки
        return searchCizerAlternative(title, year);
    }
}

// Альтернативний метод пошуку (запасний варіант)
async function searchCizerAlternative(title, year) {
    // Спробуємо інший Invidious інстанс
    const altApiUrl = `https://invidious.snopyta.org/api/v1/search?q=${encodeURIComponent(title + ' ' + (year || '') + ' teaser')}&type=video`;
    
    try {
        const response = await fetch(altApiUrl);
        const data = await response.json();
        return data[0]?.videoId || null;
    } catch {
        return null;
    }
}

// Функція вставки YouTube плеєра
function embedYouTubePlayer(container, videoId) {
    container.innerHTML = `
        <div style="
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 300px;
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
                src="https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1&rel=0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
            <div style="
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(0,0,0,0.7);
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10;
            ">
                🎬 Цізер
            </div>
        </div>
    `;
    
    console.log('✅ Плеєр вставлено успішно');
}

// Додаємо можливість налаштувань (опціонально)
function addPluginSettings() {
    Lampa.Settings.add({
        key: 'cizer_plugin',
        component: 'cizer_settings',
        title: 'Налаштування цізерів',
        icon: '🎬',
        content: () => {
            return `
                <div class="settings__content">
                    <h3>Налаштування плагіна цізерів</h3>
                    <div class="settings__item">
                        <div class="settings__item_title">Автоматичне відтворення</div>
                        <div class="settings__item_value">
                            <label class="switch">
                                <input type="checkbox" id="autoplay_cizer">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings__item">
                        <div class="settings__item_title">Джерело цізерів</div>
                        <div class="settings__item_value">
                            <select id="cizer_source">
                                <option value="youtube">YouTube</option>
                                <option value="kinopoisk">Кінопошук</option>
                                <option value="tmdb">TMDB</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }
    });
}

// Ініціалізація при готовності Lampa
if (window.appready) {
    initCizerPlugin();
    addPluginSettings();
} else {
    Lampa.Listener.follow('app', function(event) {
        if (event.type === 'ready') {
            initCizerPlugin();
            addPluginSettings();
        }
    });
}

console.log('✅ Плагін цізерів завантажено');
