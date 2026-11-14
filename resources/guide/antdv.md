
Ant Design Vue
- Every component is registered globally as `a-...`; use them in templates without importing.
- Icons are imported by name from `@ant-design/icons-vue`. Feedback functions such as `message` and `Modal` are imported from `ant-design-vue`.
- `dayjs` is installed for date values. The component locale follows the app language.
- There is no layout yet: create `layouts/default.vue` for the menu and header; `pages/login.vue` opts out of layouts.
