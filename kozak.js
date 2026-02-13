(function () {
    'use strict';

    // ======= ВАРІАНТ ІКОНИ (можна замінити на свою) =======
    var ICON_ONLINE = 'https://yarikrazor-star.github.io/lmp/balancer.svg'; // або інший svg/png

    // ======= ФУНКЦІЯ ДЛЯ ПІДКЛЮЧЕННЯ BANDERA =======
    var Bandera = createBanderaSource('my_bandera'); // sourceKey під себе!

    // ==================================
    // Додаємо кнопку "Онлайн" у картку фільму
    function addOnlineButton(data, html) {
        var container = $(html);
        if (container.find('.my-online-button').length) return; // вже є

        var button = $('<div class="full-start__button selector my-online-button">' +
            '<img src="' + ICON_ONLINE + '">' +
            '<span>Онлайн</span>' +
            '</div>');

        // Добавимо CSS для кнопки
        var style = 
        '.my-online-button { display: flex !important; align-items: center; justify-content: center; }' +
        '.my-online-button img { width: 1.6em; height: 1.6em; object-fit: contain; margin-right: 5px; }' +
        '.online-select-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 2100; display: flex; align-items: center; justify-content: center; }' +
        '.online-select-body { width: 50%; background: #1a1a1a; border-radius: 10px; padding: 25px; border: 1px solid #333; }' +
        '.online-item { padding: 15px; margin: 10px 0; background: rgba(255,255,255,0.05); border-radius: 5px; cursor: pointer; border: 2px solid transparent; display: flex; align-items: center; gap: 10px; }' +
        '.online-item.focus { border-color: #fff; background: rgba(255,255,255,0.1); outline: none; }' +
        '.online-item__icon { font-size: 1.5em; }' +
        '.online-item__title { font-size: 1.1em; color: #fff; }'
        ;
        if (!$('style#my-online-plugin-style').length) $('head').append('<style id="my-online-plugin-style">' + style + '</style>');

        var buttons_container = container.find('.full-start-new__buttons, .full-start__buttons');
        var neighbors = buttons_container.find('.selector');
        if (neighbors.length >= 2) {
            button.insertAfter(neighbors.eq(1));
        } else {
            buttons_container.append(button);
        }

        button.on('hover:enter click', function () {
            showOnlineBalancers(data.movie);
        });
    }

    // ==== МЕНЮ ДЛЯ ВИБОРУ БАЛАНСЕРА ====
    function showOnlineBalancers(movie) {
        var balancers = [
            {
                key: 'my_bandera',
                icon: '🇺🇦',
                name: 'Bandera Online',
                search: function(cb) { Bandera.searchByTitle({movie: movie}, movie.title || movie.name); }
            }
            // Сюди можна додати ще інші, якщо будеш розширювати
        ];

        var menu = $('<div class="online-select-container"><div class="online-select-body">' +
            '<div style="font-size: 1.4em; margin-bottom: 20px; color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px;">Обери онлайн-балансер</div>' +
            '<div class="online-items-list"></div></div></div>');

        balancers.forEach(function (item) {
            var el = $('<div class="online-item selector">' +
                '<div class="online-item__icon">' + item.icon + '</div>' +
                '<div class="online-item__title">' + item.name + '</div>' +
                '</div>');
            el.on('hover:enter click', function () {
                menu.remove();
                item.search();
            });
            menu.find('.online-items-list').append(el);
        });

        $('body').append(menu);

        var current_controller = window.Lampa.Controller.enabled().name;
        window.Lampa.Controller.add('my_online_menu', {
            toggle: function () {
                window.Lampa.Controller.collectionSet(menu);
                window.Lampa.Controller.collectionFocus(menu.find('.online-item')[0], menu);
            },
            up: function () {
                var index = menu.find('.online-item').index(menu.find('.online-item.focus'));
                if (index > 0) window.Lampa.Controller.collectionFocus(menu.find('.online-item')[index - 1], menu);
            },
            down: function () {
                var index = menu.find('.online-item').index(menu.find('.online-item.focus'));
                if (index < balancers.length - 1) window.Lampa.Controller.collectionFocus(menu.find('.online-item')[index + 1], menu);
            },
            back: function () {
                menu.remove();
                window.Lampa.Controller.toggle(current_controller);
            }
        });
        window.Lampa.Controller.toggle('my_online_menu');
    }

    // === Підключення до картки фільму ===
    function followFullCard() {
        window.Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    try {
                        addOnlineButton(e.data, e.object.activity.render());
                    } catch (err) {}
                }, 200);
            }
        });
    }

    // === Додаємо плагін Bandera, легка модифікація під свій ключ (sourceKey) ===
    // Це повна копія логіки Bandera, але реєструється як твій source.
    function createBanderaSource(sourceKey) {
        // === встав повний код Bandera createV2 з файла bandera.txt тут ===
        // В цій вставці на старті треба оголосити ключ:
        // function createV2(sourceKey) {... } --- весь код із bandera.txt

        // Кінець Bandera-коду
        // Додаємо реєстрацію джерела у Lampa:
        if (window.Lampa && window.Lampa.Player) {
            window.Lampa.Player.addSource(sourceKey, createV2(sourceKey));
        }
        // Повертаємо новенький source:
        return new (createV2(sourceKey))(sourceKey);
    }

    // === Запуск всього плагіна ===
    if (window.Lampa) {
        followFullCard();
    }

})();
