import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import ProductList from '@/components/dashboard/ProductList';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import ModalWindow from '@/components/dashboard/ModalWindow';
import { useRouter } from 'next/router';

async function getProducts(page = 1, pageSize = 5, status = 'all') {
  //SIMULATE SLOW CONNECTION
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/list?page=${page}&pageSize=${pageSize}&status=${status}`
  );
  return await res.json();
}

function NewOrderScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [draftOrder, setDraftOrder] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchProducts = async () => {
        setLoading(true);
        const productsBD = await getProducts(page, pageSize, 'all');

        if (!productsBD) {
          setProducts([]);
          setPage(1);
          return;
        }

        const { records } = productsBD.products;

        setProducts(
          records.map((product, index) => {
            return {
              ...product,
            };
          })
        );
        setLoading(false);
      };
      fetchProducts(page, pageSize);
    }
  }, [page, pageSize]);

  useEffect(() => {
    const draftOrder = localStorage.getItem('ArcticBunker_draft_order');
    if (draftOrder) {
      setDraftOrder(JSON.parse(draftOrder));
      setShowModal(true);
    }
  }, []);

  const handleModalEvent = (name_event) => {
    if (name_event === 'option01') {
      router.push(`/dashboard/orders/new/customize/${draftOrder.product.id}`);
    }
    if (name_event === 'option02') {
      localStorage.removeItem('ArcticBunker_draft_order');
      location.reload();
    }
  };

  return (
    <>
      <Metaheader title="Nueva Cotización | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme} sidebarCollapsed={true}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Inicio' },
              { href: '/dashboard/orders', title: 'Cotizaciones' },
              { href: false, title: 'Nueva Cotización' },
            ],
          }}
        />
        <ProductList theme={theme} products={products} isLoading={loading} />
        {showModal && (
          <ModalWindow
            options={{
              title: 'Ya tienes una cotización en borrrador',
              option01: {
                name_event: 'option01',
                text: '¿Quieres Continuar con la anterior?',
              },
              option02: {
                name_event: 'option02',
                text: '¿Quieres crear una nueva cotización?',
              },
              closeable: false,
            }}
            handleModalEvent={handleModalEvent}
          ></ModalWindow>
        )}
      </Layout>
    </>
  );
}

NewOrderScreen.auth = true;
export default NewOrderScreen;
