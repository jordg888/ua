(function () {
    'use strict';

    /**
     * ТРИ ОКРЕМИХ ПЛАГІНИ В ОДНОМУ ФАЙЛІ:
     * - Турецькі серіали та фільми
     * - Азійські дорами та донхуа
     * - Українські фільми та серіали
     * 
     * Кожен розділ має свою кнопку в меню
     * Версія: 1.1.3
     */

    // =========================================================================
    // 1. КОНФІГУРАЦІЯ ДЛЯ ТУРЕЦЬКОГО КОНТЕНТУ (збільшений та деталізований)
    // =========================================================================
    var TURKISH_CONFIG = {
        'turkish': {
            title: 'Турецькі серіали',
            icon: `<svg viewBox="0 0 300 300" width="60" height="60" fill="currentColor">
                <!-- Основа герба (щит) -->
                <path d="M70 50 L230 50 L280 150 L230 250 L70 250 L20 150 L70 50Z" fill="currentColor" opacity="0.2"/>
                
                <!-- Великий півмісяць -->
                <path d="M150 80 C90 80 90 180 150 180 C180 180 200 160 200 130 C200 100 180 80 150 80Z" fill="currentColor"/>
                
                <!-- Зірка -->
                <path d="M180 110 L190 130 L210 130 L195 145 L200 170 L180 155 L160 170 L165 145 L150 130 L170 130 L180 110Z" fill="currentColor"/>
                
                <!-- Декоративні елементи -->
                <circle cx="120" cy="120" r="8" fill="currentColor" opacity="0.8"/>
                <circle cx="200" cy="160" r="8" fill="currentColor" opacity="0.8"/>
                <circle cx="140" cy="200" r="8" fill="currentColor" opacity="0.8"/>
                
                <!-- Промені -->
                <path d="M220 130 L240 120 L250 140 L230 150 L220 130Z" fill="currentColor" opacity="0.6"/>
                <path d="M210 190 L230 200 L220 220 L200 210 L210 190Z" fill="currentColor" opacity="0.6"/>
                <path d="M90 190 L70 200 L80 220 L100 210 L90 190Z" fill="currentColor" opacity="0.6"/>
                <path d="M80 130 L60 120 L50 140 L70 150 L80 130Z" fill="currentColor" opacity="0.6"/>
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
    // 2. КОНФІГУРАЦІЯ ДЛЯ АЗІЙСЬКОГО КОНТЕНТУ (ДОРАМИ) - збільшений
    // =========================================================================
    var ASIAN_CONFIG = {
        'asian': {
            title: 'Дорами та Азійське',
            icon: `<svg viewBox="0 0 200 200" width="60" height="60" fill="currentColor">
                <!-- Щит -->
                <path d="M50 30 L150 30 L180 80 L150 170 L50 170 L20 80 L50 30Z" fill="currentColor" opacity="0.2"/>
                
                <!-- Головний символ -->
                <path d="M100 50 L130 80 L120 110 L140 130 L120 150 L100 130 L80 150 L60 130 L80 110 L70 80 L100 50Z" fill="currentColor"/>
                
                <!-- Декоративні елементи (азійські мотиви) -->
                <circle cx="70" cy="90" r="6" fill="currentColor" opacity="0.6"/>
                <circle cx="130" cy="90" r="6" fill="currentColor" opacity="0.6"/>
                <circle cx="100" cy="120" r="6" fill="currentColor" opacity="0.6"/>
                <path d="M90 140 L110 140 L105 150 L95 150 L90 140Z" fill="currentColor"/>
                
                <!-- Верхівка -->
                <path d="M95 40 L105 40 L110 50 L100 60 L90 50 L95 40Z" fill="currentColor"/>
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
    // 3. КОНФІГУРАЦІЯ ДЛЯ УКРАЇНСЬКОГО КОНТЕНТУ (збільшений та деталізований)
    // =========================================================================
    var UKRAINIAN_CONFIG = {
        'ukrainian': {
            title: 'Українське кіно',
            icon: `<svg viewBox="0 0 300 350" width="65" height="75" fill="currentColor">
                <!-- Щит -->
                <path d="M70 40 L230 40 L280 120 L230 280 L70 280 L20 120 L70 40Z" fill="currentColor" opacity="0.15"/>
                
                <!-- Основа тризуба -->
                <rect x="130" y="80" width="40" height="180" fill="currentColor" opacity="0.3"/>
                
                <!-- Лівий бічний зубець (деталізований) -->
                <path d="M70 120 L90 100 L100 120 L95 180 L85 200 L75 180 L70 120Z" fill="currentColor"/>
                <path d="M80 140 L90 130 L95 150 L85 160 L80 140Z" fill="currentColor" opacity="0.8"/>
                
                <!-- Правий бічний зубець (деталізований) -->
                <path d="M230 120 L210 100 L200 120 L205 180 L215 200 L225 180 L230 120Z" fill="currentColor"/>
                <path d="M220 140 L210 130 L205 150 L215 160 L220 140Z" fill="currentColor" opacity="0.8"/>
                
                <!-- Центральний зубець (деталізований) -->
                <path d="M150 60 L140 110 L160 110 L150 60Z" fill="currentColor"/>
                <path d="M140 110 L145 180 L155 180 L160 110 L140 110Z" fill="currentColor"/>
                <circle cx="150" cy="85" r="8" fill="currentColor" opacity="0.9"/>
                
                <!-- Нижня основа (деталізована) -->
                <path d="M100 220 L200 220 L190 260 L110 260 L100 220Z" fill="currentColor"/>
                <rect x="120" y="230" width="60" height="25" fill="currentColor" opacity="0.8"/>
                
                <!-- Декоративні елементи (хвилі) -->
                <path d="M110 270 L130 265 L150 272 L170 265 L190 270" stroke="currentColor" stroke-width="3" fill="none"/>
                
                <!-- Перемичка -->
                <rect x="130" y="190" width="40" height="20" fill="currentColor" rx="3"/>
                <circle cx="150" cy="200" r="6" fill="currentColor" opacity="0.7"/>
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

        Lampa.Component.add('turkish_main', createMainComponent(TURKISH_CONFIG, 'turkish
