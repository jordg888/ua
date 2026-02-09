(function() {
    'use strict';
    
    console.log('=== UATUT Balancer Plugin Loading ===');
    
    // Конфігурація
    var config = {
        name: 'UATUT',
        version: '3.0',
        balancer: 'https://uk.uatut.fun/film/',
        debug: true
    };
    
    // Функція логування
    function log(msg) {
        if (config.debug) {
            console.log('[UATUT] ' + msg);
        }
    }
    
    // Знаходження панелі вкладок (де "Онлайн", "Трейлери", "Закладки")
    function findTabsPanel() {
        log('Пошук панелі вкладок...');
        
        // Спробуємо знайти панель вкладок
        var selectors = [
            '.tabs', 
            '.tabs-panel',
            '.tab-buttons',
            '.tab-list',
            '.tab-nav',
            '.tab-container',
            '.tab-header',
            '[class*="tab"]',
            '[class*="menu"]',
            '.menu-tabs',
            '.section-tabs',
            '.content-tabs'
        ];
        
        for (var i = 0; i < selectors.length; i++) {
            var element = document.querySelector(selectors[i]);
            if (element) {
                // Перевіримо, чи в ньому є кнопки "Онлайн", "Трейлери"
                var text = element.textContent || '';
                if (text.includes('Онлайн') || text.includes('Трейлери') || 
                    text.includes('Закладки') || text.includes('Трейлер')) {
                    log('Знайдено панель вкладок через: ' + selectors[i]);
                    return element;
                }
            }
        }
        
        // Якщо не знайшли, шукаємо будь-які елементи з текстом "Онлайн"
        var onlineElements = document.querySelectorAll('*');
        for (var j = 0; j < onlineElements.length; j++) {
            var el = onlineElements[j];
            var text = el.textContent || '';
            if (text.trim() === 'Онлайн' || text.trim() === 'Трейлери') {
                log('Знайдено кнопку "' + text.trim() + '", шукаємо батьківський контейнер');
                // Знаходимо батьківський контейнер з іншими кнопками
                var parent = el.parentElement;
                while (parent && parent.children.length < 3) {
                    parent = parent.parentElement;
                }
                if (parent) return parent;
                return el.parentElement;
            }
        }
        
        return null;
    }
    
    // Додавання кнопки UATUT до панелі вкладок
    function addUatutTab() {
        log('Спроба додати кнопку до панелі вкладок...');
        
        var tabsPanel = findTabsPanel();
        
        if (!tabsPanel) {
            log('Панель вкладок не знайдена');
            
            // Резервний варіант - створимо свою панель
            createCustomTabPanel();
            return;
        }
        
        // Перевіряємо, чи кнопка вже додана
        if (tabsPanel.querySelector('.uatut-tab')) {
            log('Кнопка UATUT вже додана');
            return;
        }
        
        log('Знайдено панель вкладок: ' + tabsPanel.className);
        
        // Створюємо кнопку UATUT
        var uatutTab = document.createElement('div');
        uatutTab.className = 'uatut-tab';
        uatutTab.textContent = config.name;
        uatutTab.setAttribute('data-tab', 'uatut');
        
        // Стилізація як інші вкладки
        uatutTab.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            margin: 0 5px;
            color: rgba(255,255,255,0.7);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            transition: all 0.3s;
            white-space: nowrap;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        
        // При наведенні
        uatutTab.onmouseover = function() {
            this.style.color = '#FF6B00';
        };
        
        uatutTab.onmouseout = function() {
            if (!this.classList.contains('active')) {
                this.style.color = 'rgba(255,255,255,0.7)';
            }
        };
        
        // Обробник кліку
        uatutTab.onclick = function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            // Виділяємо нашу кнопку
            var allTabs = tabsPanel.querySelectorAll('div, button, a, span');
            allTabs.forEach(function(tab) {
                if (tab.style) {
                    tab.style.color = 'rgba(255,255,255,0.7)';
                    tab.style.borderBottomColor = 'transparent';
                    tab.classList.remove('active');
                }
            });
            
            this.style.color = '#FF6B00';
            this.style.borderBottomColor = '#FF6B00';
            this.classList.add('active');
            
            // Запускаємо пошук на балансері
            searchOnBalancer();
        };
        
        // Додаємо кнопку до панелі
        try {
            tabsPanel.appendChild(uatutTab);
            log('Кнопка UATUT додана до панелі вкладок');
            
            // Активація через 100мс
            setTimeout(function() {
                uatutTab.click();
            }, 100);
            
        } catch (err) {
            log('Помилка додавання кнопки: ' + err);
            createCustomTabPanel();
        }
    }
    
    // Створення власної панелі вкладок (якщо не знайшли оригінальну)
    function createCustomTabPanel() {
        log('Створення власної панелі вкладок...');
        
        // Перевіряємо, чи вже є наша панель
        if (document.querySelector('.uatut-custom-tabs')) return;
        
        // Створюємо контейнер
        var container = document.createElement('div');
        container.className = 'uatut-custom-tabs';
        container.style.cssText = `
            display: flex;
            margin: 20px;
            padding: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        
        // Створюємо кнопку UATUT
        var uatutTab = document.createElement('div');
        uatutTab.className = 'uatut-tab active';
        uatutTab.textContent = config.name;
        uatutTab.style.cssText = `
            padding: 12px 24px;
            margin: 0 10px;
            color: #FF6B00;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            border-bottom: 2px solid #FF6B00;
            text-transform: uppercase;
        `;
        
        uatutTab.onclick = function() {
            searchOnBalancer();
        };
        
        // Додаємо інші кнопки для реалізму
        var otherTabs = ['Онлайн', 'Трейлери', 'Закладки'];
        otherTabs.forEach(function(tabName) {
            var tab = document.createElement('div');
            tab.textContent = tabName;
            tab.style.cssText = `
                padding: 12px 24px;
                margin: 0 10px;
                color: rgba(255,255,255,0.7);
                font-size: 16px;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            `;
            
            tab.onmouseover = function() {
                this.style.color = '#FF6B00';
            };
            
            tab.onmouseout = function() {
                this.style.color = 'rgba(255,255,255,0.7)';
            };
            
            container.appendChild(tab);
        });
        
        // Вставляємо нашу кнопку на початок
        container.insertBefore(uatutTab, container.firstChild);
        
        // Шукаємо місце для вставки (після опису або перед списком)
        var insertPoint = document.querySelector('.description, .overview, .details, [class*="content"]');
        if (insertPoint && insertPoint.parentNode) {
            insertPoint.parentNode.insertBefore(container, insertPoint.nextSibling);
        } else {
            document.body.appendChild(container);
            container.style.margin = '20px auto';
            container.style.width = 'fit-content';
        }
        
        log('Власна панель вкладок створена');
        
        // Автоматично запускаємо пошук
        setTimeout(function() {
            searchOnBalancer();
        }, 200);
    }
    
    // Пошук фільму на балансері
    function searchOnBalancer() {
        log('Запуск пошуку на балансері...');
        
        // Отримуємо інформацію про фільм
        var movieInfo = getMovieInfo();
        
        if (!movieInfo.title) {
            showErrorMessage('Не вдалося отримати назву фільму');
            return;
        }
        
        // Формуємо URL для пошуку
        var searchQuery = movieInfo.title;
        if (movieInfo.year) {
            searchQuery += ' ' + movieInfo.year;
        }
        
        var encodedQuery = encodeURIComponent(searchQuery);
        var searchUrl = config.balancer + '?s=' + encodedQuery;
        
        log('Пошуковий запит: ' + searchQuery);
        log('URL: ' + searchUrl);
        
        // Показуємо завантаження
        showLoadingState(movieInfo);
        
        // Виконуємо пошук через fetch (з обробкою CORS)
        searchOnUatut(searchUrl, movieInfo);
    }
    
    // Отримання інформації про фільм
    function getMovieInfo() {
        var movieInfo = {
            title: '',
            year: '',
            originalTitle: ''
        };
        
        try {
            // Спробуємо отримати з Lampa
            if (window.Lampa && Lampa.Activity && Lampa.Activity.current()) {
                var card = Lampa.Activity.current().card;
                if (card) {
                    movieInfo.title = card.title || card.name || '';
                    movieInfo.year = card.release_date || card.first_air_date || '';
                    movieInfo.originalTitle = card.original_title || card.original_name || '';
                    
                    if (movieInfo.year && movieInfo.year.length >= 4) {
                        movieInfo.year = movieInfo.year.substring(0, 4);
                    }
                    
                    log('Інформація з Lampa: ' + movieInfo.title + ' (' + movieInfo.year + ')');
                    return movieInfo;
                }
            }
            
            // Якщо не вийшло, парсимо DOM
            var titleElement = document.querySelector('h1, h2, [class*="title"], [class*="name"]');
            if (titleElement) {
                movieInfo.title = titleElement.textContent.trim();
                log('Знайдено назву в DOM: ' + movieInfo.title);
            }
            
            // Шукаємо рік
            var yearMatch = document.body.textContent.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                movieInfo.year = yearMatch[0];
            }
            
        } catch (err) {
            log('Помилка отримання інформації: ' + err);
        }
        
        return movieInfo;
    }
    
    // Показ стану завантаження
    function showLoadingState(movieInfo) {
        // Видаляємо попередній контейнер
        var oldContainer = document.querySelector('.uatut-results');
        if (oldContainer) oldContainer.remove();
        
        // Створюємо контейнер для результатів
        var container = document.createElement('div');
        container.className = 'uatut-results';
        container.style.cssText = `
            margin: 20px;
            padding: 30px;
            background: rgba(20, 20, 30, 0.8);
            border-radius: 15px;
            border: 1px solid rgba(255, 107, 0, 0.3);
            min-height: 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        // Анімація завантаження
        var loader = document.createElement('div');
        loader.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <div style="width: 40px; height: 40px; border: 3px solid rgba(255,107,0,0.3); border-top: 3px solid #FF6B00; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 15px;"></div>
                <div style="color: #FF6B00; font-size: 18px; font-weight: bold;">Пошук на UATUT...</div>
            </div>
            <div style="color: white; text-align: center; margin-bottom: 15px;">
                <div style="font-size: 16px; margin-bottom: 5px;">${movieInfo.title}</div>
                ${movieInfo.year ? '<div style="font-size: 14px; color: rgba(255,255,255,0.7);">' + movieInfo.year + '</div>' : ''}
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        container.appendChild(loader);
        
        // Шукаємо місце для вставки
        var insertPoint = document.querySelector('.uatut-custom-tabs, .tabs, .tab-container') || 
                         document.querySelector('.description, .overview') ||
                         document.querySelector('[class*="content"]');
        
        if (insertPoint) {
            insertPoint.parentNode.insertBefore(container, insertPoint.nextSibling);
        } else {
            document.body.appendChild(container);
        }
    }
    
    // Виконання пошуку на UATUT
    function searchOnUatut(url, movieInfo) {
        // Для безпеки використовуємо проксі через CORS Anywhere або відкриваємо в новому вікні
        var corsProxy = 'https://cors-anywhere.herokuapp.com/';
        
        // Показуємо кнопки дій
        setTimeout(function() {
            showActionButtons(url, movieInfo);
        }, 1500);
    }
    
    // Показ кнопок дій
    function showActionButtons(url, movieInfo) {
        var container = document.querySelector('.uatut-results');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Заголовок
        var header = document.createElement('div');
        header.style.cssText = `
            color: #FF6B00;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
        `;
        header.textContent = config.name + ' - Результати пошуку';
        container.appendChild(header);
        
        // Інформація про фільм
        var info = document.createElement('div');
        info.style.cssText = `
            color: white;
            text-align: center;
            margin-bottom: 30px;
            padding: 15px;
            background: rgba(255,107,0,0.1);
            border-radius: 10px;
        `;
        info.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 5px;">${movieInfo.title}</div>
            ${movieInfo.year ? '<div style="font-size: 14px;">' + movieInfo.year + '</div>' : ''}
        `;
        container.appendChild(info);
        
        // Кнопки дій
        var actions = [
            {
                icon: '🔍',
                title: 'ВІДКРИТИ ПОШУК',
                desc: 'Перейти до результатів пошуку на UATUT',
                action: function() {
                    window.open(url, '_blank');
                },
                color: '#FF6B00'
            },
            {
                icon: '🎬',
                title: 'ПРЯМИЙ ПОШУК',
                desc: 'Спробувати знайти відео на сайті',
                action: function() {
                    searchDirectVideo(movieInfo);
                },
                color: '#2196F3'
            },
            {
                icon: '📋',
                title: 'КОПІЮВАТИ ПОСИЛАННЯ',
                desc: 'Скопіювати URL пошуку',
                action: function() {
                    navigator.clipboard.writeText(url).then(function() {
                        showMessage('Посилання скопійовано!');
                    });
                },
                color: '#4CAF50'
            }
        ];
        
        actions.forEach(function(action) {
            var button = document.createElement('div');
            button.style.cssText = `
                display: flex;
                align-items: center;
                padding: 15px 20px;
                margin: 10px 0;
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                border-left: 4px solid ${action.color};
            `;
            
            button.innerHTML = `
                <div style="font-size: 24px; margin-right: 15px;">${action.icon}</div>
                <div style="flex: 1;">
                    <div style="color: white; font-weight: bold; font-size: 16px;">${action.title}</div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 13px; margin-top: 3px;">${action.desc}</div>
                </div>
                <div style="color: ${action.color}; font-size: 20px;">→</div>
            `;
            
            button.onmouseover = function() {
                this.style.background = 'rgba(255,255,255,0.1)';
                this.style.transform = 'translateX(5px)';
            };
            
            button.onmouseout = function() {
                this.style.background = 'rgba(255,255,255,0.05)';
                this.style.transform = 'translateX(0)';
            };
            
            button.onclick = action.action;
            
            container.appendChild(button);
        });
        
        // Примітка
        var note = document.createElement('div');
        note.style.cssText = `
            color: rgba(255,255,255,0.5);
            font-size: 12px;
            text-align: center;
            margin-top: 20px;
            padding: 10px;
            background: rgba(0,0,0,0.3);
            border-radius: 5px;
        `;
        note.textContent = 'Для перегляду відео потрібно перейти на сайт UATUT';
        container.appendChild(note);
    }
    
    // Прямий пошук відео
    function searchDirectVideo(movieInfo) {
        showMessage('Прямий пошук відео...');
        // Тут може бути додаткова логіка для прямого парсингу
    }
    
    // Показ повідомлення
    function showMessage(text) {
        log('Повідомлення: ' + text);
        if (Lampa.Noty && Lampa.Noty.show) {
            Lampa.Noty.show(text);
        } else {
            alert(text);
        }
    }
    
    // Показ помилки
    function showErrorMessage(text) {
        var container = document.querySelector('.uatut-results');
        if (container) {
            container.innerHTML = `
                <div style="color: #FF5252; text-align: center; padding: 40px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                    <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Помилка</div>
                    <div style="font-size: 14px;">${text}</div>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #FF6B00; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Спробувати ще раз
                    </button>
                </div>
            `;
        }
    }
    
    // Ініціалізація плагіна
    function initPlugin() {
        log('Ініціалізація плагіна v' + config.version);
        
        // Чекаємо повного завантаження
        function start() {
            // Даємо час на завантаження інтерфейсу
            setTimeout(function() {
                addUatutTab();
            }, 2000);
            
            // Додаткова спроба через 5 секунд
            setTimeout(addUatutTab, 5000);
            
            // Спостерігач за змінами DOM
            var observer = new MutationObserver(function() {
                addUatutTab();
            });
            
            observer.observe(document.body, {
                ch
