(function() {
    'use strict';
    
    // Простий плагін UATUT для Lampa
    var uatut = {
        name: 'UATUT',
        url: 'https://uk.uatut.fun/film/'
    };
    
    // Очікуємо завантаження сторінки
    function waitForPage() {
        // Чекаємо 3 секунди
        setTimeout(addButton, 3000);
        // Ще одна спроба через 7 секунд
        setTimeout(addButton, 7000);
        // І через 10 секунд
        setTimeout(addButton, 10000);
    }
    
    // Додавання кнопки UATUT
    function addButton() {
        // Шукаємо всі тексти на сторінці
        var allElements = document.querySelectorAll('div, span, button, a, p, h1, h2, h3');
        
        for (var i = 0; i < allElements.length; i++) {
            var el = allElements[i];
            var text = el.textContent || '';
            
            // Якщо знайшли "смотреть" або "дивитися"
            if (text.includes('смотреть') || text.includes('дивитися') || 
                text === '☝️ смотреть!' || text.trim() === 'смотреть') {
                
                // Перевіряємо, чи кнопка вже є
                if (el.parentNode.querySelector('.uatut-simple-btn')) {
                    return; // Кнопка вже додана
                }
                
                // Створюємо кнопку
                var btn = document.createElement('div');
                btn.className = 'uatut-simple-btn';
                btn.textContent = uatut.name;
                
                // Прості стилі
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
                    
                    // Отримуємо назву фільму
                    var title = '';
                    var titles = document.querySelectorAll('h1, h2, [class*="title"]');
                    for (var j = 0; j < titles.length; j++) {
                        var titleText = titles[j].textContent || '';
                        if (titleText && titleText.length > 2) {
                            title = titleText;
                            break;
                        }
                    }
                    
                    // Якщо не знайшли, беремо з URL
                    if (!title) {
                        title = 'фільм';
                    }
                    
                    // Відкриваємо пошук
                    var searchUrl = uatut.url + '?s=' + encodeURIComponent(title);
                    window.open(searchUrl, '_blank');
                };
                
                // Додаємо поруч з "смотреть"
                try {
                    el.parentNode.appendChild(btn);
                    console.log('UATUT: Кнопка додана');
                    return;
                } catch (e) {
                    // Якщо помилка, спробуємо інший спосіб
                }
            }
        }
        
        // Якщо не знайшли "смотреть", створюємо кнопку в кутку
        createFloatingButton();
    }
    
    // Плаваюча кнопка (резервний варіант)
    function createFloatingButton() {
        if (document.querySelector('.uatut-float-btn')) return;
        
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
        
        floatBtn.onclick = function() {
            var searchUrl = uatut.url;
            window.open(searchUrl, '_blank');
        };
        
        document.body.appendChild(floatBtn);
        console.log('UATUT: Плаваюча кнопка додана');
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForPage);
    } else {
        waitForPage();
    }
    
})();
