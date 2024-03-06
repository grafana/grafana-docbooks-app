import React, { useContext } from 'react';

import { Button, Dropdown, Menu, MenuItemProps } from '@grafana/ui';

import { DocbooksDrawerContext } from '@/context/docbooks-drawer-context';
import { useTableOfContents } from '@/hooks/api';

// helper function to split the path and return filename
const getFileName = (path: string) => {
  const pathParts = path.split('/');
  return pathParts.pop();
};

// helper function to split the path and return directory
const getDirectory = (path: string) => {
  const pathParts = path.split('/');
  pathParts.pop(); // remove the filename
  return pathParts.join('/') || '__root__';
};

const TableOfContentsMenu = () => {
  const toc = useTableOfContents();
  const { setOpenFile } = useContext(DocbooksDrawerContext);

  return (
    <Menu>
      {Object.entries(toc).map(
        ([
          datasource,
          {
            datasourceUid,
            tree: { tree },
          },
        ]) => {
          const dirs = tree.reduce(
            (
              acc: {
                [k: string]: React.ReactElement<MenuItemProps<unknown>, string | React.JSXElementConstructor<any>>[];
              },
              node
            ) => {
              const dir = node.type === 'tree' ? node.path : getDirectory(node.path);
              if (!acc[dir]) {
                acc[dir] = [];
              }
              // Only add to the group if it's a markdown file
              if (node.type === 'blob' && getFileName(node.path)?.endsWith('.md')) {
                acc[dir].push(
                  <Menu.Item
                    label={getFileName(node.path)!}
                    onClick={() => {
                      setOpenFile({ datasourceUid, filePath: node.path });
                    }}
                  />
                );
              }
              return acc;
            },
            {}
          );
          // TODO: When rendering the directories, look for directories that would be under other directories and render them as submenus
          return (
            <Menu.Group key={`toc-group-${datasource}`} label={datasource}>
              {dirs['__root__'] && dirs['__root__'].length > 0 && dirs['__root__']}
              {Object.entries(dirs).map(([dir, items]) => {
                // root items are rendered separately
                if (dir === '__root__' || items.length === 0) {
                  return null;
                }
                return <Menu.Item key={`toc-group-${datasource}-${dir}`} label={dir} childItems={items} />;
              })}
            </Menu.Group>
          );
        }
      )}
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
