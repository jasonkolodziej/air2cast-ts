import { setup, $fetch } from 'vite-test-utils'
//? ref: https://kazupon.github.io/vite-test-utils/guide/setup.html
await setup({
  server: true
})

test('create a todo', async () => {
  const form = new FormData()
  form.append('text', 'task1')
  // make a request to server from testing side using a helper API like fetch API
  const { todo } = await $fetch('/todos', {
    method: 'POST',
    body: form,
    headers: {
      accept: 'application/json'
    }
  })

  expect(todo).toHaveProperty('uid')
  expect(todo).toHaveProperty('created_at')
  expect(todo).toContain({ text: 'task1', done: false })
})