module.exports = {
    multipass: true,
    plugins: [
        {
            name: 'preset-default',
            params: {
                overrides: {
                    // НЕ чіпаємо критичне
                    removeViewBox: false,
                    removeDimensions: false,
                    cleanupIDs: { remove: false },
                    removeUselessDefs: false,
                    removeUnknownsAndDefaults: false,
                    removeStyleElement: false
                }
            }
        },
        // Акуратні плюшки
        'convertPathData',
        'sortAttrs'
    ]
};
