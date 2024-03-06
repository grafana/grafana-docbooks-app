import React from 'react';

import { Button, Dropdown, Menu } from '@grafana/ui';

import { useTableOfContents } from '@/hooks/api';

const TableOfContentsMenu = () => {
  const toc = useTableOfContents();

  return (
    <Menu>
      {Object.entries(toc).map(([datasource, tree]) => (
        <Menu.Group key={`toc-group-${datasource}`} label={datasource}>
          {tree.tree
            .map((node) => {
              return node.type === 'blob' ? <Menu.Item key={node.path} label={node.path} /> : null;
            })
            .filter((node) => node)}
        </Menu.Group>
      ))}
    </Menu>
  );
};

export const RunbookPicker = () => {
  return (
    <Dropdown overlay={<TableOfContentsMenu />}>
      <Button variant={'secondary'} icon={'book'}>
        Runbooks
      </Button>
    </Dropdown>
  );
};
