import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://kiwi-research.github.io',
  base: '/grafana-react',
  integrations: [
    starlight({
      title: 'grafana-react',
      customCss: ['./src/styles/custom.css'],
      description: 'React DSL for Grafana dashboards',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/kiwi-research/grafana-react',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/kiwi-research/grafana-react/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Components',
          items: [
            {
              label: 'Structure',
              autogenerate: { directory: 'components/_generated/structure' },
            },
            {
              label: 'Query',
              autogenerate: { directory: 'components/_generated/query' },
            },
            {
              label: 'Panels',
              autogenerate: { directory: 'components/_generated/panels' },
            },
          ],
        },
        {
          label: 'API Reference',
          autogenerate: { directory: 'api' },
        },
      ],
    }),
  ],
});
