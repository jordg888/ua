(function() {
    'use strict';
    
    var uatut = {
        name: 'UATUT',
        url: 'https://uk.uatut.fun/film/'
    };
    
    // Функція для знаходження рядка з кнопками
    function findButtonsRow() {
        // Шукаємо елементи з текстом "Джерело", "Трейлери", "Шортс"
        var buttonTexts = ['Джерело', 'Трейлери', 'Шортс', 'Trailers', 'Shorts'];
        var buttons = [];
        
        // Шукаємо всі елементи
        var allElements = document.querySelectorAll('div, span, button, a');
        
        for (var i = 0; i < allElements.length; i++) {
            var el = allElements[i];
            var text = el.textContent || '';
            var trimmed = text.trim();
            
            // Якщо знайшли одну з кнопок
            if (buttonTexts.includes(trimmed)) {
                buttons.push({
                    element: el,
                    text: trimmed,
                    parent: el.parentElement
                });
            }
        }
        
        // Якщо знайшли хоча б 2 кнопки, повертаємо їх батьківський контейнер
        if (buttons.length >= 2) {
            // Перевіряємо, чи всі кнопки в одному контейнері
            var firstParent = buttons[0].parent;
            var sameParent = buttons.every(function(btn) {
                return btn.parent === firstParent;
            });
            
            if (sameParent && firstParent) {
                return firstParent;
            }
        }
        
        return null;
    }
    
    // Додавання кнопки UATUT в рядок з іншими кнопками
    function addUatutButton() {
        // Знаходимо контейнер з кнопками
        var buttonsContainer = findButtonsRow();
        
        if (!buttonsContainer) {
            // Спробуємо знайти будь-який горизонтальний контейнер з кнопками
            setTimeout(addUatutButton, 1000);
            return;
        }
        
        // Перевіряємо, чи кнопка вже додана
        if (buttonsContainer.querySelector('.uatut-row-btn')) {
            return;
        }
        
        console.log('Знайдено контейнер кнопок:', buttonsContainer.className);
        
        // Створюємо кнопку UATUT
        var btn = document.createElement('div');
        btn.className = 'uatut-row-btn';
        btn.textContent = uatut.name;
        
        // Стилі як у інших кнопок
        btn.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin: 0 10px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #FF6B00, #FF3D00);
            color: white;
            border-radius: 25px;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            text-transform: uppercase;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(255, 107, 0, 0.4);
            border: none;
            white-space: nowrap;
        `;
        
        // Ефект при наведенні
        btn.onmouseover = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 16px rgba(255, 107, 0, 0.6)';
        };
        
        btn.onmouseout = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 12px rgba(255, 107, 0, 0.4)';
        };
        
        // Обробник кліку
        btn.onclick = function(e) {
            e.stopPropagation();
            searchCurrentMovie();
        };
        
        // Додаємо кнопку в контейнер
        try {
            buttonsContainer.appendChild(btn);
            console.log('Кнопка UATUT додана в рядок з кнопками');
            
            // Можна додати роздільник перед кнопкою
            var separator = document.createElement('div');
            separator.style.cssText = `
                display: inline-block;
                width: 1px;
                height: 20px;
                background: rgba(255,255,255,0.2);
                margin: 0 5px;
                vertical-align: middle;
            `;
            buttonsContainer.insertBefore(separator, btn);
            
        } catch (e) {
            console.error('Помилка додавання кнопки:', e);
            createFloatingButton();
        }
    }
    
    // Пошук поточного фільму
    function searchCurrentMovie() {
        var movieInfo = getMovieInfo();
        
        if (movieInfo.title) {
            var searchQuery = movieInfo.title;
            if (movieInfo.year) {
                searchQuery += ' ' + movieInfo.year;
            }
            
            var searchUrl = uatut.url + '?s=' + encodeURIComponent(searchQuery);
            window.open(searchUrl, '_blank');
            
            // Показати повідомлення
            showMessage('Пошук: ' + searchQuery);
        } else {
            window.open(uatut.url, '_blank');
        }
    }
    
    // Отримання інформації про фільм
    function getMovieInfo() {
        var info = { title: '', year: '' };
        
        // Шукаємо заголовок
        var titleElements = document.querySelectorAll('h1, h2, [class*="title"]');
        for (var i = 0; i < titleElements.length; i++) {
            var text = titleElements[i].textContent || '';
            if (text && text.length > 2 && text.length < 100) {
                info.title = text.trim();
                break;
            }
        }
        
        // Шукаємо рік
        var allText = document.body.textContent;
        var yearMatch = allText.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
            info.year = yearMatch[0];
        }
        
        return info;
    }
    
    // Показ повідомлення
    function showMessage(text) {
        // Можна додати просте повідомлення
        var msg = document.createElement('div');
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 50px;
            right: 20px;
            padding: 10px 15px;
            background: rgba(0,0,0,0.8);
            color: #FF6B00;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
        `;
        
        document.body.appendChild(msg);
        setTimeout(function() {
            if (msg.parentNode) msg.parentNode.removeChild(msg);
        }, 2000);
    }
    
    // Плаваюча кнопка (резервний варіант)
    function createFloatingButton() {
        if (document.querySelector('.uatut-floating-btn')) return;
        
        var floatBtn = document.createElement('div');
        floatBtn.className = 'uatut-floating-btn';
        floatBtn.textContent = uatut.name;
        
        floatBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #FF6B00, #FF3D00);
            color: white;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(255, 107, 0, 0.5);
            text-transform: uppercase;
        `;
        
        floatBtn.onclick = searchCurrentMovie;
        document.body.appendChild(floatBtn);
    }
    
    // Ініціалізація
    function init() {
        // Чекаємо завантаження
        setTimeout(addUatutButton, 2000);
        setTimeout(addUatutButton, 5000);
        setTimeout(addUatutButton, 8000);
        
        // Спостереження за змінами
        var observer = new MutationObserver(function() {
            addUatutButton();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
