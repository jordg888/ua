(function () {
    'use strict';

    /**
     * ТРИ ОКРЕМИХ ПЛАГІНИ В ОДНОМУ ФАЙЛІ:
     * - Турецькі серіали та фільми
     * - Азійські дорами та донхуа
     * - Українські фільми та серіали
     * 
     * Кожен розділ має свою кнопку в меню
     * Версія: 1.2.1
     */

    // =========================================================================
    // 1. КОНФІГУРАЦІЯ ДЛЯ ТУРЕЦЬКОГО КОНТЕНТУ (стандартний розмір)
    // =========================================================================
    var TURKISH_CONFIG = {
        'turkish': {
            title: 'Турецькі серіали',
            icon: `<svg viewBox="0 0 100 100" width="100" height="100" fill="currentColor">
                <path d="M65 20 A35 35 0 1 1 30 75 A40 40 0 0 0 60 25 L65 20Z" fill="currentColor"/>
                <path d="M72 40 L77 52 L91 52 L80 62 L84 78 L72 68 L60 78 L64 62 L53 52 L67 52 L72 40Z" fill="currentColor"/>
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
    // 2. КОНФІГУРАЦІЯ ДЛЯ АЗІЙСЬКОГО КОНТЕНТУ (ДОРАМИ) - стандартний розмір
    // =========================================================================
    var ASIAN_CONFIG = {
        'asian': {
            title: 'Дорами та Азійське',
            icon: `<svg viewBox="0 0 100 100" width="100" height="100" fill="currentColor">
                <path d="M50 10 C28 10 10 28 10 50 C10 72 28 90 50 90 C72 90 90 72 90 50 C90 28 72 10 50 10 Z M45 75 C30 72 20 58 20 45 C20 32 32 20 45 20 L45 75 Z M55 20 C70 23 80 37 80 50 C80 63 68 75 55 75 L55 20 Z" fill="currentColor"/>
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
    // 3. КОНФІГУРАЦІЯ ДЛЯ УКРАЇНСЬКОГО КОНТЕНТУ (той самий красивий тризуб у рамочці)
    // =========================================================================
    var UKRAINIAN_CONFIG = {
        'ukrainian': {
            title: 'Українське кіно',
            icon: `<svg viewBox="0 0 200 240" width="100" height="120" fill="currentColor">
                <!-- Зовнішня рамочка (щит) -->
                <path d="M40 20 L160 20 L190 80 L160 200 L40 200 L10 80 L40 20Z" fill="none" stroke="currentColor" stroke-width="8"/>
                
                <!-- Сам тризуб (збільшений та зміщений в центр) -->
                <path d="M100 50 L85 140 L105 130 L110 90 L100 50Z" fill="currentColor" transform="translate(0, 10)"/>
                <path d="M140 60 L155 140 L135 130 L130 95 L140 60Z" fill="currentColor" transform="translate(-10, 10)"/>
                <path d="M60 60 L45 140 L65 130 L70 95 L60 60Z" fill="currentColor" transform="translate(10, 10)"/>
                <path d="M85 140 L115 140 L105 165 L95 165 L85 140Z" fill="currentColor" transform="translate(0, 10)"/>
                <rect x="92" y="115" width="16" height="20" fill="currentColor" transform="translate(0, 10)"/>
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
