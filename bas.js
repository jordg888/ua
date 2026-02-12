(function () {
    'use strict';

    /**
     * Турецькі серіали та фільми / Turkish Series & Movies
     * Версія: 1.0.0
     * Опис: Добірки популярних турецьких серіалів (dizi) та фільмів
     * Основа: плагін Dorama.js
     */

    var TURKISH_CONFIG = {
        'turkish': {
            title: 'Турецькі серіали',
            icon: `<svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>`,
            categories: [
                // ────────────────────────────────────────────────
                // ТУРЕЦЬКІ СЕРІАЛИ (DIZI) — мова: tr
                // ────────────────────────────────────────────────
                {
                    "title": "Популярні турецькі серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "30"
                    }
                },
                {
                    "title": "Нові турецькі серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "first_air_date.desc",
                        "first_air_date.lte": "{current_date}",
                        "vote_count.gte": "5"
                    }
                },
                {
                    "title": "Найкращі турецькі серіали (рейтинг)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "vote_average.desc",
                        "vote_average.gte": "7.5",
                        "vote_count.gte": "100"
                    }
                },
                {
                    "title": "Романтичні турецькі серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "with_genres": "18,10749",
                        "sort_by": "popularity.desc"
                    }
                },
                {
                    "title": "Драматичні серіали (Drama)",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "with_genres": "18",
                        "sort_by": "popularity.desc"
                    }
                },
                {
                    "title": "Історичні та бойовики",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "with_genres": "37,10759",
                        "sort_by": "popularity.desc"
                    }
                },
                {
                    "title": "Комедійні серіали",
                    "url": "discover/tv",
                    "params": {
                        "with_original_language": "tr",
                        "with_genres": "35",
                        "sort_by": "popularity.desc"
                    }
                },
                // ────────────────────────────────────────────────
                // ТУРЕЦЬКІ ФІЛЬМИ (кино)
                // ────────────────────────────────────────────────
                {
                    "title": "Популярні турецькі фільми",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "popularity.desc",
                        "vote_count.gte": "30"
                    }
                },
                {
                    "title": "Нові турецькі фільми",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "release_date.desc",
                        "release_date.lte": "{current_date}",
                        "vote_count.gte": "5"
                    }
                },
                {
                    "title": "Найкращі турецькі фільми (рейтинг)",
                    "url": "discover/movie",
                    "params": {
                        "with_original_language": "tr",
                        "sort_by": "vote_average.desc",
                        "vote_average.gte": "7.0",
                        "vote_count.gte": "50"
                    }
                }
            ]
        }
    };

    // ────────────────────────────────────────────────
    // КОМПОНЕНТИ (не змінюються, тільки назви класів)
    // ────────────────────────────────────────────────

    function TurkishMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = TURKISH_CONFIG[object.service_id];

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
                component: 'turkish_view',
                page: 1
            });
        };

        return comp;
    }

    function TurkishView(object) {
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

    // ────────────────────────────────────────────────
    // ЗАПУСК ТА ДОДАВАННЯ В МЕНЮ
    // ────────────────────────────────────────────────

    function startPlugin() {
        if (window.plugin_turkish_ready) return;
        window.plugin_turkish_ready = true;

        Lampa.Component.add('turkish_main', TurkishMain);
        Lampa.Component.add('turkish_view', TurkishView);

        if (!$('#turkish-css').length) {
            $('body').append(`
                <style id="turkish-css">
                    .turkish_main .card--wide { width: 18.3em !important; }
                    .turkish_view .card--wide  { width: 18.3em !important; }
                    .turkish_view .category-full { padding-top: 1em; }
                </style>
            `);
        }

        function addMenuButton() {
            var menu = $('.menu .menu__list').eq(0);
            if (!menu.length) return;

            if (menu.find('.menu__item[data-sid="turkish"]').length) return;

            var btn = $(`<li class="menu__item selector" data-action="turkish_action" data-sid="turkish">
                <div class="menu__ico">${TURKISH_CONFIG.turkish.icon}</div>
                <div class="menu__text">${TURKISH_CONFIG.turkish.title}</div>
            </li>`);

            btn.on('hover:enter', function () {
                Lampa.Activity.push({
                    title: TURKISH_CONFIG.turkish.title,
                    component: 'turkish_main',
                    service_id: 'turkish',
                    page: 1
                });
            });

            menu.append(btn);
        }

        if (window.appready) {
            addMenuButton();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type == 'ready') addMenuButton();
            });
        }

        setInterval(function () {
            if (window.appready && $('.menu .menu__list').eq(0).length) {
                addMenuButton();
            }
        }, 4000);
    }

    if (!window.plugin_turkish_ready) startPlugin();
})();
