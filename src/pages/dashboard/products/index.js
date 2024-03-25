import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import productModel from '@/models/productModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';

function ListProducts() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/list?status=active`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/update`;
  const urlDeleteRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/delete?id={record_id}`;

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
      <Metaheader title="Listado de Productos | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Inicio' },
              { href: false, title: 'Productos' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          urlDeleteRecord={urlDeleteRecord}
          tablePageSize={5}
          model={productModel}
          tableComponentData={{
            title: 'Lista de Productos',
            button: {
              label: 'Nuevo producto',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Product ID' },
              { key: 'productName', label: 'Producto' },
              { key: 'date', label: 'Fecha' },
              { key: 'delete', label: '' },
            ],
            renderCell,
          }}
          showSearch={true}
          modalComponentData={{
            title: 'Detalle de Producto',
          }}
          schema={{
            fields: [
              {
                key: 'id',
                label: 'Product ID',
                type: 'hidden',
              },
              {
                key: 'productName',
                label: 'Nombre del Producto',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'description',
                label: 'Descripción',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'productImage',
                label: 'Imágen',
                type: 'image',
                preview: true,
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

ListProducts.auth = { adminOnly: true };
export default ListProducts;
