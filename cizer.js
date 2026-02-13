// ============================================
// Мінімальний робочий плагін
// ============================================
(function() {
    if (window.mini_cizer) return;
    window.mini_cizer = true;

    console.log('Міні плагін запущено');

    // Просто додаємо кнопку в меню для тесту
    setTimeout(function() {
        if (document.querySelector('.header__menu')) {
            var btn = document.createElement('div');
            btn.innerHTML = '🎬 ТЕСТ ЦІЗЕРА';
            btn.style.cssText = 'position:fixed; top:100px; right:20px; background:red; color:white; padding:10px; z-index:9999; cursor:pointer;';
            btn.onclick = function() {
                alert('Плагін працює!');
                // Спробуємо знайти постер
                var poster = document.querySelector('[class*="poster"]');
                if (poster) {
                    poster.style.border = '5px solid red';
                    alert('Постер знайдено!');
                } else {
                    alert('Постер НЕ знайдено');
                }
            };
            document.body.appendChild(btn);
        }
    }, 5000);
})();
