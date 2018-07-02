import { FuseBox, QuantumPlugin, CSSPlugin } from 'fuse-box';
import { task, context } from 'fuse-box/sparky';

import WebIndexPlugin from '../src';

const isProduction = process.env.NODE_ENV === 'production';

context(() => {
    return {
        getConfig: () => {
            return FuseBox.init({
                homeDir: 'src',
                output: 'dist/$name.js',
                plugins: [
                    [CSSPlugin()],

                    isProduction &&
                        QuantumPlugin({
                            css: true,
                            extendServerImport: true
                        }),

                    // Generate index.html.
                    // Must run after QuantumPlugin to have access to .css filenames since
                    // they are inlined in development mode, therefore, no files.
                    WebIndexPlugin({
                        outFile: 'index.html',
                        template: 'src/templates/index.ts',
                        // Map html to a template key.
                        $: {
                            title: 'Custom Title'
                        },
                        $bundles: {
                            script: (bundlePath, filename) => {
                                const tag = `\n<script type="text/javascript" src=${bundlePath} defer></script>`;

                                switch (filename) {
                                    case 'vendor.js':
                                        return {
                                            html: tag
                                        };
                                    // app.js would normally be placed 2nd below vendor.
                                    case 'app.js':
                                        return {
                                            orderNum: -1,
                                            html: tag
                                        };
                                    default:
                                        // Returning '' will remove any script bundle not listed.
                                        return { html: tag };
                                }
                            },
                            css: (bundlePath, filename) => {
                                const tag = `\n<link type="text/stylesheet" href=${bundlePath} preload>`;

                                switch (filename) {
                                    case 'styles.css':
                                        return {
                                            html: tag
                                        };
                                    default:
                                        return { html: tag };
                                }
                            }
                        }
                    }),
                    WebIndexPlugin({
                        outFile: 'index-basic.html'
                    }),
                    WebIndexPlugin({
                        outFile: 'index-publicPath.html',
                        publicPath: 'http://www.google.com/'
                    })
                ],
                target: 'browser@es5'
            });
        },
        createBundle: (fuseConfig) => {
            fuseConfig.bundle('vendor').instructions('~ index.ts');
            fuseConfig.bundle('app').instructions('> [index.ts]');
            fuseConfig.bundle('custom').instructions('c.ts');
        }
    };
});

task('default', async (ctx) => {
    const fuseConfig = ctx.getConfig();
    ctx.createBundle(fuseConfig);
    await fuseConfig.run();
});
