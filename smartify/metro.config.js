const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

console.log('Resolving @/ to:', path.resolve(__dirname, 'src'));

module.exports = (async () => {
    const config = await getDefaultConfig(__dirname);
    return {
        ...config,
        transformer: {
            ...config.transformer,
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: true,
                },
            }),
        },
        resolver: {
            sourceExts: [...config.resolver.sourceExts, 'ts', 'tsx'],
            alias: {
                '@': './src',
            },
        },
    };
})();