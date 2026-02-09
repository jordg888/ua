(function() {
  'use strict';

  // Конфігурація плагіна
  var PluginConfig = {
    name: 'UATUT Balancer',
    version: '1.1',
    balancer_url: 'https://uk.uatut.fun/film/',
    github_raw: 'https://raw.githubusercontent.com/jordg888/ua/main/uatut-balancer.js'
  };

  // Унікальний ID користувача
  var getUserId = function() {
    var uid = Lampa.Storage.get('uatut_user_id', '');
    if (!uid) {
      uid = 'uatut_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      Lampa.Storage.set('uatut_user_id', uid);
    }
    return uid;
  };

  // Перевірка, чи ми на сторінці фільму/серіалу
  var isMoviePage = function() {
    var path = window.location.pathname;
    return path.includes('/movie/') || 
           path.includes('/tv/') || 
           document.querySelector('[class*="card-"][class*="movie"], [class*="card-"][class*="tv"]') ||
           document.querySelector('.movie-card, .tv-card, .card-wrapper');
  };

  // Отримання інформації про поточний фільм
  var getCurrentMovieInfo = function() {
    var movie = null;
    
    // Спробуємо отримати з Lampa Activity
    if (Lampa.Activity && Lampa.Activity.current() && Lampa.Activity.current().card) {
      movie = Lampa.Activity.current().card;
    }
    
    // Якщо не вийшло, спробуємо знайти в DOM
    if (!movie) {
      var titleElem = document.querySelector('h1, h2, [class*="title"], [class*="name"]');
      var yearElem = document.querySelector('[class*="year"], [class*="date"]');
      
      if (titleElem) {
        movie = {
          title: titleElem.textContent.trim(),
          year: yearElem ? yearElem.textContent.trim() : '',
          original_title: titleElem.textContent.trim()
        };
      }
    }
    
    return movie;
  };

  // Головний клас плагіна
  var UatutPlugin = function() {
    this.name = PluginConfig.name;
    this.version = PluginConfig.version;
    this.initialized = false;
    this.buttonAdded = false;
  };

  // Ініціалізація плагіна
  UatutPlugin.prototype.init = function() {
    if (this.initialized) return this;
    
    console.log('[' + PluginConfig.name + '] Плагін ініціалізовано v' + this.version);
    
    // Додаємо CSS стилі
    this.addStyles();
    
    // Спостерігаємо за змінами сторінки
    this.setupPageObserver();
    
    // Спроба додати кнопку одразу
    this.tryAddButton();
    
    this.initialized = true;
    return this;
  };

  // Додавання CSS стилів
  UatutPlugin.prototype.addStyles = function() {
    if (document.querySelector('#uatut-balancer-styles')) return;
    
    var style = document.createElement('style');
    style.id = 'uatut-balancer-styles';
    style.textContent = `
      /* Кнопка балансера */
      .uatut-balancer-button {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 10px 20px !important;
        margin: 10px 5px !important;
        background: linear-gradient(135deg, #FF6B00 0%, #FF3D00 100%) !important;
        color: white !important;
        border-radius: 25px !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        cursor: pointer !important;
        border: none !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 15px rgba(255, 107, 0, 0.4) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      
      .uatut-balancer-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(255, 107, 0, 0.6) !important;
        background: linear-gradient(135deg, #FF7B20 0%, #FF5500 100%) !important;
      }
      
      .uatut-balancer-button:active {
        transform: translateY(0) !important;
      }
      
      .uatut-balancer-button .icon {
        margin-right: 8px !important;
        font-size: 16px !important;
      }
      
      /* Контейнер для кнопки */
      .uatut-button-container {
        display: flex !important;
        justify-content: center !important;
        margin: 20px 0 !important;
        padding: 0 20px !important;
      }
      
      /* Меню */
      .uatut-menu-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.8) !important;
        z-index: 9998 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        backdrop-filter: blur(5px) !important;
      }
      
      .uatut-menu {
        background: rgba(30, 30, 40, 0.95) !important;
        border-radius: 15px !important;
        padding: 0 !important;
        width: 90% !important;
        max-width: 500px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        border: 1px solid rgba(255, 107, 0, 0.3) !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7) !important;
        z-index: 9999 !important;
      }
      
      .uatut-menu-header {
        padding: 20px !important;
        background: rgba(255, 107, 0, 0.1) !important;
        border-bottom: 1px solid rgba(255, 107, 0, 0.3) !important;
        border-radius: 15px 15px 0 0 !important;
      }
      
      .uatut-menu-title {
        color: #FF6B00 !important;
        font-size: 20px !important;
        font-weight: 700 !important;
        margin-bottom: 5px !important;
      }
      
      .uatut-menu-subtitle {
        color: rgba(255, 255, 255, 0.7) !important;
        font-size: 14px !important;
      }
      
      .uatut-menu-item {
        padding: 15px 20px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        cursor: pointer !important;
        transition: background 0.2s !important;
      }
      
      .uatut-menu-item:hover {
        background: rgba(255, 107, 0, 0.1) !important;
      }
      
      .uatut-menu-item-title {
        color: white !important;
        font-size: 16px !important;
        font-weight: 500 !important;
        margin-bottom: 4px !important;
        display: flex !important;
        align-items: center !important;
      }
      
      .uatut-menu-item-desc {
        color: rgba(255, 255, 255, 0.6) !important;
        font-size: 13px !important;
      }
      
      .uatut-menu-icon {
        margin-right: 10px !important;
        font-size: 18px !important;
      }
      
      .uatut-menu-footer {
        padding: 15px 20px !important;
        text-align: center !important;
        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      .uatut-close-btn {
        padding: 8px 25px !important;
        background: rgba(255, 107, 0, 0.2) !important;
        color: white !important;
        border: 1px solid rgba(255, 107, 0, 0.5) !important;
        border-radius: 20px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        transition: all 0.3s !important;
      }
      
      .uatut-close-btn:hover {
        background: rgba(255, 107, 0, 0.3) !important;
      }
    `;
    
    document.head.appendChild(style);
  };

  // Пошук місця для кнопки на сторінці фільму
  UatutPlugin.prototype.findButtonPlace = function() {
    // Можливі місця для кнопки на сторінці фільму
    var selectors = [
      // Кнопки дій (дивитися, в обране тощо)
      '.buttons-wrapper',
      '.action-buttons',
      '.card-buttons',
      '[class*="button"][class*="group"]',
      '[class*="actions"]',
      
      // Панель інструментів
      '.toolbar',
      '.player-toolbar',
      
      // Біля опису
      '.description',
      '.overview',
      '.details',
      
      // Заголовок
      '.title-block',
      '.header-wrapper'
    ];
    
    for (var i = 0; i < selectors.length; i++) {
      var element = document.querySelector(selectors[i]);
      if (element) {
        return element;
      }
    }
    
    // Якщо не знайшли, шукаємо будь-який контейнер на сторінці фільму
    var containers = document.querySelectorAll('div, section, article, main');
    for (var j = 0; j < containers.length; j++) {
      var container = containers[j];
      if (container.className && 
          (container.className.includes('movie') || 
           container.className.includes('tv') || 
           container.className.includes('card') ||
           container.className.includes('detail'))) {
        return container;
      }
    }
    
    return null;
  };

  // Додавання кнопки на сторінку фільму
  UatutPlugin.prototype.addButtonToPage = function() {
    if (this.buttonAdded || !isMoviePage()) return;
    
    var place = this.findButtonPlace();
    if (!place) {
      console.log('[' + PluginConfig.name + '] Не знайдено місце для кнопки');
      return false;
    }
    
    // Перевіряємо, чи кнопка вже є
    if (place.querySelector('.uatut-balancer-button')) {
      this.buttonAdded = true;
      return true;
    }
    
    // Створюємо контейнер для кнопки
    var container = document.createElement('div');
    container.className = 'uatut-button-container';
    
    // Створюємо кнопку
    var button = document.createElement('button');
    button.className = 'uatut-balancer-button';
    button.innerHTML = '<span class="icon">🎬</span> ПОДИВИТИСЯ НА UATUT';
    
    var _this = this;
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      _this.openMovieMenu();
    });
    
    container.appendChild(button);
    
    // Додаємо кнопку в знайдене місце
    try {
      place.appendChild(container);
      
      // Альтернативно: додаємо після або перед елементом
      if (place.nextSibling) {
        place.parentNode.insertBefore(container, place.nextSibling);
      } else {
        place.parentNode.appendChild(container);
      }
      
      console.log('[' + PluginConfig.name + '] Кнопка додана на сторінку фільму');
      this.buttonAdded = true;
      return true;
    } catch (e) {
      console.error('[' + PluginConfig.name + '] Помилка додавання кнопки:', e);
      return false;
    }
  };

  // Спроба додати кнопку
  UatutPlugin.prototype.tryAddButton = function() {
    var _this = this;
    
    // Чекаємо, доки сторінка повністю завантажиться
    setTimeout(function() {
      if (isMoviePage()) {
        _this.addButtonToPage();
      }
    }, 2000);
    
    // Додаткова спроба через 5 секунд
    setTimeout(function() {
      if (isMoviePage() && !_this.buttonAdded) {
        _this.addButtonToPage();
      }
    }, 5000);
  };

  // Відкриття меню для фільму
  UatutPlugin.prototype.openMovieMenu = function() {
    var movie = getCurrentMovieInfo();
    if (!movie) {
      this.showMessage('Не вдалося отримати інформацію про фільм');
      return;
    }
    
    var searchQuery = movie.title || movie.original_title || movie.name;
    var year = movie.year || movie.release_date || '';
    if (year && typeof year === 'string' && year.length > 4) {
      year = year.substring(0, 4);
    }
    
    var fullQuery = searchQuery + (year ? ' ' + year : '');
    var encodedQuery = encodeURIComponent(fullQuery);
    var searchUrl = PluginConfig.balancer_url + '?s=' + encodedQuery;
    
    // Створюємо меню
    this.showMovieMenu(searchQuery, year, searchUrl);
  };

  // Показ меню для фільму
  UatutPlugin.prototype.showMovieMenu = function(title, year, searchUrl) {
    var _this = this;
    
    // Створюємо overlay
    var overlay = document.createElement('div');
    overlay.className = 'uatut-menu-overlay';
    
    // Створюємо меню
    var menu = document.createElement('div');
    menu.className = 'uatut-menu';
    
    // Заголовок
    var header = document.createElement('div');
    header.className = 'uatut-menu-header';
    header.innerHTML = `
      <div class="uatut-menu-title">${PluginConfig.name}</div>
      <div class="uatut-menu-subtitle">${title}${year ? ' (' + year + ')' : ''}</div>
    `;
    menu.appendChild(header);
    
    // Елементи меню
    var menuItems = [
      {
        icon: '🔍',
        title: 'Пошук на UATUT',
        desc: 'Знайти на сайті балансера',
        action: function() {
          window.open(searchUrl, '_blank');
          _this.closeMenu(overlay);
        }
      },
      {
        icon: '🌐',
        title: 'Відкрити сайт балансера',
        desc: PluginConfig.balancer_url,
        action: function() {
          window.open(PluginConfig.balancer_url, '_blank');
          _this.closeMenu(overlay);
        }
      },
      {
        icon: '📋',
        title: 'Копіювати посилання',
        desc: 'Скопіювати URL пошуку',
        action: function() {
          navigator.clipboard.writeText(searchUrl).then(function() {
            _this.showMessage('Посилання скопійовано!');
            _this.closeMenu(overlay);
          });
        }
      },
      {
        icon: '⚙️',
        title: 'Налаштування плагіна',
        desc: 'User ID: ' + getUserId(),
        action: function() {
          _this.showSettings();
          _this.closeMenu(overlay);
        }
      }
    ];
    
    // Додаємо елементи меню
    menuItems.forEach(function(item) {
      var menuItem = document.createElement('div');
      menuItem.className = 'uatut-menu-item';
      menuItem.innerHTML = `
        <div class="uatut-menu-item-title">
          <span class="uatut-menu-icon">${item.icon}</span>
          ${item.title}
        </div>
        <div class="uatut-menu-item-desc">${item.desc}</div>
      `;
      
      menuItem.addEventListener('click', item.action);
      menu.appendChild(menuItem);
    });
    
    // Футер з кнопкою закриття
    var footer = document.createElement('div');
    footer.className = 'uatut-menu-footer';
    
    var closeBtn = document.createElement('button');
    closeBtn.className = 'uatut-close-btn';
    closeBtn.textContent = 'ЗАКРИТИ';
    closeBtn.addEventListener('click', function() {
      _this.closeMenu(overlay);
    });
    
    footer.appendChild(closeBtn);
    menu.appendChild(footer);
    
    // Додаємо в DOM
    overlay.appendChild(menu);
    document.body.appendChild(overlay);
    
    // Закриття при кліку на overlay
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        _this.closeMenu(overlay);
      }
    });
  };

  // Закриття меню
  UatutPlugin.prototype.closeMenu = function(overlay) {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };

  // Налаштування
  UatutPlugin.prototype.showSettings = function() {
    var overlay = document.createElement('div');
    overlay.className = 'uatut-menu-overlay';
    
    var menu = document.createElement('div');
    menu.className = 'uatut-menu';
    
    var header = document.createElement('div');
    header.className = 'uatut-menu-header';
    header.innerHTML = `
      <div class="uatut-menu-title">Налаштування</div>
      <div class="uatut-menu-subtitle">${PluginConfig.name} v${PluginConfig.version}</div>
    `;
    menu.appendChild(header);
    
    var settingsItems = [
      {
        icon: '👤',
        title: 'Ваш User ID',
        desc: getUserId(),
        action: function() {
          navigator.clipboard.writeText(getUserId());
          alert('User ID скопійовано!');
        }
      },
      {
        icon: '🔗',
        title: 'Балансер UATUT',
        desc: PluginConfig.balancer_url,
        action: function() {
          window.open(PluginConfig.balancer_url, '_blank');
        }
      },
      {
        icon: '🔄',
        title: 'Оновити плагін',
        desc: 'Перезавантажити сторінку',
        action: function() {
          location.reload();
        }
      }
    ];
    
    settingsItems.forEach(function(item) {
      var menuItem = document.createElement('div');
      menuItem.className = 'uatut-menu-item';
      menuItem.innerHTML = `
        <div class="uatut-menu-item-title">
          <span class="uatut-menu-icon">${item.icon}</span>
          ${item.title}
        </div>
        <div class="uatut-menu-item-desc">${item.desc}</div>
      `;
      
      menuItem.addEventListener('click', item.action);
      menu.appendChild(menuItem);
    });
    
    var footer = document.createElement('div');
    footer.className = 'uatut-menu-footer';
    
    var closeBtn = document.createElement('button');
    closeBtn.className = 'uatut-close-btn';
    closeBtn.textContent = 'НАЗАД';
    closeBtn.addEventListener('click', function() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    });
    
    footer.appendChild(closeBtn);
    menu.appendChild(footer);
    
    overlay.appendChild(menu);
    document.body.appendChild(overlay);
  };

  // Показ повідомлення
  UatutPlugin.prototype.showMessage = function(text) {
    if (Lampa.Noty && Lampa.Noty.show) {
      Lampa.Noty.show(text);
    } else {
      alert(text);
    }
  };

  // Спостерігач за змінами сторінки
  UatutPlugin.prototype.setupPageObserver = function() {
    var _this = this;
    
    // Спостерігаємо за змінами DOM
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          // Перевіряємо, чи ми на сторінці фільму
          if (isMoviePage() && !_this.buttonAdded) {
            _this.addButtonToPage();
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Також слідкуємо за зміною URL (SPA навігація)
    var lastUrl = location.href;
    setInterval(function() {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        _this.buttonAdded = false;
        
        if (isMoviePage()) {
          setTimeout(function() {
            _this.addButtonToPage();
          }, 1000);
        }
      }
    }, 1000);
  };

  // Автоматична ініціалізація
  var initPlugin = function() {
    if (!window.Lampa) {
      console.log('[' + PluginConfig.name + '] Чекаємо завантаження Lampa...');
      setTimeout(initPlugin, 1000);
      return;
    }
    
    if (!window.uatutPlugin) {
      window.uatutPlugin = new UatutPlugin().init();
      
      console.log('%c[UATUT Balancer]%c Плагін завантажено!', 
        'background: #FF6B00; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
        'color: #FF6B00; font-weight: bold;'
      );
      console.log('Кнопка з\'явиться на сторінці фільму');
    }
  };

  // Запуск при завантаженні сторінки
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlugin);
  } else {
    initPlugin();
  }

  // Резервний запуск
  setTimeout(initPlugin, 3000);

})();
