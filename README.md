# vue-gqty

Experimental composable for gqty

## Introduction

[gqty](https://github.com/gqty-dev/gqty) is a library for
GraphQL without writing queries.
It includes a HoC-based React binding library.

This library is a third-party composable-based Vue binding library.
It's a proof of concept at this moment and many features are not
yet implemented.

## Install

Vue 3:

```bash
yarn add vue-gqty gqty
```

Vue 2:

```bash
yarn add vue-gqty gqty @vue/composition-api
```

## Usage

```html
<template>
  <LiteYouTubeEmbed 
    id="dQw4w9WgXcQ"
    title="Rick Astley - Never Gonna Give You Up (Official Music Video)"
  />
</template>

<script>
import { defineComponent } from 'vue'
import LiteYouTubeEmbed from 'vue-lite-youtube-embed'
import 'vue-lite-youtube-embed/dist/style.css'

export default defineComponent({
    components: { LiteYouTubeEmbed }
})
</script>
```

## Credits

- [react-lite-youtube-embed](https://github.com/ibrahimcesar/react-lite-youtube-embed) - A private by default, faster and cleaner YouTube embed component for React applications.
- [vue-demi](https://github.com/vueuse/vue-demi/) - Creates Universal Library for Vue 2 & 3.
- [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed) - A faster youtube embed.

## License

MIT License © 2021 [Robert Soriano](https://github.com/wobsoriano)