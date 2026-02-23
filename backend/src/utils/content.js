/**
 * Contains common constant here
 * 
 */
const exportData = {};

exportData.PROVIDER_TYPES = ['openai', 'groq'];
exportData.TRANSLATION_INPUT_TYPES = ['audio', 'text'];
exportData.REFRESH_TOKEN_PREFIX = 'refresh_token:';
exportData.REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
// Supported languages
exportData.SUPPORTED_LANGUAGES = {
    auto: 'Auto Detect',
    af: 'Afrikaans', sq: 'Albanian', ar: 'Arabic', hy: 'Armenian',
    az: 'Azerbaijani', eu: 'Basque', be: 'Belarusian', bn: 'Bengali',
    bs: 'Bosnian', bg: 'Bulgarian', ca: 'Catalan', zh: 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)', hr: 'Croatian', cs: 'Czech',
    da: 'Danish', nl: 'Dutch', en: 'English', eo: 'Esperanto',
    et: 'Estonian', fi: 'Finnish', fr: 'French', gl: 'Galician',
    ka: 'Georgian', de: 'German', el: 'Greek', gu: 'Gujarati',
    ht: 'Haitian Creole', he: 'Hebrew', hi: 'Hindi', hu: 'Hungarian',
    is: 'Icelandic', id: 'Indonesian', ga: 'Irish', it: 'Italian',
    ja: 'Japanese', kn: 'Kannada', kk: 'Kazakh', ko: 'Korean',
    lv: 'Latvian', lt: 'Lithuanian', mk: 'Macedonian', ms: 'Malay',
    ml: 'Malayalam', mt: 'Maltese', mr: 'Marathi', mn: 'Mongolian',
    ne: 'Nepali', no: 'Norwegian', fa: 'Persian', pl: 'Polish',
    pt: 'Portuguese', pa: 'Punjabi', ro: 'Romanian', ru: 'Russian',
    sr: 'Serbian', sk: 'Slovak', sl: 'Slovenian', es: 'Spanish',
    sw: 'Swahili', sv: 'Swedish', tl: 'Filipino', ta: 'Tamil',
    te: 'Telugu', th: 'Thai', tr: 'Turkish', uk: 'Ukrainian',
    ur: 'Urdu', uz: 'Uzbek', vi: 'Vietnamese', cy: 'Welsh',
};

module.exports = exportData;