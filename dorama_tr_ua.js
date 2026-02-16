(function () {
    'use strict';

    /**
     * Об'єднаний плагін: Турецькі, Азійські та Українські серіали
     * Версія: 1.0.0 (об'єднання turkish.js + dorama.js + український контент)
     * Опис: Добірки популярних турецьких серіалів (dizi), азійських дорам (K-drama, C-drama, J-drama),
     *        китайських донхуа (donghua) та українських фільмів і серіалів.
     */

    // --- КОНФІГУРАЦІЯ: Всі категорії в одному об'єкті ---
    var COMBINED_CONFIG = {
        'turkish_asian_ukrainian': { // Унікальний ID сервісу
            title: 'Турецькі, Азійські, UA', // Назва в меню
            icon: `<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93V19.93zm2-13.86c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93V6.07z"/>
            </svg>`,
            categories: [
                // ========== 1. ТУРЕЦЬКІ СЕРІАЛИ ТА ФІЛЬМИ (з turkish.js) ==========
                {
                    "title": "🇹🇷 Популярні турецькі серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "30"
                    }
                },
                {
                    "title": "🇹🇷 Нові турецькі серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "first_air_date.desc",
                        "first_air_date.lte": "{current_date}",
                        "vote_count.gte": "5"
                    }
                },
                {
                    "title": "🇹🇷 Найкращі турецькі серіали (рейтинг)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "vote_average.desc",
                        "vote_average.gte": "7.5",
                        "vote_count.gte": "100"
                    }
                },
                {
                    "title": "🇹🇷 Романтичні турецькі серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "with_genres": "18,10749",
                        "sort_by": "popularity.desc"
                    }
                },
                {
                    "title": "🇹🇷 Історичні та бойовики (турецькі)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "with_genres": "37,10759",
                        "sort_by": "popularity.desc"
                    }
                },
                {
                    "title": "🇹🇷 Популярні турецькі фільми",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "30"
                    }
                },
                {
                    "title": "🇹🇷 Нові турецькі фільми",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "release_date.desc",
                        "release_date.lte": "{current_date}",
                        "vote_count.gte": "5"
                    }
                },

                // ========== 2. АЗІЙСЬКІ ДОРАМИ ТА ДОНХУА (з dorama.js) ==========
                {
                    "title": "🇰🇷🇨🇳🇯🇵 Популярні дорами зараз",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "ko|zh|ja",
                        "with_genres": "18",
                        "without_genres": "16",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "30"
                    }
                },
                {
                    "title": "🇰🇷 Нові корейські дорами",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "ko",
                        "with_genres": "18",
                        "without_genres": "16",
                        "sort_by": "first_air_date.desc",
                        "first_air_date.lte": "{current_date}",
                        "vote_count.gte": "3"
                    }
                },
                {
                    "title": "🏆 Найкращі дорами (високий рейтинг)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "ko|zh|ja",
                        "with_genres": "18",
                        "without_genres": "16",
                        "sort_by": "vote_average.desc",
                        "vote_average.gte": "7.8",
                        "vote_count.gte": "200"
                    }
                },
                {
                    "title": "🇨🇳 Китайські дорами (C-drama)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "zh",
                        "with_genres": "18",
                        "without_genres": "16",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "20"
                    }
                },
                {
                    "title": "🇯🇵 Японські дорами (J-drama)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "ja",
                        "with_genres": "18",
                        "without_genres": "16",
                        "sort_by": "popularity.desc"
                    }
                },
                {
                    "title": "📺 Китайські донхуа (нові)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "zh",
                        "with_genres": "16",
                        "sort_by": "first_air_date.desc",
                        "first_air_date.lte": "{current_date}",
                        "vote_count.gte": "5"
                    }
                },
                {
                    "title": "📺 Популярні китайські донхуа",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "zh",
                        "with_genres": "16",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "10"
                    }
                },

                // ========== 3. УКРАЇНСЬКИЙ КОНТЕНТ (НОВІ КАТЕГОРІЇ) ==========
                // Джерело: Фільми та серіали, зроблені в Україні або українською мовою
                {
                    "title": "🇺🇦 Популярні українські фільми",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "5"
                    }
                },
                {
                    "title": "🇺🇦 Нові українські фільми",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "release_date.desc",
                        "release_date.lte": "{current_date}",
                        "vote_count.gte": "1"
                    }
                },
                {
                    "title": "🇺🇦 Найкращі українські фільми (рейтинг)",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "vote_average.desc",
                        "vote_average.gte": "6.5",
                        "vote_count.gte": "20"
                    }
                },
                {
                    "title": "🇺🇦 Українські серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "3"
                    }
                },
                {
                    "title": "🇺🇦 Нові українські серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "first_air_date.desc",
                        "first_air_date.lte": "{current_date}",
                        "vote_count.gte": "1"
                    }
                },
                {
                    "title": "🇺🇦 Українське кіно (різні жанри)",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "5"
                    }
                },
                {
                    "title": "🇺🇦 Контент з українською звуковою доріжкою",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "uk|ru|en", // Може включати оригінали іншими мовами, але далі фільтруємо за аудіо
                        "with_audios": "uk",                  // Специфічний параметр Lampa для мови аудіо (якщо підтримується)
                        "sort_by": "popularity.desc"
                    }
                }
                // Примітка: Параметр "with_audios" може працювати не з усіма джерелами,
                // але він є стандартним для Lampa і допомагає знайти контент з українським перекладом.
            ]
        }
    };

    // --- КОМПОНЕНТИ (універсальні, з невеликими змінами) ---

    function CombinedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = COMBINED_CONFIG[object.service_id]; // Беремо конфіг за ID

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var status = new Lampa.Status(categories.length);

            status.onComplite = function () {
                var fulldata = [];
                Object.keys(status.data).sort(function (a, b) { return a - b; }).forEach(function (key) {
                    var data = status.data[key];
                    if (data && data.results && data.results.length) {
                        var cat = categories[parseInt(key)];
                        Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                        fulldata.push({
                            title: cat.title,
                            results: data.results,
                            url: cat.url,
                            params: cat.params,
                            service_id: object.service_id
                        });
                    }
                });

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            categories.forEach(function (cat, index) {
                var params = [];
                params.push('api_key=' + Lampa.TMDB.key());
                params.push('language=' + Lampa.Storage.get('language', 'uk')); // Мова інтерфейсу

                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }

                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));

                network.silent(url, function (json) {
                    status.append(index.toString(), json);
                }, function () {
                    status.error();
                });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'combined_view', // Вказуємо на наш view-компонент
                page: 1
            });
        };

        return comp;
    }

    function CombinedView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + Lampa.TMDB.key());
            params.push('language=' + Lampa.Storage.get('language', 'uk'));
            params.push('page=' + page);

            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key + '=' + val);
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // --- ЗАПУСК ТА ДОДАВАННЯ В МЕНЮ ---

    function startPlugin() {
        // Використовуємо унікальний флаг для цього об'єднаного плагіна
        if (window.plugin_combined_tau_ready) return;
        window.plugin_combined_tau_ready = true;

        // Реєструємо компоненти з унікальними назвами
        Lampa.Component.add('combined_main', CombinedMain);
        Lampa.Component.add('combined_view', CombinedView);

        // Додаємо CSS (комбінуємо стилі з обох плагінів)
        if (!$('#combined-tau-css').length) {
            $('body').append(`
                <style id="combined-tau-css">
                    .combined_main .card--wide { width: 18.3em !important; }
                    .combined_view .card--wide  { width: 18.3em !important; }
                    .combined_view .category-full { padding-top: 1em; }
                </style>
            `);
        }

        function addMenuButton() {
            var menu = $('.menu .menu__list').eq(0);
            if (!menu.length) return;

            // Перевіряємо, чи кнопка вже існує (за новим data-sid)
            if (menu.find('.menu__item[data-sid="turkish_asian_ukrainian"]').length) return;

            var config = COMBINED_CONFIG['turkish_asian_ukrainian'];
            var btn = $(`<li class="menu__item selector" data-action="combined_tau_action" data-sid="turkish_asian_ukrainian">
                <div class="menu__ico">${config.icon}</div>
                <div class="menu__text">${config.title}</div>
            </li>`);

            btn.on('hover:enter', function () {
                Lampa.Activity.push({
                    title: config.title,
                    component: 'combined_main', // Викликаємо головний компонент
                    service_id: 'turkish_asian_ukrainian', // Передаємо ID сервісу
                    page: 1
                });
            });

            menu.append(btn);
        }

        // Додаємо кнопку при готовності застосунку
        if (window.appready) {
            addMenuButton();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') addMenuButton();
            });
        }

        // Резервна перевірка кожні 4 секунди
        setInterval(function () {
            if (window.appready && $('.menu .menu__list').eq(0).length) {
                addMenuButton();
            }
        }, 4000);
    }

    if (!window.plugin_combined_tau_ready) startPlugin();
})();
