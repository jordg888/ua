(function () {
    'use strict';

    /**
     * ТРИ ОКРЕМИХ ПЛАГІНИ В ОДНОМУ ФАЙЛІ:
     * - Турецькі серіали та фільми
     * - Азійські дорами та донхуа
     * - Українські фільми та серіали
     * 
     * Кожен розділ має свою кнопку в меню
     * Версія: 1.1.5
     */

    // =========================================================================
    // 1. КОНФІГУРАЦІЯ ДЛЯ ТУРЕЦЬКОГО КОНТЕНТУ (символ Туреччини)
    // =========================================================================
    var TURKISH_CONFIG = {
        'turkish': {
            title: 'Турецькі серіали',
            icon: `<svg viewBox="0 0 100 100" fill="currentColor">
                <!-- Півмісяць -->
                <path d="M65 25 A30 30 0 1 1 35 75 A35 35 0 0 0 60 30 L65 25Z" fill="currentColor"/>
                <!-- Зірка -->
                <path d="M72 42 L77 55 L91 55 L80 64 L84 78 L72 70 L60 78 L64 64 L53 55 L67 55 L72 42Z" fill="currentColor"/>
            </svg>`,
            categories: [
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
                    "title": "🇹🇷 Історичні та бойовики",
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
                }
            ]
        }
    };

    // =========================================================================
    // 2. КОНФІГУРАЦІЯ ДЛЯ АЗІЙСЬКОГО КОНТЕНТУ (ДОРАМИ)
    // =========================================================================
    var ASIAN_CONFIG = {
        'asian': {
            title: 'Дорами та Азійське',
            icon: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93V19.93zm2-13.86c3.94.49 7 3.85 7 7.93s-3.06 7.44-7 7.93V6.07z"/>
            </svg>`,
            categories: [
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
                }
            ]
        }
    };

    // =========================================================================
    // 3. КОНФІГУРАЦІЯ ДЛЯ УКРАЇНСЬКОГО КОНТЕНТУ (Малий герб України - Тризуб)
    // =========================================================================
    var UKRAINIAN_CONFIG = {
        'ukrainian': {
            title: 'Українське кіно',
            icon: `<svg viewBox="0 0 100 120" fill="currentColor">
                <!-- Лівий бічний зубець -->
                <path d="M35 40 L25 80 L38 70 L42 55 L35 40Z" fill="currentColor"/>
                <!-- Правий бічний зубець -->
                <path d="M65 40 L75 80 L62 70 L58 55 L65 40Z" fill="currentColor"/>
                <!-- Центральний зубець -->
                <path d="M50 25 L45 75 L55 75 L50 25Z" fill="currentColor"/>
                <!-- Нижня основа -->
                <path d="M30 85 L70 85 L65 100 L35 100 L30 85Z" fill="currentColor"/>
                <!-- Середня перемичка -->
                <rect x="45" y="70" width="10" height="12" fill="currentColor"/>
                <!-- Додаткові деталі для краси -->
                <circle cx="50" cy="45" r="4" fill="currentColor" fill-opacity="0.8"/>
            </svg>`,
            categories: [
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
                    "title": "🇺🇦 Найкращі українські фільми",
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
                    "title": "🇺🇦 Українська класика",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "uk",
                        "sort_by": "vote_average.desc",
                        "primary_release_date.lte": "2000-01-01",
                        "vote_count.gte": "10"
                    }
                }
            ]
        }
    };

    // =========================================================================
    // УНІВЕРСАЛЬНІ ФУНКЦІЇ
    // =========================================================================

    function createMainComponent(config, componentName) {
        return function(object) {
            var comp = new Lampa.InteractionMain(object);
            var currentConfig = config[object.service_id];

            comp.create = function () {
                var _this = this;
                this.activity.loader(true);
                var categories = currentConfig.categories;
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
                    params.push('language=' + Lampa.Storage.get('language', 'uk'));

                    if (cat.params) {
                        for (var key in cat.params) {
                            var val = cat.params[key];
                            if (val === '{current_date}') {
                                var d = new Date();
                                val = d.getFullYear() + '-' + 
                                      ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
                                      ('0' + d.getDate()).slice(-2);
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
                    component: componentName + '_view',
                    page: 1
                });
            };

            return comp;
        };
    }

    function createViewComponent(componentName) {
        return function(object) {
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
                            val = d.getFullYear() + '-' + 
                                  ('0' + (d.getMonth() + 1)).slice(-2) + '-' + 
                                  ('0' + d.getDate()).slice(-2);
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
        };
    }

    function addMenuButton(config, serviceId, componentName) {
        var menu = $('.menu .menu__list').eq(0);
        if (!menu.length) return;

        if (menu.find('.menu__item[data-sid="' + serviceId + '"]').length) return;

        var currentConfig = config[serviceId];
        var btn = $('<li class="menu__item selector" data-action="' + serviceId + '_action" data-sid="' + serviceId + '">' +
            '<div class="menu__ico">' + currentConfig.icon + '</div>' +
            '<div class="menu__text">' + currentConfig.title + '</div>' +
        '</li>');

        btn.on('hover:enter', function () {
            Lampa.Activity.push({
                title: currentConfig.title,
                component: componentName + '_main',
                service_id: serviceId,
                page: 1
            });
        });

        menu.append(btn);
    }

    function startPlugins() {
        if (window.plugin_triple_ready) return;
        window.plugin_triple_ready = true;

        Lampa.Component.add('turkish_main', createMainComponent(TURKISH_CONFIG, 'turkish'));
        Lampa.Component.add('turkish_view', createViewComponent('turkish'));

        Lampa.Component.add('asian_main', createMainComponent(ASIAN_CONFIG, 'asian'));
        Lampa.Component.add('asian_view', createViewComponent('asian'));

        Lampa.Component.add('ukrainian_main', createMainComponent(UKRAINIAN_CONFIG, 'ukrainian'));
        Lampa.Component.add('ukrainian_view', createViewComponent('ukrainian'));

        if (!$('#triple-plugin-css').length) {
            $('body').append(
                '<style id="triple-plugin-css">' +
                    '.turkish_main .card--wide, .turkish_view .card--wide, ' +
                    '.asian_main .card--wide, .asian_view .card--wide, ' +
                    '.ukrainian_main .card--wide, .ukrainian_view .card--wide { width: 18.3em !important; }' +
                    '.turkish_view .category-full, .asian_view .category-full, .ukrainian_view .category-full { padding-top: 1em; }' +
                '</style>'
            );
        }

        function addAllButtons() {
            addMenuButton(TURKISH_CONFIG, 'turkish', 'turkish');
            addMenuButton(ASIAN_CONFIG, 'asian', 'asian');
            addMenuButton(UKRAINIAN_CONFIG, 'ukrainian', 'ukrainian');
        }

        if (window.appready) {
            addAllButtons();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') addAllButtons();
            });
        }

        setInterval(function () {
            if (window.appready && $('.menu .menu__list').eq(0).length) {
                addAllButtons();
            }
        }, 4000);
    }

    if (!window.plugin_triple_ready) startPlugins();
})();
