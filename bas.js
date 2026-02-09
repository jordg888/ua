(function() {
    'use strict';
    
    console.log('=== UATUT Balancer Plugin Loading ===');
    
    // Конфігурація
    var config = {
        name: 'UATUT Balancer',
        version: '2.0',
        balancer: 'https://uk.uatut.fun/film/',
        buttonText: '🎬 UATUT',
        debug: true
    };
    
    // Функція логування
    function log(msg) {
        if (config.debug) {
            console.log('[UATUT] ' + msg);
        }
    }
    
    // Функція для додавання кнопки
    function addUatutButton() {
        log('Спроба додати кнопку...');
        
        // Шукаємо кнопку "Дивитися" або подібну
        var watchButton = document.querySelector('button, .button, .btn, [class*="watch"], [class*="play"]');
        
        if (!watchButton) {
            log('Кнопка "Дивитися" не знайдена, спробуємо інші селектори...');
            
            // Інші можливі місця
            var selectors = [
                '.buttons',
                '.actions',
                '.controls',
                '.player-toolbar',
                '.toolbar',
                '.card-actions',
                '[class*="button"]',
                '[class*="action"]'
            ];
            
            for (var i = 0; i < selectors.length; i++) {
                var element = document.querySelector(selectors[i]);
                if (element) {
                    watchButton = element;
                    log('Знайдено через селектор: ' + selectors[i]);
                    break;
                }
            }
        }
        
        if (watchButton) {
            log('Знайдено місце для кнопки: ' + watchButton.className);
            
            // Перевіряємо, чи кнопка вже є
            if (document.querySelector('.uatut-btn')) {
                log('Кнопка вже додана');
                return;
            }
            
            // Створюємо кнопку UATUT
            var uatutBtn = document.createElement('div');
            uatutBtn.className = 'uatut-btn';
            uatutBtn.innerHTML = config.buttonText;
            uatutBtn.style.cssText = `
                display: inline-block;
                margin: 10px;
                padding: 12px 24px;
                background: linear-gradient(135deg, #FF6B00, #FF3D00);
                color: white;
                border-radius: 25px;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
                text-align: center;
                transition: all 0.3s;
                box-shadow: 0 4px 15px rgba(255, 107, 0, 0.4);
                border: none;
                text-transform: uppercase;
                letter-spacing: 1px;
            `;
            
            // Додаємо ефект при наведенні
            uatutBtn.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 20px rgba(255, 107, 0, 0.6)';
            };
            
            uatutBtn.onmouseout = function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 15px rgba(255, 107, 0, 0.4)';
            };
            
            // Обробник кліку
            uatutBtn.onclick = function(e) {
                e.stopPropagation();
                openUatutMenu();
            };
            
            // Додаємо кнопку
            try {
                // Спробуємо додати поряд з кнопкою "Дивитися"
                if (watchButton.parentNode) {
                    watchButton.parentNode.insertBefore(uatutBtn, watchButton.nextSibling);
                    log('Кнопка додана поряд з кнопкою "Дивитися"');
                } else {
                    // Якщо не вийшло, додаємо в body
                    document.body.appendChild(uatutBtn);
                    uatutBtn.style.position = 'fixed';
                    uatutBtn.style.top = '20px';
                    uatutBtn.style.right = '20px';
                    uatutBtn.style.zIndex = '9999';
                    log('Кнопка додана у верхній правий кут');
                }
            } catch (err) {
                log('Помилка при додаванні кнопки: ' + err);
                // Резервний варіант
                document.body.appendChild(uatutBtn);
                uatutBtn.style.position = 'fixed';
                uatutBtn.style.top = '20px';
                uatutBtn.style.right = '20px';
                uatutBtn.style.zIndex = '9999';
            }
            
        } else {
            log('Не знайдено місце для кнопки');
            
            // Резервний варіант - створити свою панель
            var existingPanel = document.querySelector('.uatut-panel');
            if (!existingPanel) {
                var panel = document.createElement('div');
                panel.className = 'uatut-panel';
                panel.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    background: rgba(0,0,0,0.8);
                    padding: 15px;
                    border-radius: 10px;
                    border: 2px solid #FF6B00;
                    backdrop-filter: blur(10px);
                `;
                
                var panelBtn = document.createElement('div');
                panelBtn.innerHTML = config.buttonText;
                panelBtn.style.cssText = `
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #FF6B00, #FF3D00);
                    color: white;
                    border-radius: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    text-align: center;
                    font-size: 16px;
                `;
                
                panelBtn.onclick = openUatutMenu;
                panel.appendChild(panelBtn);
                document.body.appendChild(panel);
                
                log('Створено резервну панель');
            }
        }
    }
    
    // Функція для відкриття меню UATUT
    function openUatutMenu() {
        log('Відкриття меню UATUT');
        
        // Отримуємо інформацію про фільм
        var movieTitle = '';
        var movieYear = '';
        
        // Спробуємо отримати назву фільму
        var titleElements = document.querySelectorAll('h1, h2, [class*="title"], [class*="name"]');
        for (var i = 0; i < titleElements.length; i++) {
            var text = titleElements[i].textContent.trim();
            if (text && text.length > 2 && text.length < 100) {
                movieTitle = text;
                log('Знайдено назву: ' + movieTitle);
                break;
            }
        }
        
        // Спробуємо отримати рік
        var yearElements = document.querySelectorAll('[class*="year"], [class*="date"]');
        for (var j = 0; j < yearElements.length; j++) {
            var yearText = yearElements[j].textContent.trim();
            if (yearText && /\d{4}/.test(yearText)) {
                movieYear = yearText.match(/\d{4}/)[0];
                log('Знайдено рік: ' + movieYear);
                break;
            }
        }
        
        // Формуємо пошуковий запит
        var searchQuery = movieTitle;
        if (movieYear) {
            searchQuery += ' ' + movieYear;
        }
        
        var encodedQuery = encodeURIComponent(searchQuery);
        var searchUrl = config.balancer + '?s=' + encodedQuery;
        
        // Показуємо меню
        showUatutMenu(movieTitle, movieYear, searchUrl);
    }
    
    // Показ меню
    function showUatutMenu(title, year, url) {
        // Зачищаємо попередні меню
        var oldMenu = document.querySelector('.uatut-menu-overlay');
        if (oldMenu) oldMenu.remove();
        
        // Створюємо overlay
        var overlay = document.createElement('div');
        overlay.className = 'uatut-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        `;
        
        // Створюємо меню
        var menu = document.createElement('div');
        menu.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border-radius: 15px;
            padding: 30px;
            width: 400px;
            max-width: 90%;
            border: 2px solid #FF6B00;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        `;
        
        // Заголовок
        var header = document.createElement('div');
        header.innerHTML = `
            <div style="color: #FF6B00; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                ${config.name}
            </div>
            <div style="color: white; font-size: 18px; margin-bottom: 5px;">
                ${title || 'Фільм'}
            </div>
            ${year ? '<div style="color: #aaa; font-size: 14px; margin-bottom: 20px;">' + year + '</div>' : ''}
        `;
        menu.appendChild(header);
        
        // Кнопки
        var buttons = [
            {
                text: '🔍 ПОШУК НА UATUT',
                desc: 'Знайти на сайті балансера',
                action: function() {
                    window.open(url, '_blank');
                    overlay.remove();
                }
            },
            {
                text: '🌐 ВІДКРИТИ САЙТ',
                desc: config.balancer,
                action: function() {
                    window.open(config.balancer, '_blank');
                    overlay.remove();
                }
            },
            {
                text: '📋 КОПІЮВАТИ ПОСИЛАННЯ',
                desc: 'Скопіювати URL',
                action: function() {
                    navigator.clipboard.writeText(url).then(function() {
                        alert('Посилання скопійовано!');
                        overlay.remove();
                    });
                }
            }
        ];
        
        buttons.forEach(function(btn) {
            var button = document.createElement('div');
            button.style.cssText = `
                background: linear-gradient(135deg, #FF6B00, #FF3D00);
                color: white;
                padding: 15px;
                margin: 10px 0;
                border-radius: 10px;
                text-align: center;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            `;
            
            button.innerHTML = `
                <div>${btn.text}</div>
                <div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${btn.desc}</div>
            `;
            
            button.onmouseover = function() {
                this.style.transform = 'translateY(-2px)';
            };
            
            button.onmouseout = function() {
                this.style.transform = 'translateY(0)';
            };
            
            button.onclick = btn.action;
            
            menu.appendChild(button);
        });
        
        // Кнопка закриття
        var closeBtn = document.createElement('div');
        closeBtn.textContent = 'ЗАКРИТИ';
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.1);
            color: white;
            padding: 12px;
            margin-top: 20px;
            border-radius: 10px;
            text-align: center;
            cursor: pointer;
            border: 1px solid rgba(255,107,0,0.5);
        `;
        
        closeBtn.onclick = function() {
            overlay.remove();
        };
        
        menu.appendChild(closeBtn);
        overlay.appendChild(menu);
        
        // Додаємо в DOM
        document.body.appendChild(overlay);
        
        // Закриття при кліку на overlay
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                overlay.remove();
            }
        };
    }
    
    // Ініціалізація плагіна
    function initPlugin() {
        log('Ініціалізація плагіна v' + config.version);
        
        // Чекаємо завантаження сторінки
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(addUatutButton, 2000);
            });
        } else {
            setTimeout(addUatutButton, 2000);
        }
        
        // Спостерігаємо за змінами DOM
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // Перевіряємо, чи з'явилися кнопки
                    setTimeout(addUatutButton, 500);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Додаткова спроба через 5 секунд
        setTimeout(addUatutButton, 5000);
        
        // І кожні 10 секунд перевіряємо
        setInterval(addUatutButton, 10000);
    }
    
    // Запускаємо плагін
    initPlugin();
    
    // Експортуємо для тестування
    window.UATUTPlugin = {
        addButton: addUatutButton,
        openMenu: openUatutMenu,
        config: config
    };
    
    console.log('=== UATUT Balancer Plugin Loaded ===');
    
})();
