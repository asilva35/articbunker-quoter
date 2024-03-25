import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import Actions from '@/components/dashboard/orders/new/Actions';
import Options from '@/components/dashboard/orders/new/Options';
import Preview from '@/components/dashboard/orders/new/Preview';
import { useContext, useEffect, useReducer, useState, useRef } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import styles from '@/styles/dashboard/orders/NewOrderScreen.module.css';

import orderReducer from '@/reducers/OrderReducer';
import { useRouter } from 'next/router';
import { CircularProgress } from '@nextui-org/react';

import orderModel from '@/models/orderModel';

async function getProduct(productid) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/get?productid=${productid}`;
  const res = await fetch(url);
  return await res.json();
}

async function getAddons(productid) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/addons/get_from_product?productid=${productid}`;
  const res = await fetch(url);
  return await res.json();
}

function CustomizeOrderScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const productid = router.query.productid;
  const [isLoading, setIsLoading] = useState(true);
  const [order, dispatch] = useReducer(orderReducer, orderModel);
  const orderFetch = useRef(false);

  useEffect(() => {
    if (orderFetch.current) return;
    orderFetch.current = true;
    if (productid) {
      const fetchProduct = async () => {
        setIsLoading(true);
        const productBD = await getProduct(productid);
        const { records } = productBD.record;
        if (!productBD || records.length === 0) {
          setIsLoading(false);
          return;
        }

        orderModel.product = records[0];

        const addonsBD = await getAddons(productid);

        const { records: recordsAddons } = addonsBD.data;

        if (addonsBD || recordsAddons.length > 0) {
          recordsAddons.map((addon) => {
            orderModel.categoriesAddons.map((category) => {
              if (category.name === addon.category) {
                const index = category.options.findIndex(
                  (option) => option.id === addon.id
                );
                if (index === -1) {
                  category.options.push({ ...addon, selected: false });
                }
              }
            });
          });
        }

        const currentOrder =
          JSON.parse(localStorage.getItem('ArcticBunker_draft_order')) ||
          orderModel;

        dispatch({ type: 'SET_ORDER', order: currentOrder });

        setIsLoading(false);
      };
      fetchProduct();
    }
  }, [productid]);

  const onActionsEvent = (event) => {
    if (event === 'next') {
      router.push('/dashboard/orders/new/last-step');
    }
  };

  const onChangeOption = (option, addon, action) => {
    dispatch({ type: 'CHANGE_OPTION', option, addon, action });
  };

  return (
    <>
      <Metaheader title="Personalizar Orden | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme} sidebarCollapsed={true}>
        <div className={`container ${styles.container}`}>
          <div className={`row ${styles.row01}`}>
            <div className={`col col-12`}>
              <BreadCrumbs
                theme={theme}
                data={{
                  links: [
                    { href: '/dashboard', title: 'Inicio' },
                    { href: '/dashboard/orders', title: 'Cotizaciones' },
                    {
                      href: '/dashboard/orders/new',
                      title: 'Nueva Cotización',
                    },
                    { href: false, title: 'Personalizar Producto' },
                  ],
                }}
              />
            </div>
          </div>
          {isLoading ? (
            <div className={`${styles.loading}`}>
              <CircularProgress size="sm" aria-label="Loading..." />
            </div>
          ) : order.product ? (
            <>
              <div className={`row ${styles.row01}`}>
                <div className={`col col-12`}>
                  <Actions onActionsEvent={onActionsEvent} />
                </div>
              </div>
              <div className={`row ${styles.row02}`}>
                <div
                  className={`col  col-12 col-xs-12 col-sm-6 col-md-4 col-lg-4 ${styles.colOptions}`}
                >
                  <Options
                    theme={theme}
                    onChangeOption={onChangeOption}
                    order={order}
                  />
                </div>
                <div
                  className={`col col-12 col-sm-6 col-md-8 col-lg-8 ${styles.colPreview}`}
                >
                  <Preview theme={theme} order={order} />
                </div>
              </div>
            </>
          ) : (
            <div className={`row ${styles.row03}`}>
              <div className={`col col-12`}>
                <p>Producto no encontrado</p>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

CustomizeOrderScreen.auth = true;
export default CustomizeOrderScreen;
