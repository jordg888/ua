(function() {
    'use strict';
    
    console.log('=== UATUT Standalone Plugin ===');
    
    var config = {
        name: 'UATUT',
        url: 'https://uk.uatut.fun/film/'
    };
    
    // Чекаємо Lampa
    function waitForLampa(callback) {
        if (window.Lampa) {
            callback();
        } else {
            setTimeout(function() { waitForLampa(callback); }, 1000);
        }
    }
    
    waitForLampa(function() {
        console.log('Lampa завантажена');
        
        // Додаємо кнопку
        setTimeout(addButton, 2000);
        setTimeout(addButton, 5000);
        
        // Спостерігаємо за змінами
        var observer = new MutationObserver(function() {
            addButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
    
    function addButton() {
        // Шукаємо місце для кнопки на сторінці фільму
        var buttonPlace = findButtonPlace();
        
        if (!buttonPlace) {
            // Якщо не знайшли місце, спробуємо пізніше
            return;
        }
        
        // Перевіряємо, чи кнопка вже додана
        if (buttonPlace.querySelector('.uatut-standalone-btn')) {
            return;
        }
        
        // Створюємо кнопку
        var btn = document.createElement('div');
        btn.className = 'uatut-standalone-btn';
        btn.textContent = config.name;
        btn.style.cssText = `
            display: inline-block;
            padding: 10px 20px;
            margin: 0 5px;
            background: linear-gradient(135deg, #FF6B00, #FF3D00);
            color: white;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            transition: all 0.3s;
            box-shadow: 0 4px 10px rgba(255, 107, 0, 0.3);
            border: none;
        `;
        
        // Ефект при наведенні
        btn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 15px rgba(255, 107, 0, 0.5)';
        };
        
        btn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 10px rgba(255, 107, 0, 0.3)';
        };
        
        // При кліку - шукаємо фільм на UATUT
        btn.onclick = function() {
            searchMovieOnUatut();
        };
        
        // Додаємо кнопку
        buttonPlace.appendChild(btn);
        console.log('Кнопка UATUT додана');
    }
    
    // Пошук місця для кнопки
    function findButtonPlace() {
        // Варіант 1: Шукаємо контейнер з рейтингами (2.6K, 1K тощо)
        var ratingsContainer = findRatingsContainer();
        if (ratingsContainer) {
            console.log('Знайдено контейнер рейтингів');
            return ratingsContainer;
        }
        
        // Варіант 2: Шукаємо контейнер з деталями фільму
        var detailsContainer = findDetailsContainer();
        if (detailsContainer) {
            console.log('Знайдено контейнер деталей');
            return detailsContainer;
        }
        
        // Варіант 3: Шукаємо будь-який контейнер під заголовком
        var title = document.querySelector('h1, h2, [class*="title"]');
        if (title) {
            var nextSibling = title.nextElementSibling;
            while (nextSibling) {
                if (nextSibling.children && nextSibling.children.length > 0) {
                    return nextSibling;
                }
                nextSibling = nextSibling.nextElementSibling;
            }
        }
        
        // Варіант 4: Створюємо власний контейнер
        return createButtonContainer();
    }
    
    // Пошук контейнера з рейтингами
    function findRatingsContainer() {
        var elements = document.querySelectorAll('div, span');
        for (var i = 0; i < elements.length; i++) {
            var text = elements[i].textContent || '';
            if (text.includes('2.6K') || text.includes('1K') || text.includes('🔥') || 
                text.includes('🎉') || text.includes('👁️')) {
                // Знаходимо батьківський контейнер
                var parent = elements[i].parentElement;
                if (parent && parent.children.length > 3) {
                    return parent;
                }
            }
        }
        return null;
    }
    
    // Пошук контейнера з деталями
    function findDetailsContainer() {
        var selectors = [
            '[class*="detail"]',
            '[class*="info"]',
            '[class*="meta"]',
            '.movie-info',
            '.film-details'
        ];
        
        for (var i = 0; i < selectors.length; i++) {
            var element = document.querySelector(selectors[i]);
            if (element) return element;
        }
        return null;
    }
    
    // Створення контейнера для кнопки
    function createButtonContainer() {
        var existing = document.querySelector('.uatut-container');
        if (existing) return existing;
        
        var container = document.createElement('div');
        container.className = 'uatut-container';
        container.style.cssText = `
            margin: 15px 0;
            padding: 10px;
            text-align: center;
        `;
        
        // Шукаємо місце для вставки (після рейтингів або перед описом)
        var insertPoint = document.querySelector('.description, .overview, [class*="detail"]') || 
                         document.querySelector('h1, h2') || 
                         document.body;
        
        if (insertPoint) {
            insertPoint.parentNode.insertBefore(container, insertPoint);
        } else {
            document.body.appendChild(container);
        }
        
        return container;
    }
    
    // Пошук фільму на UATUT
    function searchMovieOnUatut() {
        var movieInfo = getMovieInfo();
        
        if (movieInfo.title) {
            var searchQuery = movieInfo.title;
            if (movieInfo.year) {
                searchQuery += ' ' + movieInfo.year;
            }
            
            var searchUrl = config.url + '?s=' + encodeURIComponent(searchQuery);
            console.log('Пошук на UATUT:', searchUrl);
            
            // Відкриваємо у новому вікні
            window.open(searchUrl, '_blank');
            
            // Показуємо повідомлення
            showMessage('Шукаємо: ' + searchQuery);
        } else {
            // Якщо не знайшли фільм, відкриваємо головну
            window.open(config.url, '_blank');
        }
    }
    
    // Отримання інформації про фільм
    function getMovieInfo() {
        var info = { title: '', year: '' };
        
        // Отримуємо з Lampa
        if (window.Lampa && Lampa.Activity && Lampa.Activity.current()) {
            var card = Lampa.Activity.current().card;
            if (card) {
                info.title = card.title || card.name || '';
                info.year = card.release_date || card.first_air_date || '';
                
                if (info.year && info.year.length >= 4) {
                    info.year = info.year.substring(0, 4);
                }
                
                return info;
            }
        }
        
        // Парсимо DOM
        var titleElement = document.querySelector('h1, h2');
        if (titleElement) {
            info.title = titleElement.textContent.trim();
        }
        
        // Шукаємо рік
        var yearMatch = document.body.textContent.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            info.year = yearMatch[0];
        }
        
        return info;
    }
    
    // Показ повідомлення
    function showMessage(text) {
        var msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 15px;
            background: rgba(0,0,0,0.9);
            color: #FF6B00;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            border-left: 4px solid #FF6B00;
        `;
        
        document.body.appendChild(msg);
        setTimeout(function() {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        }, 2000);
    }
    
})();
