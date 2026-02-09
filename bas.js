(function() {
    'use strict';
    
    console.log('=== UATUT Final Plugin ===');
    
    var config = {
        name: 'UATUT',
        url: 'https://uk.uatut.fun/film/'
    };
    
    // Головна функція
    function init() {
        // Чекаємо завантаження
        setTimeout(addUatutButton, 2000);
        setTimeout(addUatutButton, 4000);
        setTimeout(addUatutButton, 6000);
        
        // Спостереження за змінами
        var observer = new MutationObserver(function() {
            addUatutButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Додавання кнопки UATUT
    function addUatutButton() {
        // Шукаємо контейнер з рейтингами
        var ratingsContainer = findRatingsContainer();
        
        if (!ratingsContainer) {
            console.log('Контейнер рейтингів не знайдений');
            return;
        }
        
        // Перевіряємо, чи кнопка вже є
        if (ratingsContainer.querySelector('.uatut-final-btn')) {
            return;
        }
        
        console.log('Знайдено контейнер рейтингів');
        
        // Створюємо кнопку
        var btn = document.createElement('div');
        btn.className = 'uatut-final-btn';
        btn.textContent = config.name;
        
        // Стилі як у рейтингів
        btn.style.cssText = `
            display: inline-block;
            margin: 0 8px;
            padding: 8px 16px;
            background: linear-gradient(135deg, #FF6B00, #FF3D00);
            color: white;
            border-radius: 20px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            text-align: center;
            transition: all 0.3s;
            box-shadow: 0 4px 10px rgba(255, 107, 0, 0.3);
            text-transform: uppercase;
            vertical-align: middle;
            line-height: normal;
        `;
        
        // Ефект при наведенні
        btn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 15px rgba(255, 107, 0, 0.5)';
            this.style.background = 'linear-gradient(135deg, #FF7B20, #FF5500)';
        };
        
        btn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 10px rgba(255, 107, 0, 0.3)';
            this.style.background = 'linear-gradient(135deg, #FF6B00, #FF3D00)';
        };
        
        // При кліку
        btn.onclick = function(e) {
            e.stopPropagation();
            searchOnUatut();
        };
        
        // Додаємо кнопку в контейнер
        ratingsContainer.appendChild(btn);
        console.log('Кнопка UATUT додана до рейтингів');
    }
    
    // Пошук контейнера з рейтингами (2.6K, 1K тощо)
    function findRatingsContainer() {
        // Шукаємо елементи з рейтингами
        var ratingTexts = ['2.6K', '1K', '382', '352', '151'];
        
        for (var i = 0; i < ratingTexts.length; i++) {
            var elements = document.querySelectorAll('*');
            for (var j = 0; j < elements.length; j++) {
                var el = elements[j];
                var text = el.textContent || '';
                
                if (text.includes(ratingTexts[i])) {
                    // Знаходимо батьківський контейнер
                    var parent = el.parentElement;
                    
                    // Перевіряємо, чи це контейнер з декількома рейтингами
                    if (parent) {
                        var children = parent.children;
                        var hasMultipleRatings = false;
                        
                        for (var k = 0; k < children.length; k++) {
                            var childText = children[k].textContent || '';
                            if (/\d+(\.\d+)?[K]?/.test(childText)) {
                                hasMultipleRatings = true;
                                break;
                            }
                        }
                        
                        if (hasMultipleRatings) {
                            return parent;
                        }
                    }
                }
            }
        }
        
        // Якщо не знайшли, шукаємо горизонтальний контейнер
        var containers = document.querySelectorAll('div');
        for (var c = 0; c < containers.length; c++) {
            var container = containers[c];
            var children = container.children;
            
            if (children.length >= 5) {
                var ratingCount = 0;
                for (var ch = 0; ch < children.length; ch++) {
                    var childText = children[ch].textContent || '';
                    if (/\d+(\.\d+)?[K]?/.test(childText)) {
                        ratingCount++;
                    }
                }
                
                if (ratingCount >= 3) {
                    return container;
                }
            }
        }
        
        return null;
    }
    
    // Пошук на UATUT
    function searchOnUatut() {
        var movieInfo = getMovieInfo();
        
        if (movieInfo.title) {
            var searchQuery = movieInfo.title;
            if (movieInfo.year) {
                searchQuery += ' ' + movieInfo.year;
            }
            
            var searchUrl = config.url + '?s=' + encodeURIComponent(searchQuery);
            console.log('UATUT пошук:', searchUrl);
            
            window.open(searchUrl, '_blank');
            
            // Показуємо повідомлення
            showNotification('Пошук: ' + searchQuery);
        } else {
            window.open(config.url, '_blank');
        }
    }
    
    // Отримання інформації про фільм
    function getMovieInfo() {
        var info = { title: '', year: '' };
        
        // Заголовок
        var titleElement = document.querySelector('h1');
        if (!titleElement) {
            titleElement = document.querySelector('h2');
        }
        
        if (titleElement) {
            info.title = titleElement.textContent.trim();
        }
        
        // Рік
        var allText = document.body.textContent;
        var yearMatch = allText.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            info.year = yearMatch[0];
        }
        
        return info;
    }
    
    // Показ повідомлення
    function showNotification(text) {
        var msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background: rgba(30, 30, 40, 0.95);
            color: #FF6B00;
            border-radius: 10px;
            z-index: 10000;
            font-size: 14px;
            font-weight: bold;
            border: 1px solid #FF6B00;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(function() {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        }, 2000);
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
