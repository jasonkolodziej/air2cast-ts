import { describe, it, expect, test, expectTypeOf } from 'vitest'
import { setup, $fetch, createPage } from 'vite-test-utils'
import { MDNSServiceDiscovery } from 'tinkerhub-mdns'
// import { discoverChromeCast } from '../src/lib/server/mdns.server';
import { chromecastServiceName, mdnsServiceOpt } from '../src/lib/server/chromecastHandler.server'
//? ref: https://kazupon.github.io/vite-test-utils/guide/setup.html
// https://www.sveltesociety.dev/recipes/testing-and-debugging/unit-testing-svelte-component
await setup({
  server: true
})


// test('create a todo', async () => {
//   const form = new FormData()
//   form.append('text', 'task1')
//   // make a request to server from testing side using a helper API like fetch API
//   const { todo } = await $fetch('/todos', {
//     method: 'POST',
//     body: form,
//     headers: {
//       accept: 'application/json'
//     }
//   })

//   expect(todo).toHaveProperty('uid')
//   expect(todo).toHaveProperty('created_at')
//   expect(todo).toContain({ text: 'task1', done: false })
// })

test('mdns', async () => {
  // make a request to server from testing side using a helper API like fetch API
  const todo = new MDNSServiceDiscovery(mdnsServiceOpt);

  expect(mdnsServiceOpt).toHaveProperty('protocol')
  expect(todo).toBeInstanceOf(MDNSServiceDiscovery)
  expect(todo.onAvailable).toBeDefined()
  // const aa = await todo.onAvailable()

  // expectTypeOf(aa)
  // .extract<unknown[]>() // extracts an array from a union
  // .toEqualTypeOf<CSSProperties[]>()

})

