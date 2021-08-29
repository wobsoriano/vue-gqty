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
  <p v-if="isLoading">Loading...</p>
  <div v-else>
    <p v-for="user in query.users" :key="user.id">
    Name: {{ user.name }}
    <br />
    Dogs:
    <br />
    <ul>
      <li v-for="dog in user.dogs" :key="dog.name">
        {{ dog.name }}
      </li> 
    </ul>
    </p>
  </div>
</template>

<script setup lang="ts">
import { client } from './gqty'
import { useQuery } from './useQuery'

const { query, isLoading } = useQuery(client, {
    prepare({ prepass, query }) {
        prepass(query.users, 'id', 'name', 'dogs.name')
    },
    onError(err) {},
    staleWhileRevalidate: true,
})
</script>
```

## License

MIT License © 2021 [Robert Soriano](https://github.com/wobsoriano)