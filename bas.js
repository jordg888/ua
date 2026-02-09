(function() {
    'use strict';
    
    console.log('=== UATUT Minimal Plugin ===');
    
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
        
        // Додаємо кнопку після завантаження сторінки
        setTimeout(addButton, 3000);
        
        // Спостерігаємо за змінами
        var observer = new MutationObserver(function() {
            addButton();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    });
    
    function addButton() {
        // Шукаємо "Онлайн" кнопку
        var onlineBtn = findButton('Онлайн');
        var trailersBtn = findButton('Трейлери');
        
        if (onlineBtn || trailersBtn) {
            var target = onlineBtn || trailersBtn;
            var container = target.parentElement;
            
            // Перевіряємо, чи вже додали
            if (container.querySelector('.uatut-mini-btn')) return;
            
            // Створюємо кнопку
            var btn = document.createElement('div');
            btn.className = 'uatut-mini-btn';
            btn.textContent = 'UATUT';
            btn.style.cssText = `
                display: inline-block;
                padding: 10px 20px;
                margin: 0 5px;
                background: #FF6B00;
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            `;
            
            btn.onclick = function() {
                alert('UATUT кнопка працює!');
            };
            
            // Додаємо після знайденої кнопки
            container.insertBefore(btn, target.nextSibling);
            console.log('Кнопка додана');
        }
    }
    
    function findButton(text) {
        var elements = document.querySelectorAll('div, span, button, a');
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].textContent && elements[i].textContent.trim() === text) {
                return elements[i];
            }
        }
        return null;
    }
    
})();
