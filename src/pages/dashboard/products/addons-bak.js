import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import TableComponent from '@/components/dashboard/TableComponent';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import { Chip } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { formatDate, capitalizeFirstLetter } from '@/utils/utils';
import Image from 'next/image';
import ModalComponent from '@/components/dashboard/ModalComponent';
import addonModel from '@/models/addonModel';
import { toast } from 'react-toastify';
import DetailAddon from '@/components/dashboard/products/addons/DetailAddon';
import { shortUUID } from '@/utils/utils';

async function getAddons(page = 1, pageSize = 5) {
  //SIMULATE SLOW CONNECTION
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/list?page=${page}&pageSize=${pageSize}`
  );
  return await res.json();
}

async function getProducts(page = 1, pageSize = 5, status = 'all') {
  //SIMULATE SLOW CONNECTION
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/list?page=${page}&pageSize=${pageSize}&status=${status}`
  );
  return await res.json();
}

function ListProducts() {
  const [products, setProducts] = React.useState([]);
  const [addons, setAddons] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [refreshTable, setRefreshTable] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { status } = router.query;
  const [showModalRecord, setShowModalRecord] = React.useState(0);
  const [recordModal, setRecordModal] = React.useState(addonModel);
  const [recordChange, setRecordChange] = React.useState(false);
  const [savingRecord, setSavingRecord] = React.useState(false);
  const [validation, setValidation] = React.useState({});

  const onRecordChange = (value) => {
    setRecordChange(value);
  };

  const onFieldChange = (field, value) => {
    const newRecord = { ...recordModal };
    newRecord[field.key] = value;
    if (field.key === 'productID') {
      const product = products.find((product) => product.value === value);
      newRecord['productName'] = product.label;
    }
    setRecordModal(newRecord);
    setRecordChange(true);
  };

  //FETCH ADDONS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchRecords = async () => {
        setLoading(true);
        const addonsBD = await getAddons(page, pageSize);

        if (!addonsBD.records) {
          setAddons([]);
          setTotalPages(1);
          setPage(1);
          setLoading(false);
          return;
        }
        const { totalPages, records } = addonsBD.records;
        setAddons(
          records.map((record, index) => {
            return {
              ...record,
              key: index,
              id: record.id,
              text: record.text,
              category: record.category,
              percent: record.percent,
              productID: record.productID,
            };
          })
        );
        setTotalPages(totalPages);
        setPage(page);
        setLoading(false);
      };
      fetchRecords(page, pageSize);
    }
  }, [page, pageSize, status, refreshTable]);

  //FETCH PRODUCTS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchRecords = async () => {
        const productsBD = await getProducts(1, 100, 'all');

        if (
          productsBD &&
          productsBD.products &&
          productsBD.products.records &&
          productsBD.products.records.length > 0
        ) {
          setProducts(
            productsBD.products.records.map((product, index) => {
              return {
                value: product.id,
                label: product.productName,
              };
            })
          );
        } else {
          setProducts([]);
        }
      };
      fetchRecords();
    }
  }, []);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const showProductDetail = (record) => {
    setRecordModal(record);
    setShowModalRecord((currCount) => currCount + 1);
  };

  const createRecord = () => {
    setRecordModal(addonModel);
    setShowModalRecord((currCount) => currCount + 1);
  };

  const saveRecord = async () => {
    if (savingRecord) return;
    setSavingRecord(true);
    const url = recordModal.id
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/update`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/products/addons/new`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ record: recordModal }),
    });
    if (response.ok) {
      toast.success('Registro Guardado con éxito');
      setShowModalRecord(0);
      setRefreshTable((currCount) => currCount + 1);
      setSavingRecord(false);
      setValidation({});
    } else {
      const { message, validation } = await response.json();
      if (validation) setValidation(validation);
      //toast.error(message);
      setSavingRecord(false);
    }
  };

  const renderCell = React.useCallback((record, columnKey) => {
    const cellValue = record[columnKey];
    switch (columnKey) {
      case 'expand':
        return (
          <div
            className="expand-cell"
            onClick={() => {
              showProductDetail(record);
            }}
          >
            <Image
              src="/assets/images/icon-expand.svg"
              width={12}
              height={12}
              alt=""
            />
          </div>
        );
      case 'status':
        const statusColorMap = {
          disponible: 'success',
          agotado: 'danger',
        };
        return (
          <>
            {cellValue ? (
              <Chip
                className="capitalize"
                color={statusColorMap[record.status]}
                size="sm"
                variant="flat"
              >
                {capitalizeFirstLetter(cellValue)}
              </Chip>
            ) : (
              <div></div>
            )}
          </>
        );

      case 'date':
        return <div>{formatDate(cellValue)}</div>;

      case 'id':
        return (
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f0',
              cursor: 'pointer',
            }}
            onClick={() => {
              showProductDetail(record);
            }}
          >
            {shortUUID(cellValue)}
          </div>
        );

      default:
        return cellValue;
    }
  }, []);
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
        <TableComponent
          data={{
            title: 'Listado de Adicionales',
            button: {
              label: 'Nuevo Adicional',
              callback: () => {
                createRecord();
              },
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Adicional ID' },
              { key: 'text', label: 'Descripción' },
              { key: 'productName', label: 'Producto' },
              { key: 'category', label: 'Categoria' },
            ],
            rows: addons,
            pagination: {
              total: totalPages,
              initialPage: page,
              isDisabled: loading,
              onChange: (page) => {
                setPage(page);
              },
            },
            renderCell,
          }}
        />
        <ModalComponent
          show={showModalRecord}
          onSave={saveRecord}
          title="Detalle del Adicional"
          onCloseModal={() => {
            onRecordChange(false);
          }}
          allowSave={recordChange}
          savingRecord={savingRecord}
        >
          <DetailAddon
            onRecordChange={(value) => {
              onRecordChange(value);
            }}
            record={recordModal}
            onFieldChange={(key, value) => {
              onFieldChange(key, value);
            }}
            onChangeImage={(image) => {
              showChangeImage(image);
            }}
            validation={validation}
            schema={{
              title: 'Detalle del Adicional',
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
                },
              ],
            }}
          />
        </ModalComponent>
      </Layout>
    </>
  );
}

ListProducts.auth = { adminOnly: true };
export default ListProducts;
