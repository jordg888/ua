(function () {
    'use strict';

    /**
     * ТРИ ОКРЕМИХ ПЛАГІНИ В ОДНОМУ ФАЙЛІ:
     * - Турецькі серіали та фільми
     * - Азійські дорами та донхуа
     * - Українські фільми та серіали
     * 
     * Кожен розділ має свою кнопку в меню
     * Версія: 1.1.0
     */

    // =========================================================================
    // 1. КОНФІГУРАЦІЯ ДЛЯ ТУРЕЦЬКОГО КОНТЕНТУ (герб Туреччини)
    // Джерело: Wikipedia, герб, який використовує МЗС Туреччини [citation:10]
    // =========================================================================
    var TURKISH_CONFIG = {
        'turkish': {
            title: 'Турецькі серіали',
            icon: `<svg viewBox="0 0 178 229" width="40" height="40" fill="currentColor">
                <path d="M128.5 47.5c-4.5 2-8.5 6-11.5 10.5 10 8 16.5 20 16.5 33 0 24-19.5 43.5-43.5 43.5S46.5 115 46.5 91c0-13 6.5-25 16.5-33-3-4.5-7-8.5-11.5-10.5-8 7.5-13 18-13 29.5 0 25.5 20.5 46 46 46s46-20.5 46-46c0-11.5-5-22-13-29.5zM89 27c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10z"/>
                <circle cx="124" cy="57" r="7" fill="currentColor"/>
                <circle cx="136" cy="86" r="7" fill="currentColor"/>
                <circle cx="124" cy="115" r="7" fill="currentColor"/>
                <circle cx="54" cy="57" r="7" fill="currentColor"/>
                <circle cx="42" cy="86" r="7" fill="currentColor"/>
                <circle cx="54" cy="115" r="7" fill="currentColor"/>
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
    // 2. КОНФІГУРАЦІЯ ДЛЯ АЗІЙСЬКОГО КОНТЕНТУ (ДОРАМИ) - оригінал
    // =========================================================================
    var ASIAN_CONFIG = {
        'asian': {
            title: 'Дорами та Азійське',
            icon: `<svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
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
    // Джерело: Офіційний малий герб України, затверджений Постановою ВРУ [citation:4]
    // =========================================================================
    var UKRAINIAN_CONFIG = {
        'ukrainian': {
            title: 'Українське кіно',
            icon: `<svg viewBox="0 0 330 461" width="40" height="50" fill="currentColor">
                <path d="m164.5 26.5c-3 2-1 198 0 200.5 6 21.5 14.5 40.5 24 56-52 15.5-31.5 73-24 143.5 3.5-6 8.5-10.5 14-14 21.5-17 35-40.5 39.5-66h66.5v-290c-74 44-66 106.5-74 180.5 29.5-5 37.5 38-1.5 41.5-46-74.5-29.5-128.5-29.5-209.5 0-18.5-4.5-31-15-42.5zm100 71.5v148.5h-11c-3-11.5-10.5-20.5-21-25.5 4-42.5 5-94.5 32-123zm-11 168.5h11v60h-44.5c0-9.5-1.5-19.5-4-29 18-2 34-14.5 37.5-31zm-57 35.5c2 8 3 16.5 3 24.5h-25c0.5-13.5 9.5-22 22-24.5zm-22 44.5h23c-3.5 15.5-11.5 30.5-23 42.5z" fill="currentColor"/>
                <path d="m5 5h320v344.5c0 24-14.5 48.5-38 58.5l-122 52.5-122-52.5c-22-10-35.5-32.5-33-58.5z" fill="none" stroke="currentColor" stroke-width="5"/>
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
    // УНІВЕРСАЛЬНІ ФУНКЦІЇ (без змін)
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
        };
    }

    function addMenuButton(config, serviceId, componentName) {
        var menu = $('.menu .menu__list').eq(0);
        if (!menu.length) return;

        if (menu.find('.menu__item[data-sid="' + serviceId + '"]').length) return;

        var currentConfig = config[serviceId];
        var btn = $(`<li class="menu__item selector" data-action="${serviceId}_action" data-sid="${serviceId}">
            <div class="menu__ico">${currentConfig.icon}</div>
            <div class="menu__text">${currentConfig.title}</div>
        </li>`);

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
            $('body').append(`
                <style id="triple-plugin-css">
                    .turkish_main .card--wide,
                    .turkish_view .card--wide,
                    .asian_main .card--wide,
                    .asian_view .card--wide,
                    .ukrainian_main .card--wide,
                    .ukrainian_view .card--wide {
                        width: 18.3em !important;
                    }
                    .turkish_view .category-full,
                    .asian_view .category-full,
                    .ukrainian_view .category-full {
                        padding-top: 1em;
                    }
                </style>
            `);
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
