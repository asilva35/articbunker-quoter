import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import ProductList from '@/components/dashboard/ProductList';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import ModalWindow from '@/components/dashboard/ModalWindow';
import { useRouter } from 'next/router';
import { Input, Pagination } from '@nextui-org/react';
import Image from 'next/image';
import styles from '@/styles/dashboard/orders/NewOrderScreen.module.css';

// Debounce function
function debounce(func, delay) {
  let timeoutId = setTimeout(func, delay);
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

async function getProducts(page = 1, pageSize = 5, search = '') {
  //SIMULATE SLOW CONNECTION
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/list?page=${page}&pageSize=${pageSize}&search=${search}`
  );
  return await res.json();
}

function NewOrderScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [draftOrder, setDraftOrder] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchProducts = async () => {
        setLoading(true);
        const productsBD = await getProducts(currentPage, pageSize, search);

        if (!productsBD) {
          setProducts([]);
          return;
        }

        const { records, totalPages } = productsBD.products;

        setTotalPages(totalPages);

        setProducts(
          records.map((product, index) => {
            return {
              ...product,
            };
          })
        );
        setLoading(false);
      };
      fetchProducts();
    }
  }, [currentPage, pageSize, search]);

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

  const debouncedOnChange = useCallback(
    debounce((e) => {
      if (!e) return;
      setSearch(e.target.value);
    }, 1000),
    []
  );

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
        <div className={`${styles.search}`}>
          <Input
            type="text"
            label="Search"
            variant="bordered"
            placeholder="Enter your search term..."
            className="max-w-xs"
            onChange={(e) => {
              e.persist(); // React pools events, so we need to persist the event
              debouncedOnChange(e);
            }}
            startContent={
              <Image
                src="/assets/images/icon-search.svg"
                width={20}
                height={20}
                alt=""
              />
            }
          />
        </div>
        <ProductList theme={theme} products={products} isLoading={loading} />
        <div className={`${styles.pagination}`}>
          <Pagination
            total={Number.parseInt(totalPages)}
            initialPage={currentPage}
            isDisabled={loading}
            onChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
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
