import type {
  GQtyClient,
  GQtyError,
  Selection,
  EventHandler
} from 'gqty'

import {
  computed,
  getCurrentInstance,
  onUnmounted,
  ref,
  shallowRef, 
  triggerRef,
  Ref
} from 'vue-demi'

type OnErrorHandler = (error: GQtyError) => void;

function hasEnabledStaleWhileRevalidate(
    staleWhileRevalidate: boolean | object | number | string | null
  ) {
    return typeof staleWhileRevalidate === 'boolean'
      ? staleWhileRevalidate
      : true;
}

export function useSubscribeCacheChanges({
  hookSelections,
  eventHandler,
  onChange,
}: {
  hookSelections: Ref<Set<Selection>>;
  eventHandler: EventHandler;
  onChange: () => void;
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