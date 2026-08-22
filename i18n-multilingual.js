/* Global News multilingual layer.
 * Registry-based so additional languages can be added without changing app logic.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'globalNewsLanguage';
  const languages = [
    ['en', 'English'], ['hi', 'हिन्दी'], ['zh', '中文'], ['es', 'Español'],
    ['ar', 'العربية'], ['fr', 'Français'], ['bn', 'বাংলা'], ['pt', 'Português'],
    ['ru', 'Русский'], ['ur', 'اردو'], ['id', 'Bahasa Indonesia']
  ];

  const dictionary = {
    en: { home:'Home', search:'Search', language:'Language', latest:'Latest', loading:'Loading…' },
    hi: { home:'होम', search:'खोजें', language:'भाषा', latest:'नवीनतम', loading:'लोड हो रहा है…' },
    zh: { home:'首页', search:'搜索', language:'语言', latest:'最新', loading:'加载中…' },
    es: { home:'Inicio', search:'Buscar', language:'Idioma', latest:'Últimas', loading:'Cargando…' },
    ar: { home:'الرئيسية', search:'بحث', language:'اللغة', latest:'الأحدث', loading:'جارٍ التحميل…' },
    fr: { home:'Accueil', search:'Rechercher', language:'Langue', latest:'Dernières', loading:'Chargement…' },
    bn: { home:'হোম', search:'অনুসন্ধান', language:'ভাষা', latest:'সর্বশেষ', loading:'লোড হচ্ছে…' },
    pt: { home:'Início', search:'Pesquisar', language:'Idioma', latest:'Mais recentes', loading:'Carregando…' },
    ru: { home:'Главная', search:'Поиск', language:'Язык', latest:'Последние', loading:'Загрузка…' },
    ur: { home:'ہوم', search:'تلاش', language:'زبان', latest:'تازہ ترین', loading:'لوڈ ہو رہا ہے…' },
    id: { home:'Beranda', search:'Cari', language:'Bahasa', latest:'Terbaru', loading:'Memuat…' }
  };

  function normalize(code) { return dictionary[code] ? code : 'en'; }
  function getLanguage() { return normalize(localStorage.getItem(STORAGE_KEY) || 'en'); }
  function setLanguage(code) {
    code = normalize(code);
    localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
    document.documentElement.dir = (code === 'ar' || code === 'ur') ? 'rtl' : 'ltr';
    window.__GLOBAL_NEWS_LANGUAGE__ = code;
    window.__GLOBAL_NEWS_I18N__ = dictionary[code];
    document.dispatchEvent(new CustomEvent('globalNewsLanguageChange', { detail: { code: code, strings: dictionary[code] } }));
    return code;
  }

  function buildSelector() {
    const select = document.createElement('select');
    select.id = 'global-news-language-selector';
    select.setAttribute('aria-label', 'Language');
    languages.forEach(function (item) {
      const option = document.createElement('option'); option.value = item[0]; option.textContent = item[1]; select.appendChild(option);
    });
    select.value = getLanguage();
    select.addEventListener('change', function () { setLanguage(select.value); });
    return select;
  }

  window.GlobalNewsI18n = { languages: languages, dictionary: dictionary, getLanguage: getLanguage, setLanguage: setLanguage, buildSelector: buildSelector };
  setLanguage(getLanguage());
})();
