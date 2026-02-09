(function() {
    'use strict';
    
    var uatut = {
        name: 'UATUT',
        url: 'https://uk.uatut.fun/film/'
    };
    
    // Перевірка, чи ми на сторінці фільму
    function isMoviePage() {
        var path = window.location.pathname;
        var hasMovieInfo = document.querySelector('h1, h2, [class*="title"]');
        var hasWatchButton = document.body.textContent.includes('смотреть') || 
                            document.body.textContent.includes('дивитися');
        
        // Якщо є заголовок і кнопка "смотреть" - це сторінка фільму
        return hasMovieInfo && hasWatchButton;
    }
    
    // Додавання кнопки
    function addButton() {
        // Якщо не сторінка фільму - не додаємо кнопку
        if (!isMoviePage()) {
            removeButton();
            return;
        }
        
        // Шукаємо кнопку "смотреть"
        var watchElements = document.querySelectorAll('div, span, button, a');
        var watchButton = null;
        
        for (var i = 0; i < watchElements.length; i++) {
            var el = watchElements[i];
            var text = el.textContent || '';
            
            if (text.includes('смотреть') || text.includes('дивитися') || 
                text.trim() === 'смотреть' || text.trim() === '☝️ смотреть!') {
                watchButton = el;
                break;
            }
        }
        
        // Якщо знайшли "смотреть"
        if (watchButton) {
            // Перевіряємо, чи кнопка вже є
            if (watchButton.parentNode.querySelector('.uatut-film-btn')) {
                return;
            }
            
            // Створюємо кнопку UATUT
            var btn = document.createElement('div');
            btn.className = 'uatut-film-btn';
            btn.textContent = uatut.name;
            
            // Стилі як у "смотреть"
            btn.style.cssText = `
                display: inline-block;
                margin-left: 15px;
                padding: 8px 20px;
                background: #FF6B00;
                color: white;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
                cursor: pointer;
                text-align: center;
                border: none;
                text-transform: uppercase;
            `;
            
            // При наведенні
            btn.onmouseover = function() {
                this.style.background = '#FF5500';
            };
            
            btn.onmouseout = function() {
                this.style.background = '#FF6B00';
            };
            
            // При кліку
            btn.onclick = function(e) {
                e.stopPropagation();
                searchMovie();
            };
            
            // Додаємо поруч з "смотреть"
            try {
                watchButton.parentNode.appendChild(btn);
            } catch (e) {
                // Якщо помилка, створюємо плаваючу кнопку
                createFloatingButton();
            }
        } else {
            // Якщо не знайшли "смотреть", створюємо плаваючу кнопку
            createFloatingButton();
        }
    }
    
    // Пошук фільму на UATUT
    function searchMovie() {
        // Отримуємо назву фільму
        var title = '';
        var year = '';
        
        // Шукаємо заголовок
        var titles = document.querySelectorAll('h1, h2');
        for (var i = 0; i < titles.length; i++) {
            var text = titles[i].textContent || '';
            if (text && text.length > 2) {
                title = text.trim();
                break;
            }
        }
        
        // Якщо не знайшли, шукаємо в інших елементах
        if (!title) {
            var otherTitles = document.querySelectorAll('[class*="title"], [class*="name"]');
            for (var j = 0; j < otherTitles.length; j++) {
                var text = otherTitles[j].textContent || '';
                if (text && text.length > 2) {
                    title = text.trim();
                    break;
                }
            }
        }
        
        // Шукаємо рік
        var allText = document.body.textContent;
        var yearMatch = allText.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            year = yearMatch[0];
        }
        
        // Формуємо пошуковий запит
        var searchQuery = title;
        if (year) {
            searchQuery += ' ' + year;
        }
        
        // Відкриваємо пошук
        if (title) {
            var searchUrl = uatut.url + '?s=' + encodeURIComponent(searchQuery);
            window.open(searchUrl, '_blank');
        } else {
            // Якщо не знайшли назву, відкриваємо головну
            window.open(uatut.url, '_blank');
        }
    }
    
    // Плаваюча кнопка (тільки на сторінках фільмів)
    function createFloatingButton() {
        // Видаляємо стару кнопку
        var oldBtn = document.querySelector('.uatut-float-btn');
        if (oldBtn) oldBtn.remove();
        
        // Створюємо нову
        var floatBtn = document.createElement('div');
        floatBtn.className = 'uatut-float-btn';
        floatBtn.textContent = uatut.name;
        
        floatBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #FF6B00;
            color: white;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        `;
        
        floatBtn.onclick = searchMovie;
        
        document.body.appendChild(floatBtn);
    }
    
    // Видалення кнопки (якщо не сторінка фільму)
    function removeButton() {
        var buttons = document.querySelectorAll('.uatut-film-btn, .uatut-float-btn');
        buttons.forEach(function(btn) {
            btn.remove();
        });
    }
    
    // Спостереження за змінами сторінки
    function setupObserver() {
        var observer = new MutationObserver(function() {
            addButton();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Ініціалізація
    function init() {
        // Чекаємо завантаження
        setTimeout(addButton, 2000);
        setTimeout(addButton, 5000);
        
        // Спостереження за змінами
        setupObserver();
        
        // Перевірка при зміні URL (для SPA)
        var lastUrl = location.href;
        setInterval(function() {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                setTimeout(addButton, 1000);
            }
        }, 1000);
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
