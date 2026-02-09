import { SxProps } from '@mui/material';
import paths from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
  new?: boolean;
  hasNew?: boolean;
}

export interface MenuItem {
  id: string;
  key?: string; // used for the locale
  subheader: string;
  icon: string;
  iconSx?: SxProps;
  items: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'homepage',
    subheader: 'Homepage',
    key: 'homepage',
    icon: 'material-symbols:data-exploration-outline-rounded',
    items: [
      {
        name: 'E-commerce',
        key: 'e_commerce',
        path: paths.comingSoon,
        pathName: 'e-commerce',
        icon: 'material-symbols:shopping-cart-outline',
        active: true,
      },
    ],
  },
  {
    id: 'apps',
    subheader: 'Apps',
    key: 'apps',
    icon: 'material-symbols:widgets-outline-rounded',
    items: [
      {
        name: 'E-commerce',
        key: 'e_commerce',
        pathName: 'ecommerce',
        icon: 'material-symbols:storefront-outline-rounded',
        active: true,
        hasNew: true,
        items: [
          {
            name: 'Admin',
            key: 'admin',
            pathName: 'admin',
            active: true,
            hasNew: true,
            items: [
              {
                name: 'Product listing',
                key: 'product_listing',
                path: paths[404],
                pathName: 'product-listing',
                active: true,
              },
              {
                name: 'Product list',
                key: 'product_list',
                path: paths[404],
                pathName: 'product-list',
                active: true,
              },
            ],
          },
          {
            name: 'Customer',
            key: 'customer',
            pathName: 'customer',
            active: true,
            items: [
              {
                name: 'Homepage',
                key: 'homepage',
                path: paths[404],
                pathName: 'homepage',
                active: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'pages',
    subheader: 'Pages',
    key: 'pages',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      {
        name: 'Account',
        key: 'account',
        path: paths.account,
        pathName: 'account',
        active: true,
        icon: 'material-symbols:admin-panel-settings-outline-rounded',
      },
      {
        name: 'Error 404',
        key: 'error_404',
        pathName: 'error',
        active: true,
        icon: 'material-symbols:warning-outline-rounded',
        path: paths[404],
      },
    ],
  },
];

export default sitemap;
