import i18n from 'i18n';

i18n.configure({
    locales: ['en-US', 'zh-CN', 'zh-TW'],
    directory: './locales',
    extension: '.json',
    objectNotation: 'dot',
    defaultLocale: 'en',
    updateFiles: false
});

export default i18n;