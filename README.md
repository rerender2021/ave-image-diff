<p align="center">
    <img width="200" src="./assets/compare.png">
</p>

<h1 align="center">Image Diff</h1>

English | [简体中文](./README_zh-cn.md)

# Introduction

This is the tutorial project of [Avernakis UI](https://qber-soft.github.io/Ave-Nodejs-Docs/).

Tiny, but production ready.

![view diff](./docs/images/view-diff.gif)

# Install

Use npm as nam! (Node App Manager)

```bash
> npm i -g ave-image-diff
```

Run:

```bash
> image-diff
```

# Features & Usage

-   high performance C++ implemented pixel diff & 4k image support

![cpp opt](./docs/images/cpp-opt.png)

Instead of using js implemented [pixelmatch](https://github.com/mapbox/pixelmatch), we use our C++ implementation, which is 10x faster. (`300ms ~ 500ms -> 20ms ~ 30ms`)

In this way, even tolerance can be adjusted in realtime for 4k image, which is impossible for [pixelmatch](https://github.com/mapbox/pixelmatch).

![4k](./docs/images/4k.gif)

-   blink, blink, blink!

![blink](./docs/images/blink.gif)

-   open images: drag to drop

![drag-to-drop-1](./docs/images/drag-to-drop-1.gif)

![drag-to-drop-2](./docs/images/drag-to-drop-2.gif)

> press `space` to lock and copy color

-   custom theme: geek style!

![theme](./docs/images/theme-geek.gif)

-   basic controls: checkbox, trackbar, combo box ...
-   custom component: reuse mini view, pixel view from [color picker](https://github.com/rerender2021/ave-color-picker)

## Dev

```bash
> npm install
> npm run dev
```

## Package

```bash
> npm run release
```

## License

[MIT](./LICENSE)
