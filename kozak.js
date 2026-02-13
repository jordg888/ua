(function () {
    'use strict';

    // === Балансери (можеш потім додати сюди нові, зараз тут один BanderaOnline) ===
    const BALANCERS = [
        {
            name: 'KozakOnline',
            api_base: 'https://banderabackend.lme.isroot.in/api/v2',
            sourceKey: 'bandera'
        }
    ];

    // === Основна логіка (адаптовано під масив балансерів) ===
    function createLampaSource(api_base, sourceKey, name) {
        return function v2(component, _object) {
            var network = new Lampa.Reguest();
            var object = _object;
            var selected = null;
            var series = null;
            var episodes_cache = {};
            var filter_items = { season: [], voice: [] };
            var choice = { season: 0, voice: 0, voice_name: '' };
            var disabled_source_codes = {
                NO_RESULTS: true,
                NOT_FOUND: true,
                CONTENT_REMOVED: true,
                NO_PLAYER_DATA: true,
                NO_STREAM_DATA: true,
                NO_STREAMS: true,
                NO_STREAM: true,
                NO_MOVIE_STREAM: true,
                NO_MOVIE_STREAMS: true,
                NO_EPISODES: true,
                NO_VOICES: true,
                NO_SERIAL_STRUCTURE: true,
                NO_ANIME_INFO: true,
                NO_ANIME_STRUCTURE: true,
                VOICE_NOT_FOUND: true
            };

            this.searchByTitle = function (_object, title) {
                object = _object;
                search({ title: title });
            };
            this.searchByImdbID = function (_object, imdb_id) {
                object = _object;
                search({ imdb_id: imdb_id });
            };
            this.searchByKinopoisk = function (_object, kinopoisk_id) {
                object = _object;
                search({ kinopoisk_id: kinopoisk_id });
            };
            this.search = function (_object, data) {
                object = _object;
                if (!data || !data.length) return component.doesNotAnswer();
                var first = data[0] || {};
                if (first.ref) {
                    selected = first;
                    loadContent(first.ref);
                    return;
                }
                search({
                    title: first.title || first.name || object.movie.title || object.movie.name,
                    original_title: first.orig_title || first.original_title || first.nameEn || object.movie.original_title || object.movie.original_name,
                    imdb_id: first.imdb_id,
                    kinopoisk_id: first.kp_id || first.kinopoisk_id || first.filmId,
                    year: getYear(object.movie || {})
                });
            };
            this.extendChoice = function (saved) {
                Lampa.Arrays.extend(choice, saved, true);
            };
            this.reset = function () {
                component.reset();
                choice = { season: 0, voice: 0, voice_name: '' };
                filter();
                buildEpisodes();
            };
            this.filter = function (type, a, b) {
                choice[a.stype] = b.index;
                if (a.stype == 'voice' && filter_items.voice[b.index]) {
                    choice.voice_name = filter_items.voice[b.index];
                }
                component.reset();
                filter();
                buildEpisodes();
            };
            this.cancel = function () {
                network.clear();
            };
            this.destroy = function () {
                network.clear();
                selected = null;
                series = null;
                episodes_cache = {};
            };

            function apiBase() { return api_base; }
            function addParam(url, key, value) {
                if (!value) return url;
                return Lampa.Utils.addUrlComponent(url, key + '=' + encodeURIComponent(value));
            }
            function postJson(url, data, success, fail) {
                network.silent(url, success, fail, JSON.stringify(data), {
                    dataType: 'json',
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            function normalizeErrorCode(json) {
                return json && (json.error_code || json.meta && json.meta.code) || '';
            }
            function extractErrorText(json) {
                return json && (json.error || json.message || json.error_code) || '';
            }
            function handleSourceError(json) {
                var code = normalizeErrorCode(json);
                var text = extractErrorText(json) || code;
                if (code && disabled_source_codes[code]) {
                    component.disableSource(sourceKey, code);
                    component.empty();
                    return;
                }
                if (text) component.pushError(text);
                component.empty();
            }
            function handleStreamError(json) {
                var text = extractErrorText(json);
                if (text) component.pushError(text);
            }
            function getYear(movie) {
                var date = movie.release_date || movie.first_air_date || movie.year || movie.start_date;
                return date ? (date + '').slice(0, 4) : '';
            }
            function normalizeVoiceName(voice) {
                return voice.display_name || voice.displayName || voice.name || voice.id || '';
            }
            function getSeasonNumber(value, fallback) {
                var match = String(value || '').match(/(\d+)/);
                return match ? parseInt(match[1]) : fallback;
            }
            function normalizeEpisodeTitle(episode, number) {
                return episode.title || episode.name || Lampa.Lang.translate('torrent_serial_episode') + ' ' + number;
            }
            function buildSearchUrl(params) {
                var url = apiBase() + '/search';
                var movie = object.movie || {};
                url = addParam(url, 'source', sourceKey);
                url = addParam(url, 'title', params.title || movie.title || movie.name);
                url = addParam(url, 'original_title', params.original_title || movie.original_title || movie.original_name);
                url = addParam(url, 'imdb_id', params.imdb_id || movie.imdb_id);
                url = addParam(url, 'kinopoisk_id', params.kinopoisk_id || movie.kinopoisk_id);
                url = addParam(url, 'year', params.year || getYear(movie));
                if (movie.name) url = addParam(url, 'type', 'series'); else url = addParam(url, 'type', 'movie');
                return url;
            }
            function search(params) {
                var url = buildSearchUrl(params || {});
                network.silent(url, function (json) {
                    if (!json || !json.ok) {
                        handleSourceError(json);
                        return;
                    }
                    if (json.meta && json.meta.code == 'NO_RESULTS') {
                        component.disableSource(sourceKey, json.meta.code);
                        component.empty();
                        return;
                    }
                    var items = json.items || [];
                    if (!items.length) {
                        component.empty();
                        return;
                    }
                    if (items.length > 1 && !object.clarification) {
                        component.similars(items.map(function (item) {
                            return {
                                id: item.ref && (item.ref.id || item.ref.href || item.ref.url) || item.title,
                                title: item.title || item.name,
                                orig_title: item.title_en || item.original_title,
                                year: item.year,
                                imdb_id: item.imdb_id,
                                kinopoisk_id: item.kinopoisk_id,
                                ref: item.ref
                            };
                        }));
                        component.loading(false);
                        return;
                    }
                    selected = items[0];
                    loadContent(selected.ref);
                }, function () {
                    component.doesNotAnswer();
                });
            }
            function loadContent(ref) {
                var url = apiBase() + '/content';
                postJson(url, {
                    source: sourceKey,
                    ref: ref,
                    full: true
                }, function (json) {
                    if (!json || !json.ok) {
                        handleSourceError(json);
                        return;
                    }
                    if (json.type == 'series') {
                        series = normalizeSeries(json);
                        filter();
                        buildEpisodes();
                    } else {
                        drawMovie(json);
                    }
                }, function () {
                    component.doesNotAnswer();
                });
            }
            function normalizeSeries(json) {
                var voices = Array.isArray(json.voices) ? json.voices : [];
                voices = voices.map(function (voice, index) {
                    var seasons = Array.isArray(voice.seasons) ? voice.seasons : [];
                    return {
                        id: voice.id || voice.voice_id || index,
                        display_name: normalizeVoiceName(voice) || 'Voice ' + (index + 1),
                        seasons: seasons
                    };
                });
                return { voices: voices };
            }
            function filter() {
                filter_items = { season: [], voice: [] };
                if (series && series.voices && series.voices.length) {
                    filter_items.voice = series.voices.map(function (voice) {
                        return voice.display_name || voice.id;
                    });
                    var seasons = series.voices[0].seasons || [];
                    filter_items.season = seasons.map(function (season, index) {
                        var season_num = getSeasonNumber(season.title || season.season || season.number, index + 1);
                        return Lampa.Lang.translate('torrent_serial_season') + ' ' + season_num;
                    });
                }
                if (choice.season >= filter_items.season.length) choice.season = 0;
                if (choice.voice >= filter_items.voice.length) choice.voice = 0;
                if (filter_items.voice[choice.voice]) choice.voice_name = filter_items.voice[choice.voice];
                component.filter(filter_items, choice);
            }
            function buildEpisodes() {
                if (!series || !series.voices || !series.voices.length) {
                    component.loading(false);
                    return component.doesNotAnswer();
                }
                var voice = series.voices[choice.voice] || series.voices[0];
                var seasons = voice.seasons || [];
                if (!seasons.length) {
                    component.loading(false);
                    return component.doesNotAnswer();
                }
                var season_index = choice.season;
                if (season_index >= seasons.length) season_index = 0;
                var season = seasons[season_index];
                var season_num = getSeasonNumber(season.title || season.season || season.number, season_index + 1);
                var cache_key = voice.id + ':' + season_num;
                choice.voice_name = voice.display_name || voice.id;
                if (episodes_cache[cache_key]) {
                    renderEpisodes(episodes_cache[cache_key], season_num, voice);
                    return;
                }
                var episodes = Array.isArray(season.episodes) ? season.episodes : [];
                if (!episodes.length) {
                    component.loading(false);
                    return component.doesNotAnswer();
                }
                episodes_cache[cache_key] = episodes;
                renderEpisodes(episodes, season_num, voice);
            }
            function renderEpisodes(episodes, season, voice) {
                var items = episodes.map(function (episode, index) {
                    var number = episode.number || episode.episode || index + 1;
                    return {
                        title: normalizeEpisodeTitle(episode, number),
                        season: season,
                        episode: number,
                        ref: episode.ref,
                        info: voice.display_name || voice.id,
                        voice_name: voice.display_name || voice.id,
                        voice_id: voice.id
                    };
                });
                component.draw(items, {
                    onEnter: function onEnter(item) {
                        getStream(item.ref, function (streams) {
                            var prepared = prepareStreams(streams);
                            var first = prepared.first;
                            var qualitys = applyProxyToQualitys(prepared.qualitys);
                            var play_url = first ? normalizeStreamUrl(first.url) : '';
                            if (!first || !play_url) {
                                component.pushError(Lampa.Lang.translate('online_nolink'));
                                return;
                            }
                            Lampa.Player.play({
                                url: play_url,
                                timeline: item.timeline,
                                quality: qualitys,
                                title: item.title,
                                subtitles: first.subtitles
                            });
                            // playlist support
                            var playlist = [];
                            items.forEach(function (elem) {
                                var cell = {
                                    url: function url(call) {
                                        getStream(elem.ref, function (next_streams) {
                                            var prepared_next = prepareStreams(next_streams);
                                            var next_first = prepared_next.first;
                                            cell.url = next_first ? normalizeStreamUrl(next_first.url) : '';
                                            cell.quality = applyProxyToQualitys(prepared_next.qualitys);
                                            elem.mark();
                                            call();
                                        }, function () {
                                            cell.url = '';
                                            call();
                                        });
                                    },
                                    title: elem.title,
                                    timeline: elem.timeline,
                                    quality: {},
                                    subtitles: [],
                                    mark: elem.mark
                                };
                                playlist.push(cell);
                            });
                            Lampa.Player.playlist(playlist);
                        }, function (errorText) {
                            component.pushError(errorText || Lampa.Lang.translate('online_nolink'));
                        });
                    }
                });
                component.loading(false);
            }
            function drawMovie(json) {
                var item = {
                    title: object.movie.title || object.movie.name,
                    info: '',
                    voice_name: '',
                    file: '',
                    streams: json.streams || [],
                    stream_ref: json.stream_ref || null
                };
                component.draw([item], {
                    onEnter: function onEnter(movie) {
                        getMovieStream(movie, function (prepared) {
                            var first = prepared.first;
                            var qualitys = applyProxyToQualitys(prepared.qualitys);
                            var play_url = first ? normalizeStreamUrl(first.url) : '';
                            if (!first || !play_url) {
                                component.pushError(Lampa.Lang.translate('online_nolink'));
                                return;
                            }
                            Lampa.Player.play({
                                url: play_url,
                                timeline: movie.timeline,
                                quality: qualitys,
                                title: movie.title,
                                subtitles: first.subtitles
                            });
                        }, function (errorText) {
                            component.pushError(errorText || Lampa.Lang.translate('online_nolink'));
                        });
                    }
                });
                component.loading(false);
            }
            function prepareStreams(streams) {
                var qualitys = {};
                var first = null;
                if (Array.isArray(streams)) {
                    streams.forEach(function (stream, index) {
                        var label = stream.title || stream.quality || 'stream-' + (index + 1);
                        var url = normalizeStreamUrl(stream && stream.url);
                        if (url) qualitys[label] = url;
                        if (!first && url) first = Object.assign({}, stream, { url: url });
                    });
                }
                return { first: first, qualitys: qualitys };
            }
            function normalizeStreamUrl(url) {
                if (!url) return url;
                if (!shouldUseAshdiProxy(url)) return url;
                return wrapAshdiProxy(url);
            }
            function applyProxyToQualitys(qualitys) {
                var result = {};
                Object.keys(qualitys || {}).forEach(function (key) {
                    result[key] = normalizeStreamUrl(qualitys[key]);
                });
                return result;
            }
            function shouldUseAshdiProxy(url) {
                if (!Lampa.Storage.get('bandera_online_proxy_ashdi')) return false;
                var player = Lampa.Storage.get('player');
                if (player && player !== 'inner') return false;
                return isAshdiUrl(url);
            }
            function isAshdiUrl(url) {
                return /(^|\/\/)([^\/]*\.)?ashdi\.vip(\/|$)/i.test(url || '');
            }
            function wrapAshdiProxy(url) {
                var base = 'https://tut.im/proxy.php?url=';
                if (url.indexOf(base) === 0) return url;
                return base + encodeURIComponent(url);
            }
            function getStream(ref, success, fail) {
                var url = apiBase() + '/stream';
                if (!ref) {
                    if (fail) fail();
                    return;
                }
                postJson(url, {
                    source: sourceKey,
                    ref: ref
                }, function (json) {
                    if (!json || !json.ok || !Array.isArray(json.streams)) {
                        handleStreamError(json);
                        if (fail) fail(extractErrorText(json));
                        return;
                    }
                    success(json.streams);
    
