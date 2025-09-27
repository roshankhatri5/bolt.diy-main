import { json } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

export const loader = async (_args: LoaderFunctionArgs) => {
  return json(
    {
      default_context: 'devtools://devtools/bundled/inspector.html',
      description: 'Placeholder manifest to satisfy Chrome DevTools discovery.',
      contexts: [],
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    },
  );
};
