# Description

Robust WebIndexPlugin for FuseBox. Due to so many different ways to implement tags, resource loading, and the ongoing evolution of how the browser parses HTML, the only way to satisfy such a dynamic file is to not limit it. This plugin let's you gain access to what FuseBox produces and override what gets injected as well as what the order of the bundle groups while keeping the rest of it simple options with templating.

# Goal

*   Allow access to bundle names produced by FuseBox.
*   Maintain templating for everything else.
*   No limitations on what you can inject.

# Getting Started

## Installation

#### npm

```
$ npm i @chickendinosaur/fuse-box-web-index-plugin
```

## Docs

*   [API](./docs/index.html)

## Examples

```
$ npm i
```

*   [Example 1](./examples/fuse.ts)

```
$ npm run build-example-1
```

## Usage

<b>MUST RUN AFTER QUANTUM FOR CSS FILES TO BE ACCESSED.</b>

### Options

```javascript
interface WebIndexPluginOptions {
    // The main filename. Default is `index.html`.
    outFilePath?: string;
    // The relative url bundles are served from. Default is `/`. Empty is set with `.`
    publicPath?: string;
    tags?: {
        // Template placeholder names. Bundle tags all start with a '$'.
        // Leaving any of these as 'undefined' will generate a default tag and order.
        $scriptBundles?: (bundlePath: string, filename: string) => TagInfo,
        $cssBundles?: (bundlePath: string, filename: string) => TagInfo,
        other?: {
            // Key value pairs. The keys can be anything you want although I prefer staying with a '$' for consitency.
            [key: string]: string
        }
    };
    // Provide a path to your own template.
    template?: ((state: any) => string) | string;
}

interface TagInfo {
    // Order in which the tag will appear relative to 0.
    // All tags without and order number are considered at position 0.
    orderNum?: number;
    // Full resource tag. Ex. <link type="text/stylesheet" href="/path" preload>
    tag: string;
}
```

# Development

## Installation

```
$ git clone https://github.com/chickendinosaur/fuse-box-web-index-plugin.git
$ cd fuse-box-web-index-plugin
$ npm i
```

## Build

```
$ npm run build
```

## Test

```
$ npm run test
```

# License

The MIT License (MIT)

Copyright (c) 2016 John Pittman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
