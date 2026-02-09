(function() {
    'use strict';
    
    console.log('=== UATUT Balancer Integration ===');
    
    var config = {
        name: 'UATUT',
        balancer: 'https://uk.uatut.fun/film/',
        api_url: 'https://uk.uatut.fun/api/', // Потрібно дізнатися реальний API
        debug: true
    };
    
    function log(msg) {
        if (config.debug) console.log('[UATUT]', msg);
    }
    
    // ІНТЕГРАЦІЯ З СИСТЕМОЮ LAMPA
    // ============================
    
    // 1. Реєстрація джерела UATUT в Lampa
    function registerUatutSource() {
        log('Реєстрація джерела UATUT...');
        
        // Чекаємо, поки завантажиться система джерел Lampa
        if (!window.Lampa || !Lampa.Sources) {
            setTimeout(registerUatutSource, 1000);
            return;
        }
        
        // Перевіряємо, чи вже зареєстровано
        if (window.uatutRegistered) return;
        
        // Створюємо джерело UATUT
        var UatutSource = {
            name: config.name,
            id: 'uatut',
            type: 'online',
            icon: '🎬',
            
            // Метод для пошуку фільму
            search: function(movie, callback) {
                log('Пошук фільму на UATUT:', movie.title);
                
                // Формуємо пошуковий запит
                var query = movie.title;
                if (movie.year) query += ' ' + movie.year;
                
                var searchUrl = config.balancer + '?s=' + encodeURIComponent(query);
                
                // Повертаємо результат у форматі Lampa
                var results = [
                    {
                        title: movie.title + ' на UATUT',
                        year: movie.year || '',
                        voice: 'UATUT',
                        quality: 'HD',
                        url: searchUrl,
                        balanser: config.name,
                        time: movie.duration || 'Невідомо',
                        preview: movie.poster || ''
                    }
                ];
                
                callback(results);
            },
            
            // Метод для завантаження відео
            load: function(url, callback) {
                log('Завантаження відео з UATUT:', url);
                
                // Тут буде логіка парсингу сторінки UATUT
                // Поки що просто відкриваємо сторінку
                window.open(url, '_blank');
                
                callback({
                    success: true,
                    message: 'Відкрито на UATUT'
                });
            }
        };
        
        // Реєструємо джерело в Lampa
        try {
            Lampa.Sources.add(UatutSource);
            window.uatutRegistered = true;
            log('Джерело UATUT успішно зареєстровано');
        } catch (e) {
            log('Помилка реєстрації:', e);
        }
    }
    
    // 2. Додавання кнопки UATUT до інтерфейсу
    function addUatutButton() {
        log('Додавання кнопки UATUT...');
        
        // Шукаємо контейнер з кнопкою "смотреть"
        var watchButton = document.querySelector('[class*="watch"], [class*="смотреть"], button, .button');
        
        if (!watchButton) {
            setTimeout(addUatutButton, 1000);
            return;
        }
        
        // Перевіряємо, чи кнопка вже додана
        if (document.querySelector('.uatut-watch-btn')) {
            log('Кнопка вже додана');
            return;
        }
        
        // Створюємо кнопку UATUT
        var uatutBtn = document.createElement('div');
        uatutBtn.className = 'uatut-watch-btn';
        uatutBtn.textContent = 'UATUT';
        uatutBtn.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-left: 10px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #FF6B00, #FF3D00);
            color: white;
            border-radius: 20px;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.4);
            text-transform: uppercase;
        `;
        
        // Ефект при наведенні
        uatutBtn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 16px rgba(255, 107, 0, 0.6)';
        };
        
        uatutBtn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(255, 107, 0, 0.4)';
        };
        
        // Обробник кліку
        uatutBtn.onclick = function(e) {
            e.stopPropagation();
            openUatutInOnlineTab();
        };
        
        // Додаємо кнопку поруч з "смотреть"
        try {
            watchButton.parentNode.insertBefore(uatutBtn, watchButton.nextSibling);
            log('Кнопка UATUT додана');
        } catch (e) {
            log('Помилка додавання кнопки:', e);
            // Резервний варіант
            document.body.appendChild(uatutBtn);
            uatutBtn.style.position = 'fixed';
            uatutBtn.style.top = '20px';
            uatutBtn.style.right = '20px';
            uatutBtn.style.zIndex = '9999';
        }
    }
    
    // 3. Відкриття UATUT у вкладці "Онлайн"
    function openUatutInOnlineTab() {
        log('Відкриття UATUT у вкладці Онлайн...');
        
        // Натискаємо кнопку "Онлайн" (якщо вона є)
        var onlineTab = findOnlineTab();
        if (onlineTab) {
            onlineTab.click();
            
            // Чекаємо відкриття вкладки
            setTimeout(function() {
                // Тут має з'явитися вибір джерел
                showUatutSource();
            }, 500);
        } else {
            // Якщо не знайшли вкладку, просто відкриваємо UATUT
            var movie = getCurrentMovie();
            if (movie) {
                var searchUrl = config.balancer + '?s=' + encodeURIComponent(movie.title + ' ' + (movie.year || ''));
                window.open(searchUrl, '_blank');
            }
        }
    }
    
    // 4. Пошук кнопки "Онлайн"
    function findOnlineTab() {
        var elements = document.querySelectorAll('*');
        for (var i = 0; i < elements.length; i++) {
            var text = elements[i].textContent || '';
            if (text.trim() === 'Онлайн') {
                return elements[i];
            }
        }
        return null;
    }
    
    // 5. Відображення UATUT як джерела
    function showUatutSource() {
        log('Відображення UATUT як джерела...');
        
        // Шукаємо контейнер з джерелами (Lumex, Filmix, тощо)
        var sourcesContainer = document.querySelector('[class*="sources"], [class*="source"], .selector, .select');
        
        if (!sourcesContainer) {
            // Чекаємо трохи більше
            setTimeout(showUatutSource, 1000);
            return;
        }
        
        // Перевіряємо, чи вже додали UATUT
        if (sourcesContainer.querySelector('.uatut-source-item')) {
            return;
        }
        
        // Створюємо елемент UATUT
        var uatutItem = document.createElement('div');
        uatutItem.className = 'uatut-source-item';
        uatutItem.textContent = config.name;
        uatutItem.style.cssText = `
            padding: 10px 15px;
            margin: 5px;
            background: rgba(255, 107, 0, 0.1);
            border: 1px solid #FF6B00;
            border-radius: 10px;
            color: #FF6B00;
            font-weight: bold;
            cursor: pointer;
            text-align: center;
        `;
        
        uatutItem.onclick = function() {
            // Завантаження фільму з UATUT
            loadFromUatut();
        };
        
        // Додаємо до контейнера джерел
        sourcesContainer.appendChild(uatutItem);
        log('Елемент UATUT додано до джерел');
    }
    
    // 6. Отримання інформації про поточний фільм
    function getCurrentMovie() {
        var movie = {};
        
        // Спробуємо з Lampa
        if (Lampa.Activity && Lampa.Activity.current()) {
            var card = Lampa.Activity.current().card;
            if (card) {
                movie.title = card.title || card.name || '';
                movie.year = card.release_date || card.first_air_date || '';
                movie.id = card.id || '';
                
                if (movie.year && movie.year.length >= 4) {
                    movie.year = movie.year.substring(0, 4);
                }
                
                return movie;
            }
        }
        
        // Парсимо DOM
        var titleEl = document.querySelector('h1, h2, [class*="title"]');
        if (titleEl) movie.title = titleEl.textContent.trim();
        
        return movie;
    }
    
    // 7. Завантаження з UATUT
    function loadFromUatut() {
        var movie = getCurrentMovie();
        if (!movie.title) {
            alert('Не вдалося отримати інформацію про фільм');
            return;
        }
        
        var searchUrl = config.balancer + '?s=' + encodeURIComponent(movie.title + ' ' + (movie.year || ''));
        
        log('Завантаження з UATUT:', searchUrl);
        
        // Відкриваємо пошук
        window.open(searchUrl, '_blank');
        
        // Альтернативно: можна спробувати парсинг прямо тут
        // fetchUatutResults(searchUrl);
    }
    
    // 8. Основний ініціалізатор
    function initPlugin() {
        log('Ініціалізація плагіна...');
        
        // Реєструємо джерело
        registerUatutSource();
        
        // Додаємо кнопку
        setTimeout(addUatutButton, 2000);
        
        // Спостерігаємо за змінами
        var observer = new MutationObserver(function() {
            addUatutButton();
            showUatutSource();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        log('Плагін ініціалізовано');
    }
    
    // ЗАПУСК
    // ======
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }
    
    // Експорт для тестування
    window.UATUT_PLUGIN = {
        config: config,
        init: initPlugin,
        search: loadFromUatut
    };
    
    console.log('=== UATUT Plugin Loaded ===');
    
})();
