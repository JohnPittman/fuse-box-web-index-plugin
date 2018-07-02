import 'fuse-box/core/File';
import { Plugin } from 'fuse-box/core/WorkflowContext';
import { BundleProducer } from 'fuse-box/core/BundleProducer';
import { ensureAbsolutePath, joinFuseBoxPath } from 'fuse-box/Utils';
import * as path from 'path';

export interface HTMLOutputInfo {
    /**
     * Placement order of a tag in a bundle group.
     * Lower numbers are highest priority.
     */
    orderNum?: number;
    /**
     * HTML.
     * Ex. <link ...>
     */
    html: string;
}

export interface WebIndexPluginOptions {
    /**
     * The main filename. Default is `index.html`.
     */
    outFile?: string;
    /**
     * The relative url bundles are served from.
     * Default is `/`. Empty is set with `.`
     */
    publicPath?: string;
    /**
     * Templates are callback that return a ES6 template string.
     * Provide a path to your own template.
     */
    template?: ((state: any) => string) | string;
    /**
     * Basic templating key/value pairs for anything else to be injected into the document.
     */
    $?: {
        [key: string]: string;
    };
    /**
     * Bundle creation callbacks to create tag information from FuseBox bundles.
     * Leaving any of these as 'undefined' will generate a default tag and order.
     */
    $bundles?: {
        script?: (bundlePath: string, filename: string) => HTMLOutputInfo;
        css?: (bundlePath: string, filename: string) => HTMLOutputInfo;
    };
}

export class WebIndexPlugin implements Plugin {
    private opts: undefined | WebIndexPluginOptions;

    constructor(options?: WebIndexPluginOptions) {
        this.opts = options;
    }

    public producerEnd(producer: BundleProducer) {
        this.generate(producer);
        producer.sharedEvents.on('file-changed', () => {
            this.generate(producer);
        });
    }

    private generateDefaultTemplate(state: { css: string; script: string }) {
        return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <title>Untitled</title>
                ${state.css}
                ${state.script}
            </head>
            <body>
            </body>
        </html>
        `;
    }

    private async generate(producer: BundleProducer) {
        const opts = this.opts;
        const publicPath = opts && opts.publicPath ? opts.publicPath : '//';
        const outFile = opts && opts.outFile ? opts.outFile : 'index.html';
        const scriptBundleTransformer =
            opts && opts.$bundles && opts.$bundles.script ? opts.$bundles.script : null;
        const cssBundleTransformer =
            opts && opts.$bundles && opts.$bundles.css ? opts.$bundles.css : null;
        const miscEntries = opts && opts.$ ? opts.$ : null;

        // Create JavaScript tag entries.
        const scriptHTMLOutputInfos: HTMLOutputInfo[] = [];
        let scriptTags = '';

        const bundles = producer.sortBundles();

        bundles.forEach((bundle) => {
            // Exclude chunk files that will always be lazy loaded by import('./filename') syntax.
            if (bundle.webIndexed === true) {
                const output = bundle.context.output;

                if (output && output.lastPrimaryOutput) {
                    // Generate file path.
                    const bundlePath = joinFuseBoxPath(
                        output.folderFromBundleName || '',
                        output.lastPrimaryOutput.filename
                    );

                    // Get filename.
                    const filename = `${path.basename(bundlePath, '.js')}.js`;

                    // Generate $bundles.
                    if (scriptBundleTransformer !== null) {
                        const tagInfo = scriptBundleTransformer(
                            `${path.join(publicPath, bundlePath)}`,
                            filename
                        );

                        if (tagInfo) {
                            scriptHTMLOutputInfos.push(tagInfo);
                        }
                    } else {
                        scriptTags += `\n<script type="text/javascript" src=${path.join(
                            publicPath,
                            bundlePath
                        )} defer></script>`;
                    }
                }
            }
        });

        if (scriptBundleTransformer !== null) {
            scriptTags += this.createTagsFromHTMLOutputInfos(scriptHTMLOutputInfos);
        }

        // Create CSS tag entries.
        const cssHTMLOutputInfos: HTMLOutputInfo[] = [];
        let cssTags = '';

        if (producer.injectedCSSFiles.size > 0) {
            producer.injectedCSSFiles.forEach((bundlePath) => {
                // Get filename.
                const filename = `${path.basename(bundlePath, '.css')}.css`;

                // Generate $bundles.
                if (cssBundleTransformer !== null) {
                    const tagInfo = cssBundleTransformer(
                        `${path.join(publicPath, bundlePath)}`,
                        filename
                    );

                    if (tagInfo) {
                        cssHTMLOutputInfos.push(tagInfo);
                    }
                } else {
                    cssTags += `<link rel="stylesheet" href="${path.join(
                        publicPath,
                        bundlePath
                    )}">`;
                }
            });
        }

        if (cssBundleTransformer !== null) {
            cssTags += this.createTagsFromHTMLOutputInfos(cssHTMLOutputInfos);
        }

        // Create template state from bundles.
        const templateState = {
            script: scriptTags,
            css: cssTags
        };

        // Inject anything else via $ group.
        if (miscEntries !== null) {
            Object.assign(templateState, miscEntries);
        }

        // Acquire index.html template.
        let indexHTML;

        // Hydrate .html template.
        if (opts && opts.template) {
            const createIndex =
                typeof opts.template === 'string'
                    ? require(ensureAbsolutePath(opts.template)).default ||
                      require(ensureAbsolutePath(opts.template))
                    : opts.template;

            indexHTML = createIndex(templateState);
        } else {
            indexHTML = this.generateDefaultTemplate(templateState);
        }

        // Write .html file to disk.
        producer.fuse.context.output.writeToOutputFolder(outFile, indexHTML);
    }

    private createTagsFromHTMLOutputInfos(tagInfos: HTMLOutputInfo[]) {
        let $bundles = '';

        // Sort script bundles by declared order.
        tagInfos.sort((a: HTMLOutputInfo, b: HTMLOutputInfo) => {
            return (a.orderNum ? a.orderNum : 0) - (b.orderNum ? b.orderNum : 0);
        });

        let i = -1;
        while (++i < tagInfos.length) {
            $bundles += tagInfos[i].html;
        }

        return $bundles;
    }
}

export default (opts?: WebIndexPluginOptions) => {
    return new WebIndexPlugin(opts);
};
