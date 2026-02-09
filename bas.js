(function() {
  'use strict';

  // Налаштування
  var PluginConfig = {
    name: 'UATUT Balancer',
    version: '1.0',
    balancer_url: 'https://uk.uatut.fun/film/',
    api_url: 'https://uk.uatut.fun/'
  };

  // Унікальний ID користувача
  var getUserId = function() {
    var uid = Lampa.Storage.get('uatut_user_id', '');
    if (!uid) {
      uid = Lampa.Utils.uid(8).toLowerCase();
      Lampa.Storage.set('uatut_user_id', uid);
    }
    return uid;
  };

  // Головний клас плагіна
  var UatutPlugin = function() {
    this.name = PluginConfig.name;
    this.version = PluginConfig.version;
  };

  // Ініціалізація плагіна
  UatutPlugin.prototype.init = function() {
    console.log('[' + PluginConfig.name + '] Плагін ініціалізовано v' + PluginConfig.version);
    
    // Додаємо кнопку в інтерфейс
    this.addBalancerButton();
    
    // Реєструємо обробник для сторінок контенту
    this.setupContentHandler();
    
    return this;
  };

  // Додавання кнопки в інтерфейс
  UatutPlugin.prototype.addBalancerButton = function() {
    var _this = this;
    
    // Чекаємо завантаження інтерфейсу
    setTimeout(function() {
      // Шукаємо панель керування
      var controls = document.querySelector('.player-controls');
      
      if (controls && !controls.querySelector('.uatut-balancer-btn')) {
        var button = document.createElement('div');
        button.className = 'uatut-balancer-btn player-button';
        button.innerHTML = '<div style="padding: 8px 12px; font-size: 14px;">🎬 UATUT</div>';
        button.style.cssText = 'margin: 0 5px; cursor: pointer; border-radius: 4px; background: rgba(255, 107, 0, 0.2);';
        
        button.addEventListener('click', function() {
          _this.openBalancerMenu();
        });
        
        // Додаємо кнопку
        controls.appendChild(button);
        console.log('[' + PluginConfig.name + '] Кнопка додана');
      }
    }, 3000);
  };

  // Відкриття меню балансера
  UatutPlugin.prototype.openBalancerMenu = function() {
    var _this = this;
    
    // Отримуємо поточний фільм/серіал
    var currentCard = Lampa.Activity.current().card;
    if (!currentCard) {
      Lampa.Noty.show('Не вдалося отримати інформацію про контент');
      return;
    }
    
    // Створюємо меню
    var menu = Lampa.Select.create({
      title: 'UATUT Balancer',
      items: [
        { 
          title: '🔍 Пошук на UATUT', 
          value: 'search',
          description: 'Знайти на ' + PluginConfig.balancer_url
        },
        { 
          title: '🎬 Пряме посилання', 
          value: 'direct',
          description: 'Відкрити сторінку фільму'
        },
        { 
          title: '⚙️ Налаштування', 
          value: 'settings',
          description: 'Налаштування плагіна'
        }
      ],
      onSelect: function(item) {
        if (item.value === 'search') {
          _this.searchOnUatut(currentCard);
        } else if (item.value === 'direct') {
          _this.openDirectLink(currentCard);
        } else if (item.value === 'settings') {
          _this.showSettings();
        }
      }
    });
    
    menu.show();
  };

  // Пошук на UATUT
  UatutPlugin.prototype.searchOnUatut = function(card) {
    var searchQuery = '';
    
    // Формуємо пошуковий запит
    if (card.title) {
      searchQuery = encodeURIComponent(card.title + ' ' + (card.year || ''));
    } else if (card.original_title) {
      searchQuery = encodeURIComponent(card.original_title + ' ' + (card.year || ''));
    } else if (card.name) {
      searchQuery = encodeURIComponent(card.name + ' ' + (card.year || ''));
    }
    
    if (searchQuery) {
      var searchUrl = PluginConfig.balancer_url + '?s=' + searchQuery;
      
      // Відкриваємо в новому вікні або показуємо посилання
      Lampa.Select.create({
        title: 'Пошук на UATUT',
        text: 'Запит: ' + decodeURIComponent(searchQuery),
        items: [
          {
            title: '🔗 Відкрити посилання',
            value: 'open'
          },
          {
            title: '📋 Копіювати URL',
            value: 'copy'
          }
        ],
        onSelect: function(item) {
          if (item.value === 'open') {
            window.open(searchUrl, '_blank');
          } else if (item.value === 'copy') {
            navigator.clipboard.writeText(searchUrl).then(function() {
              Lampa.Noty.show('Посилання скопійовано');
            });
          }
        }
      }).show();
    } else {
      Lampa.Noty.show('Не вдалося сформувати запит для пошуку');
    }
  };

  // Пряме посилання
  UatutPlugin.prototype.openDirectLink = function(card) {
    var filmId = card.id || card.tmdb_id || card.kinopoisk_id;
    
    if (filmId) {
      var directUrl = PluginConfig.balancer_url + filmId;
      
      Lampa.Select.create({
        title: 'Пряме посилання',
        text: 'ID: ' + filmId,
        items: [
          {
            title: '🌐 Відкрити в браузері',
            value: 'browser'
          },
          {
            title: '📁 Відкрити в Lampa',
            value: 'lampa'
          }
        ],
        onSelect: function(item) {
          if (item.value === 'browser') {
            window.open(directUrl, '_blank');
          } else if (item.value === 'lampa') {
            // Тут може бути логіка для парсингу сторінки
            Lampa.Noty.show('Функція в розробці');
          }
        }
      }).show();
    } else {
      Lampa.Noty.show('ID фільму не знайдено');
    }
  };

  // Налаштування
  UatutPlugin.prototype.showSettings = function() {
    Lampa.Select.create({
      title: 'Налаштування UATUT',
      items: [
        {
          title: '🆔 Ваш User ID: ' + getUserId(),
          value: 'id'
        },
        {
          title: '🔗 Балансер: ' + PluginConfig.balancer_url,
          value: 'url'
        },
        {
          title: '🔄 Скинути налаштування',
          value: 'reset'
        }
      ],
      onSelect: function(item) {
        if (item.value === 'reset') {
          Lampa.Storage.set('uatut_user_id', '');
          Lampa.Noty.show('Налаштування скинуті. Перезавантажте сторінку.');
        }
      }
    }).show();
  };

  // Обробник сторінок контенту
  UatutPlugin.prototype.setupContentHandler = function() {
    // Спостерігаємо за змінами активності
    var originalReplace = Lampa.Activity.replace;
    
    Lampa.Activity.replace = function(data) {
      originalReplace.call(this, data);
      
      // Якщо це сторінка контенту
      if (data && data.card) {
        setTimeout(function() {
          var plugin = new UatutPlugin();
          plugin.addBalancerButton();
        }, 1000);
      }
    };
  };

  // 📥 АВТОМАТИЧНА ІНІЦІАЛІЗАЦІЯ ПЛАГІНА
  
  // Чекаємо, доки Lampa повністю завантажиться
  var initInterval = setInterval(function() {
    if (window.Lampa && Lampa.Utils && Lampa.Storage) {
      clearInterval(initInterval);
      
      // Реєстрація плагіна
      if (!window.uatutPlugin) {
        window.uatutPlugin = new UatutPlugin().init();
        
        // Додаємо CSS стилі
        var style = document.createElement('style');
        style.textContent = `
          .uatut-balancer-btn:hover {
            background: rgba(255, 107, 0, 0.4) !important;
            transform: scale(1.05);
            transition: all 0.2s;
          }
          
          .uatut-balancer-btn div {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `;
        document.head.appendChild(style);
        
        console.log('[' + PluginConfig.name + '] Плагін успішно запущено');
      }
    }
  }, 500);

})();
