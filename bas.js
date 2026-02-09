(function() {
  'use strict';

  // Конфігурація плагіна
  var PluginConfig = {
    name: 'UATUT Balancer',
    version: '1.0',
    balancer_url: 'https://uk.uatut.fun/film/',
    github_raw: 'https://raw.githubusercontent.com/jordg888/ua/main/bas.js',
    author: 'jordg888'
  };

  // Унікальний ID користувача
  var getUserId = function() {
    var uid = Lampa.Storage.get('uatut_user_id', '');
    if (!uid) {
      uid = 'uatut_' + Lampa.Utils.uid(8).toLowerCase();
      Lampa.Storage.set('uatut_user_id', uid);
    }
    return uid;
  };

  // Перевірка наявності Lampa
  if (!window.Lampa) {
    console.error('Lampa не знайдено! Плагін UATUT не може бути ініціалізований.');
    return;
  }

  // Головний клас плагіна
  var UatutPlugin = function() {
    this.name = PluginConfig.name;
    this.version = PluginConfig.version;
    this.initialized = false;
  };

  // Ініціалізація плагіна
  UatutPlugin.prototype.init = function() {
    if (this.initialized) return this;
    
    console.log('[' + PluginConfig.name + '] Плагін ініціалізовано v' + this.version);
    console.log('[' + PluginConfig.name + '] Балансер: ' + PluginConfig.balancer_url);
    console.log('[' + PluginConfig.name + '] User ID: ' + getUserId());
    
    // Додаємо CSS стилі
    this.addStyles();
    
    // Додаємо кнопку в інтерфейс
    this.addBalancerButton();
    
    // Налаштовуємо обробник подій
    this.setupEventListeners();
    
    this.initialized = true;
    return this;
  };

  // Додавання CSS стилів
  UatutPlugin.prototype.addStyles = function() {
    if (document.querySelector('#uatut-styles')) return;
    
    var style = document.createElement('style');
    style.id = 'uatut-styles';
    style.textContent = `
      .uatut-balancer-btn {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 8px !important;
        padding: 8px 16px !important;
        background: linear-gradient(135deg, #ff6b00 0%, #ff3d00 100%) !important;
        color: white !important;
        border-radius: 20px !important;
        cursor: pointer !important;
        font-weight: 500 !important;
        font-size: 14px !important;
        transition: all 0.3s ease !important;
        border: none !important;
        min-width: 100px !important;
        height: 36px !important;
        box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3) !important;
      }
      
      .uatut-balancer-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 16px rgba(255, 107, 0, 0.5) !important;
        background: linear-gradient(135deg, #ff7b20 0%, #ff5500 100%) !important;
      }
      
      .uatut-balancer-btn:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(255, 107, 0, 0.3) !important;
      }
      
      .uatut-balancer-btn .uatut-icon {
        margin-right: 6px !important;
        font-size: 16px !important;
      }
      
      .uatut-menu-item {
        padding: 12px 16px !important;
        border-bottom: 1px solid rgba(255,255,255,0.1) !important;
      }
      
      .uatut-menu-item:hover {
        background: rgba(255, 107, 0, 0.1) !important;
      }
      
      .uatut-menu-title {
        color: #ff6b00 !important;
        font-weight: 600 !important;
        margin-bottom: 4px !important;
      }
      
      .uatut-menu-desc {
        color: rgba(255,255,255,0.7) !important;
        font-size: 12px !important;
      }
    `;
    
    document.head.appendChild(style);
  };

  // Пошук правильного місця для кнопки
  UatutPlugin.prototype.findToolbar = function() {
    // Спробуємо різні місця, де може бути панель інструментів
    var selectors = [
      '.toolbar',
      '.navigation',
      '.player-controls',
      '.controls',
      '.header',
      '.head',
      '[class*="toolbar"]',
      '[class*="navigation"]'
    ];
    
    for (var i = 0; i < selectors.length; i++) {
      var element = document.querySelector(selectors[i]);
      if (element) {
        return element;
      }
    }
    
    // Якщо не знайшли, створимо власну панель
    return this.createToolbar();
  };

  // Створення власної панелі, якщо не знайдено
  UatutPlugin.prototype.createToolbar = function() {
    var existingToolbar = document.querySelector('.uatut-toolbar');
    if (existingToolbar) return existingToolbar;
    
    var toolbar = document.createElement('div');
    toolbar.className = 'uatut-toolbar';
    toolbar.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      gap: 10px;
      background: rgba(20, 20, 30, 0.9);
      padding: 10px;
      border-radius: 10px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 107, 0, 0.3);
    `;
    
    document.body.appendChild(toolbar);
    return toolbar;
  };

  // Додавання кнопки в інтерфейс
  UatutPlugin.prototype.addBalancerButton = function() {
    var _this = this;
    
    // Функція для додавання кнопки
    var addButton = function() {
      var toolbar = _this.findToolbar();
      if (!toolbar) {
        console.log('[' + PluginConfig.name + '] Панель не знайдена, спробуємо пізніше');
        setTimeout(addButton, 1000);
        return;
      }
      
      // Перевіримо, чи вже є наша кнопка
      if (toolbar.querySelector('.uatut-balancer-btn')) {
        return;
      }
      
      // Створюємо кнопку
      var button = document.createElement('button');
      button.className = 'uatut-balancer-btn';
      button.innerHTML = '<span class="uatut-icon">🎬</span> UATUT';
      
      // Додаємо обробник кліку
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        _this.openBalancerMenu();
      });
      
      // Додаємо кнопку
      toolbar.appendChild(button);
      console.log('[' + PluginConfig.name + '] Кнопка додана до інтерфейсу');
    };
    
    // Чекаємо завантаження DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', addButton);
    } else {
      setTimeout(addButton, 1000);
    }
  };

  // Відкриття меню балансера
  UatutPlugin.prototype.openBalancerMenu = function() {
    var _this = this;
    
    // Отримуємо поточний контент
    var currentActivity = Lampa.Activity.current();
    var currentCard = currentActivity ? currentActivity.card : null;
    
    // Створюємо елементи меню
    var menuItems = [];
    
    // Якщо є контент, додаємо опції для нього
    if (currentCard) {
      var title = currentCard.title || currentCard.name || currentCard.original_title || 'Невідомий контент';
      var year = currentCard.release_date ? new Date(currentCard.release_date).getFullYear() : 
                currentCard.first_air_date ? new Date(currentCard.first_air_date).getFullYear() : 
                currentCard.year || '';
      
      menuItems.push({
        type: 'title',
        title: 'Поточний контент:',
        subtitle: title + (year ? ' (' + year + ')' : '')
      });
      
      menuItems.push({
        title: '🔍 Пошук на UATUT',
        description: 'Знайти "' + title + '" на балансері',
        action: function() {
          _this.searchOnUatut(currentCard);
        }
      });
      
      menuItems.push({
        title: '🌐 Відкрити сторінку',
        description: 'Перейти на сайт балансера',
        action: function() {
          window.open(PluginConfig.balancer_url, '_blank');
        }
      });
    }
    
    // Загальні опції
    menuItems.push({
      title: '⚙️ Налаштування плагіна',
      description: 'User ID: ' + getUserId(),
      action: function() {
        _this.showSettings();
      }
    });
    
    menuItems.push({
      title: '📁 Ваш репозиторій',
      description: PluginConfig.github_raw,
      action: function() {
        window.open(PluginConfig.github_raw, '_blank');
      }
    });
    
    menuItems.push({
      title: '🔄 Оновити плагін',
      description: 'Перезавантажити плагін',
      action: function() {
        location.reload();
      }
    });
    
    // Відображення меню
    this.showCustomMenu(menuItems);
  };

  // Показ власного меню
  UatutPlugin.prototype.showCustomMenu = function(items) {
    // Закриваємо попереднє меню
    var existingMenu = document.querySelector('.uatut-custom-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    // Створюємо меню
    var menu = document.createElement('div');
    menu.className = 'uatut-custom-menu';
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 30, 0.95);
      border-radius: 12px;
      padding: 0;
      width: 400px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      z-index: 10000;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 107, 0, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    `;
    
    // Заголовок
    var header = document.createElement('div');
    header.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid rgba(255, 107, 0, 0.3);
      background: rgba(255, 107, 0, 0.1);
    `;
    header.innerHTML = `
      <div style="font-size: 20px; font-weight: 600; color: #ff6b00; margin-bottom: 5px;">
        ${PluginConfig.name} v${PluginConfig.version}
      </div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.7);">
        Балансер: ${PluginConfig.balancer_url}
      </div>
    `;
    menu.appendChild(header);
    
    // Додаємо елементи меню
    items.forEach(function(item, index) {
      if (item.type === 'title') {
        var titleItem = document.createElement('div');
        titleItem.style.cssText = `
          padding: 15px 20px;
          background: rgba(255, 107, 0, 0.05);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        titleItem.innerHTML = `
          <div style="color: #ff6b00; font-weight: 500; margin-bottom: 5px;">${item.title}</div>
          <div style="color: rgba(255,255,255,0.9); font-size: 14px;">${item.subtitle || ''}</div>
        `;
        menu.appendChild(titleItem);
      } else {
        var menuItem = document.createElement('div');
        menuItem.className = 'uatut-menu-item';
        menuItem.style.cssText = `
          cursor: pointer;
          transition: background 0.2s;
        `;
        menuItem.innerHTML = `
          <div class="uatut-menu-title">${item.title}</div>
          <div class="uatut-menu-desc">${item.description || ''}</div>
        `;
        
        menuItem.addEventListener('click', function(e) {
          e.stopPropagation();
          if (item.action) item.action();
          menu.remove();
        });
        
        menu.appendChild(menuItem);
      }
    });
    
    // Кнопка закриття
    var footer = document.createElement('div');
    footer.style.cssText = `
      padding: 15px 20px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.1);
    `;
    
    var closeBtn = document.createElement('button');
    closeBtn.textContent = 'Закрити';
    closeBtn.style.cssText = `
      padding: 8px 24px;
      background: rgba(255, 107, 0, 0.2);
      color: white;
      border: 1px solid rgba(255, 107, 0, 0.5);
      border-radius: 20px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.addEventListener('click', function() {
      menu.remove();
    });
    
    footer.appendChild(closeBtn);
    menu.appendChild(footer);
    
    // Фон для закриття при кліку поза меню
    var overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      backdrop-filter: blur(5px);
    `;
    
    overlay.addEventListener('click', function() {
      menu.remove();
      overlay.remove();
    });
    
    document.body.appendChild(overlay);
    document.body.appendChild(menu);
    
    // Фокус на меню
    menu.focus();
  };

  // Пошук на UATUT
  UatutPlugin.prototype.searchOnUatut = function(card) {
    var searchQuery = '';
    
    // Формуємо запит
    if (card.title) {
      searchQuery = card.title + ' ' + (card.year || '');
    } else if (card.original_title) {
      searchQuery = card.original_title + ' ' + (card.year || '');
    } else if (card.name) {
      searchQuery = card.name + ' ' + (card.year || '');
    }
    
    if (searchQuery) {
      var encodedQuery = encodeURIComponent(searchQuery);
      var searchUrl = PluginConfig.balancer_url + '?s=' + encodedQuery;
      
      // Показуємо діалог
      this.showSearchDialog(searchQuery, searchUrl);
    } else {
      this.showNotification('Не вдалося сформувати пошуковий запит', 'error');
    }
  };

  // Діалог пошуку
  UatutPlugin.prototype.showSearchDialog = function(query, url) {
    var dialogItems = [
      {
        type: 'title',
        title: 'Пошук на UATUT',
        subtitle: 'Запит: ' + query
      },
      {
        title: '🌐 Відкрити в браузері',
        description: 'Перейти до результатів пошуку',
        action: function() {
          window.open(url, '_blank');
        }
      },
      {
        title: '📋 Копіювати посилання',
        description: 'Скопіювати URL у буфер обміну',
        action: function() {
          navigator.clipboard.writeText(url).then(function() {
            UatutPlugin.prototype.showNotification('Посилання скопійовано!', 'success');
          });
        }
      },
      {
        title: '🎬 Прямий пошук',
        description: 'Спробувати знайти відео',
        action: function() {
          UatutPlugin.prototype.tryDirectSearch(url);
        }
      }
    ];
    
    this.showCustomMenu(dialogItems);
  };

  // Спроба прямого пошуку
  UatutPlugin.prototype.tryDirectSearch = function(url) {
    this.showNotification('Пошук відео...', 'info');
    
    // Можна додати реальний парсинг тут
    setTimeout(function() {
      UatutPlugin.prototype.showNotification('Функція в розробці. Використовуйте посилання вище.', 'info');
    }, 1000);
  };

  // Налаштування
  UatutPlugin.prototype.showSettings = function() {
    var settingsItems = [
      {
        type: 'title',
        title: 'Налаштування плагіна',
        subtitle: PluginConfig.name + ' v' + PluginConfig.version
      },
      {
        title: '👤 Ваш User ID',
        description: getUserId(),
        action: function() {
          navigator.clipboard.writeText(getUserId());
          UatutPlugin.prototype.showNotification('User ID скопійовано!', 'success');
        }
      },
      {
        title: '🔗 URL балансера',
        description: PluginConfig.balancer_url,
        action: function() {
          navigator.clipboard.writeText(PluginConfig.balancer_url);
          UatutPlugin.prototype.showNotification('URL скопійовано!', 'success');
        }
      },
      {
        title: '📁 GitHub репозиторій',
        description: PluginConfig.github_raw,
        action: function() {
          window.open(PluginConfig.github_raw, '_blank');
        }
      },
      {
        title: '🔄 Скинути налаштування',
        description: 'Очистити всі збережені дані',
        action: function() {
          Lampa.Storage.set('uatut_user_id', '');
          UatutPlugin.prototype.showNotification('Налаштування скинуті! Перезавантажте сторінку.', 'info');
        }
      }
    ];
    
    this.showCustomMenu(settingsItems);
  };

  // Показ сповіщень
  UatutPlugin.prototype.showNotification = function(message, type) {
    if (Lampa.Noty && Lampa.Noty.show) {
      Lampa.Noty.show(message);
    } else {
      // Резервний варіант
      alert(message);
    }
  };

  // Налаштування обробників подій
  UatutPlugin.prototype.setupEventListeners = function() {
    var _this = this;
    
    // Оновлюємо кнопку при зміні сторінок
    var originalActivity = Lampa.Activity;
    if (originalActivity && originalActivity.replace) {
      var originalReplace = originalActivity.replace;
      originalActivity.replace = function() {
        var result = originalReplace.apply(this, arguments);
        setTimeout(function() {
          _this.addBalancerButton();
        }, 500);
        return result;
      };
    }
    
    // Додаємо кнопку при зміні DOM
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          _this.addBalancerButton();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // Автоматична ініціалізація
  var initializePlugin = function() {
    if (window.Lampa && !window.uatutPluginInstance) {
      window.uatutPluginInstance = new UatutPlugin().init();
      
      // Додаємо інформацію в консоль
      console.log('%c[UATUT Balancer]%c Плагін успішно завантажено!', 
        'background: #ff6b00; color: white; padding: 2px 6px; border-radius: 3px;',
        'color: #ff6b00;'
      );
      console.log('%cGitHub:%c ' + PluginConfig.github_raw, 
        'font-weight: bold;', 
        'color: #0366d6;'
      );
    }
  };

  // Запуск ініціалізації
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePlugin);
  } else {
    setTimeout(initializePlugin, 1000);
  }

  // Резервний запуск
  var initAttempts = 0;
  var initInterval = setInterval(function() {
    if (window.Lampa) {
      clearInterval(initInterval);
      initializePlugin();
    } else if (initAttempts > 10) {
      clearInterval(initInterval);
      console.error('Lampa не знайдено після 10 спроб');
    }
    initAttempts++;
  }, 1000);

})();
