import { useQueries } from '@tanstack/react-query';

import { config, getBackendSrv } from '@grafana/runtime';

import { datasourceResourceEndpoint } from '@/api';
import { Tree } from '@/types';

export const useTableOfContents = () => {
  const docbookDatasources = Object.values(config.datasources).filter(
    (ds) => ds.type === 'grafana-docbooks-datasource'
  );

  return useQueries({
    combine: (results) => {
      const toc: { [k: string]: Tree } = {};
      results
        .map((r) => r.data)
        .filter((d) => d)
        .forEach((tree) => {
          if (tree) {
            toc[tree.datasource] = tree.tree;
          }
        });
      return toc;
    },
    queries: docbookDatasources.map((ds) => ({
      queryFn: async () => {
        return {
          datasource: ds.name,
          tree: await getBackendSrv().get<Tree>(datasourceResourceEndpoint(ds.uid) + '/table-of-contents'),
        };
      },
      queryKey: ['table-of-contents', ds.uid],
    })),
  });
};
