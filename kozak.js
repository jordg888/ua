(function () {
    // Перевірка на існування Lampa
    if (typeof Lampa === 'undefined' || !Lampa.Source) {
        return;
    }

    // Додаємо BanderaOnline/KozakOnline як джерело
    Lampa.Source.add('KozakOnline', function(component, _object){
        var api_base = 'https://banderabackend.lme.isroot.in/api/v2';
        var sourceKey = 'bandera';

        // Основний код (сюди повністю вставити твою createV2-функцію, яку я для тебе вже адаптував).
        // Нижче – скорочений приклад, реальний код треба замінити на повний із попереднього файла!
        // Під час тесту напишу коротко:
        component.loading(true);

        var url = api_base + '/search?source=' + sourceKey + '&title=' + encodeURIComponent(_object.movie.title || _object.movie.name);

        Lampa.Reguest().silent(url, function (json) {
            var items = json.items || [];
            if (!items.length) {
                component.empty();
                component.pushError('Нічого не знайдено');
                return;
            }
            component.draw(items.map(item => ({
                title: item.title,
            })));
            component.loading(false);
        }, function () {
            component.empty();
            component.pushError('Помилка пошуку');
        });
    });
})();
