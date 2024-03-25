import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import addonModel from '@/models/addonModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';

async function getProducts(page = 1, pageSize = 5, status = 'active') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/list?page=${page}&pageSize=${pageSize}&status=${status}`
  );
  return await res.json();
}

function ListAddons() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/list?status=active`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/update`;
  const urlDeleteRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/delete?id={record_id}`;

  const [products, setProducts] = React.useState([]);

  //FETCH PRODUCTS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchRecords = async () => {
        const productsBD = await getProducts(1, 100, 'active');
        if (
          productsBD &&
          productsBD.data &&
          productsBD.data.records &&
          productsBD.data.records.length > 0
        ) {
          const _products = [{ value: 'ALL_PRODUCTS', label: 'ALL PRODUCTS' }];
          productsBD.data.records.map((product, index) => {
            _products.push({
              value: product.id,
              label: product.productName,
            });
          });
          setProducts(_products);
        } else {
          setProducts([]);
        }
      };
      fetchRecords();
    }
  }, []);

  const renderCell = (record, columnKey, showRecordDetail, showModalDelete) => {
    const cellValue = record[columnKey];
    switch (columnKey) {
      case 'expand':
        return (
          <div
            className="expand-cell"
            onClick={() => {
              showRecordDetail(record);
            }}
            style={{ cursor: 'pointer', width: '12px' }}
          >
            <Image
              src="/assets/images/icon-expand.svg"
              width={12}
              height={12}
              alt=""
            />
          </div>
        );

      case 'date':
        return <div>{formatDate(cellValue)}</div>;

      case 'delete':
        return (
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f0',
              cursor: 'pointer',
              width: '24px',
            }}
            onClick={() => {
              showModalDelete(record);
            }}
          >
            <Image
              src="/assets/images/theme-light/icon-delete.svg"
              width={24}
              height={24}
              alt="Borrar"
            />
          </div>
        );

      case 'id':
        return (
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f0',
              cursor: 'pointer',
            }}
            onClick={() => {
              showRecordDetail(record);
            }}
          >
            {shortUUID(cellValue)}
          </div>
        );

      default:
        return cellValue;
    }
  };
  return (
    <>
      <Metaheader title="Listado de Adicionales | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Inicio' },
              { href: '/dasboard/products', title: 'Productos' },
              { href: false, title: 'Adicionales' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          urlDeleteRecord={urlDeleteRecord}
          tablePageSize={5}
          model={addonModel}
          tableComponentData={{
            title: 'Lista de Adicionales',
            button: {
              label: 'Nuevo adicional',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Adicional ID' },
              { key: 'text', label: 'Descripción' },
              { key: 'productName', label: 'Producto' },
              { key: 'category', label: 'Categoria' },
              { key: 'delete', label: '' },
            ],
            renderCell,
          }}
          showSearch={true}
          modalComponentData={{
            title: 'Detalle del Adicional',
          }}
          schema={{
            fields: [
              {
                key: 'id',
                label: 'ID',
                type: 'hidden',
              },
              {
                key: 'text',
                label: 'Nombre',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'help',
                label: 'Descripción',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'percent',
                label: '% Valor agregado',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'category',
                label: 'Categoria',
                type: 'select',
                isRequired: true,
                items: [
                  { value: 'Seguridad', label: 'Seguridad' },
                  { value: 'Energía', label: 'Energía' },
                  {
                    value: 'Protección Desastres',
                    label: 'Protección Desastres',
                  },
                  { value: 'Refrigeración', label: 'Refrigeración' },
                ],
              },
              {
                key: 'productID',
                label: 'Producto',
                type: 'autocomplete',
                isRequired: true,
                placeholder: 'Elija un Producto',
                items: products,
                onChange: (key, value, record) => {
                  const product = products.find(
                    (product) => product.value === value
                  );
                  record['productName'] = product.label;
                },
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

ListAddons.auth = { adminOnly: true };
export default ListAddons;
