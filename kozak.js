(function () {
    'use strict';

    if (typeof Lampa === 'undefined' || !Lampa.Source) return;

    /**
     * Повноцінна інтеграція онлайн-джерела!
     * Джерело «KozakOnline» з'явиться в виборі онлайн-кнопки,
     * пошук працює як BanderaOnline
     */

    Lampa.Source.add('KozakOnline', {
        // Відображення у меню
        icon: 'mdi-earth',            // іконка (можна змінити)
        type: 'online',               // важливо!
        name: 'KozakOnline',          // відображає назву

        /**
         * Основна функція пошуку онлайн-ресурсу.
         * Тут приклад для пошуку фільму по назві.
         */
        search: function (query, callback, error, options) {
            var api_base = 'https://banderabackend.lme.isroot.in/api/v2';
            var sourceKey = 'bandera';

            var url = api_base + '/search?source=' + sourceKey +
                '&title=' + encodeURIComponent(query);

            // Пошук через AJAX
            Lampa.Reguest().silent(url, function (json) {
                var items = json.items || [];

                if (!items.length) {
                    error(); // якщо нічого не знайдено, повертає помилку
                    return;
                }

                // Формуємо результати в форматі Lampa
                callback(items.map(function(item){
                    return {
                        title: item.title || item.name,
                        year: item.year,
                        ids: {
                            imdb: item.imdb_id,
                            kinopoisk: item.kinopoisk_id
                        },
                        ref: item.ref
                    };
                }));
            }, error);
        },

        /**
         * Функція, яка повертає стріми (відео) для перегляду.
         * Тут отримує посилання і якість.
         */
        item: function (item, callback, error, options) {
            var api_base = 'https://banderabackend.lme.isroot.in/api/v2';
            var sourceKey = 'bandera';

            // Отримати стрім/відео
            var url = api_base + '/stream';
            var data = {
                source: sourceKey,
                ref: item.ref
            };

            Lampa.Reguest().silent(url, function (json) {
                if (!json || !json.streams || !json.streams.length) {
                    error();
                    return;
                }

                // Формуємо вибір якості й стрім для плеєра
                var qualitys = {};
                json.streams.forEach(function(stream){
                    qualitys[stream.quality || stream.title || 'HD'] = stream.url;
                });

                callback([
                    {
                        file: json.streams[0].url,
                        quality: qualitys,
                        title: item.title,
                        subtitles: json.streams[0].subtitles || []
                    }
                ]);
            }, error, JSON.stringify(data), {
                dataType: 'json',
                headers: {'Content-Type': 'application/json'}
            });
        }
    });
})();
