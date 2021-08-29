import type {
  GQtyClient,
  GQtyError,
  Selection,
  EventHandler
} from 'gqty'

import { prepass } from 'gqty'

import {
  computed,
  getCurrentInstance,
  onUnmounted,
  ref,
  shallowRef, 
  triggerRef,
  Ref
} from 'vue-demi'

type OnErrorHandler = (error: GQtyError) => void

function hasEnabledStaleWhileRevalidate(
    staleWhileRevalidate: boolean | object | number | string | null
  ) {
    return typeof staleWhileRevalidate === 'boolean'
      ? staleWhileRevalidate
      : true
}

function useSubscribeCacheChanges({
  hookSelections,
  eventHandler,
  onChange,
}: {
  hookSelections: Ref<Set<Selection>>
  eventHandler: EventHandler
  onChange: () => void
}) {
  let onChangeCalled = false

  const unsubscribeFetch = eventHandler.onFetchSubscribe((fetchPromise, promiseSelections) => {
    if (onChangeCalled || !promiseSelections.some((selection) => hookSelections.value.has(selection))) {
      return
    }

    onChangeCalled = true
    fetchPromise.then(() => {
      Promise.resolve(fetchPromise).then(onChange)
    })
  })

const unsubscribeCache = eventHandler.onCacheChangeSubscribe(
  ({ selection }) => {
    if (!onChangeCalled && hookSelections.value.has(selection)) {
        onChangeCalled = true
        Promise.resolve().then(onChange)
    }
  }
)

  onUnmounted(() => {
      const instance = getCurrentInstance() 
      if (instance) {
          unsubscribeFetch()
          unsubscribeCache()
      }
  })
}

interface UseQueryPrepareHelpers<
  GeneratedSchema extends {
    query: object
  }
> {
  readonly prepass: typeof prepass
  readonly query: GeneratedSchema['query']
}

export function useQuery<GeneratedSchema extends {
  query: object
  mutation: object
  subscription: object
}>(client: GQtyClient<GeneratedSchema>, {
  onError,
  prepare,
  staleWhileRevalidate = false
}: {
  onError?: OnErrorHandler | undefined,
  prepare?: (helpers: UseQueryPrepareHelpers<GeneratedSchema>) => void
  staleWhileRevalidate?: boolean
}) {
  const fetchingPromise =  ref<Promise<void> | null>(null)
  const clientQuery: GeneratedSchema['query'] = client.query
  const query = shallowRef(clientQuery)
  const hookSelections = ref(new Set<Selection>())
  const enabledStaleWhileRevalidate = hasEnabledStaleWhileRevalidate(staleWhileRevalidate)
  const cacheRefetchSelections = enabledStaleWhileRevalidate ? new Set<Selection>() : null

  const { eventHandler, scheduler, interceptorManager } = client

  const prepareHelpers: UseQueryPrepareHelpers<GeneratedSchema> = {
    prepass,
    query: clientQuery,
  }

  const { createInterceptor, globalInterceptor, removeInterceptor } = interceptorManager
  const interceptor = createInterceptor()

  if (prepare) {
    try {
      prepare(prepareHelpers)
    } catch (err) {
      // if (err instanceof Error && Error.captureStackTrace!) {
      //     Error.captureStackTrace(err, useQuery);
      // }
      throw err
    }
  }

  interceptor.selectionCacheRefetchListeners.add((selection) => {
    if (cacheRefetchSelections) cacheRefetchSelections.add(selection)

    hookSelections.value.add(selection)
  })

  if (enabledStaleWhileRevalidate && cacheRefetchSelections?.size) {
    for (const selection of cacheRefetchSelections) {
      globalInterceptor.addSelectionCacheRefetch(selection)
    }
  }

  interceptor.selectionAddListeners.add((selection) => {
    hookSelections.value.add(selection)
  })

  interceptor.selectionCacheListeners.add((selection) => {
    hookSelections.value.add(selection)
  })

  const unsubscribeResolve = scheduler.subscribeResolve((promise, selection) => {
    if (fetchingPromise.value === null && hookSelections.value.has(selection)) {
      const newPromise = new Promise<void>((resolve) => {
        promise.then(({ error }) => {
          fetchingPromise.value = null
          if (error && onError) onError(error)

          Promise.resolve().then(() => triggerRef(query))
          resolve()
        })
      })
      fetchingPromise.value = newPromise
    }
  })

  useSubscribeCacheChanges({
    hookSelections,
    eventHandler,
    onChange() {
      if (!fetchingPromise.value) {
        triggerRef(query)
      }
    }
  })

  const isLoading = computed(() => fetchingPromise.value !== null)

  onUnmounted(() => {
    const instance = getCurrentInstance() 
    if (instance) {
      unsubscribeResolve()
      removeInterceptor(interceptor)
    }
  })

  return {
    query,
    isLoading
  }
}