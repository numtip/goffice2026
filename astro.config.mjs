import tailwind from '@astrojs/tailwind';

export default {
  ssr: false,
  integrations: [tailwind()],
};