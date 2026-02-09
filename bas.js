(function() {
    'use strict';
    
    console.log('=== UATUT Plugin v3.0 ===');
    
    var config = {
        name: 'UATUT',
        balancer: 'https://uk.uatut.fun/film/',
        debug: true
    };
    
    function log(msg) {
        if (config.debug) console.log('[UATUT]', msg);
    }
    
    // Головна функція - додавання кнопки поруч з "смотреть"
    function addUatutButton() {
        log('Шукаємо кнопку "смотреть"...');
        
        // Чекаємо 1 секунду для завантаження сторінки
        setTimeout(function() {
            // Шукаємо кнопку "смотреть" на сторінці
            var watchButton = null;
            var allElements = document.querySelectorAll('*');
            
            for (var i = 0; i < allElements.length; i++) {
                var el = allElements[i];
                var text = el.textContent || '';
                if (text.trim().toLowerCase() === 'смотреть' || 
                    text.trim().toLowerCase() === 'дивитися' ||
                    text.trim() === '☝️ смотреть!') {
                    watchButton = el;
                    log('Знайдено кнопку: ' + text);
                    break;
                }
            }
            
            if (!watchButton) {
                log('Кнопку "смотреть" не знайдено, повторна спроба...');
                setTimeout(addUatutButton, 2000);
                return;
            }
            
            // Перевіряємо, чи кнопка UATUT вже додана
            if (document.querySelector('.uatut-button')) {
                log('Кнопка UATUT вже існує');
                return;
            }
            
            // Створюємо кнопку UATUT
            var uatutBtn = document.createElement('div');
            uatutBtn.className = 'uatut-button';
            uatutBtn.textContent = config.name;
            
            // Стилі як на скріншоті
            uatutBtn.style.cssText = `
                display: inline-block;
                margin-left: 15px;
                padding: 8px 20px;
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
                letter-spacing: 0.5px;
                border: none;
                outline: none;
                line-height: normal;
                vertical-align: middle;
            `;
            
            // Ефект при наведенні
            uatutBtn.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 15px rgba(255, 107, 0, 0.5)';
            };
            
            uatutBtn.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 10px rgba(255, 107, 0, 0.3)';
            };
            
            // Обробник кліку
            uatutBtn.onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();
                openUatutSearch();
            };
            
            // Додаємо кнопку поруч з "смотреть"
            try {
                // Спробуємо додати в той же контейнер
                if (watchButton.parentNode) {
                    watchButton.parentNode.appendChild(uatutBtn);
                    log('Кнопка UATUT додана поруч з "смотреть"');
                } else {
                    // Якщо не вийшло, додаємо після кнопки
                    watchButton.insertAdjacentElement('afterend', uatutBtn);
                }
            } catch (e) {
                log('Помилка додавання: ' + e);
                // Резервний варіант
                watchButton.parentNode.insertBefore(uatutBtn, watchButton.nextSibling);
            }
            
        }, 1000);
    }
    
    // Функція пошуку на UATUT при кліку
    function openUatutSearch() {
        log('Запуск пошуку на UATUT...');
        
        // Отримуємо назву фільму
        var movieTitle = '';
        var movieYear = '';
        
        // Шукаємо заголовок фільму
        var titleElements = document.querySelectorAll('h1, h2');
        for (var i = 0; i < titleElements.length; i++) {
            var text = titleElements[i].textContent.trim();
            if (text && text.length > 2 && text.length < 100) {
                movieTitle = text;
                break;
            }
        }
        
        // Якщо не знайшли, шукаємо інші елементи
        if (!movieTitle) {
            var otherTitles = document.querySelectorAll('[class*="title"], [class*="name"]');
            for (var j = 0; j < otherTitles.length; j++) {
                var text = otherTitles[j].textContent.trim();
                if (text && text.length > 2) {
                    movieTitle = text;
                    break;
                }
            }
        }
        
        // Шукаємо рік
        var yearMatch = document.body.textContent.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            movieYear = yearMatch[0];
        }
        
        // Формуємо URL для пошуку
        if (movieTitle) {
            var searchQuery = movieTitle;
            if (movieYear) {
                searchQuery += ' ' + movieYear;
            }
            
            var encodedQuery = encodeURIComponent(searchQuery);
            var searchUrl = config.balancer + '?s=' + encodedQuery;
            
            log('Пошуковий запит: ' + searchQuery);
            log('URL: ' + searchUrl);
            
            // Відкриваємо пошук у новому вікні
            window.open(searchUrl, '_blank');
            
            // Показуємо повідомлення
            showNotification('Пошук "' + searchQuery + '" на UATUT...');
        } else {
            log('Не вдалося отримати назву фільму');
            showNotification('Не вдалося отримати інформацію про фільм');
        }
    }
    
    // Показ повідомлення
    function showNotification(text) {
        // Спробуємо використати Lampa Noty
        if (window.Lampa && Lampa.Noty && Lampa.Noty.show) {
            Lampa.Noty.show(text);
        } else {
            // Резервний варіант
            alert(text);
        }
    }
    
    // Ініціалізація плагіна
    function initPlugin() {
        log('Ініціалізація плагіна...');
        
        // Додаємо кнопку при завантаженні сторінки
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                addUatutButton();
            });
        } else {
            addUatutButton();
        }
        
        // Додаткова спроба через 3 секунди
        setTimeout(addUatutButton, 3000);
        
        // Спостерігаємо за змінами DOM (для SPA)
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Перевіряємо, чи додали нові елементи
                    setTimeout(addUatutButton, 500);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        log('Плагін ініціалізовано');
    }
    
    // Запуск плагіна
    initPlugin();
    
    // Експорт для тестування
    window.UATUT = {
        addButton: addUatutButton,
        search: openUatutSearch,
        version: '3.0'
    };
    
    console.log('=== UATUT Plugin Loaded ===');
    
})();
