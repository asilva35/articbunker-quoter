import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import TableComponent from '@/components/dashboard/TableComponent';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import { Chip } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';
import Image from 'next/image';
import ModalComponent from '@/components/dashboard/ModalComponent';
import userModel from '@/models/userModel';
import { toast } from 'react-toastify';
import DetailUser from '@/components/dashboard/users/DetailUser';

async function getUsers(page = 1, pageSize = 5, status = 'all') {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/list?page=${page}&pageSize=${pageSize}`
  );
  return await res.json();
}

function ListUsers() {
  const [users, setUsers] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const [refreshTable, setRefreshTable] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const [showModalRecordDetail, setShowModalRecordDetail] = React.useState(0);

  const [recordModal, setRecordModal] = React.useState(userModel);
  const [recordChange, setRecordChange] = React.useState(false);
  const [savingRecord, setSavingRecord] = React.useState(false);

  const onRecordChange = (value) => {
    setRecordChange(value);
  };

  const onFieldChange = (key, value) => {
    const newRecord = { ...recordModal };
    newRecord[key] = value;
    setRecordModal(newRecord);
    setRecordChange(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchOrders = async () => {
        setLoading(true);
        const usersBD = await getUsers(page, pageSize);

        const { records } = usersBD.data;

        if (records && records.length > 0) {
          setUsers(
            records.map((user, index) => {
              return {
                ...user,
                key: index,
                date: user.createdAt,
              };
            })
          );
          setTotalPages(records.totalPages);
          setPage(records.page);
        } else {
          setUsers([]);
          setTotalPages(1);
          setPage(1);
        }
        setLoading(false);
      };
      fetchOrders(page, pageSize);
    }
  }, [page, pageSize, refreshTable]);

  const { theme, toggleTheme } = useContext(ThemeContext);

  const showRecordDetail = (record) => {
    setRecordModal(record);
    setShowModalRecordDetail((currCount) => currCount + 1);
  };

  const onNewRecord = () => {
    setRecordModal(userModel);
    setShowModalRecordDetail((currCount) => currCount + 1);
  };

  const saveRecord = () => {
    if (savingRecord) return;
    setSavingRecord(true);
    const url = recordModal.id
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/update`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/new`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ record: recordModal }),
    })
      .then((response) => {
        //IF RESPONSE STATUS IS NOT 200 THEN THROW ERROR
        if (response.status !== 200) {
          toast.error('No se pudo enviar la información');
          setSavingRecord(false);
        }
        return response.json();
      })
      .then((data) => {
        toast.success('Registro Guardado con éxito');
        setShowModalRecordDetail(0);
        setRefreshTable((currCount) => currCount + 1);
        setSavingRecord(false);
      })
      .catch((error) => {
        //console.error('Error:', error);
        toast.error('El registro no se pudo guardar');
        setSavingRecord(false);
      });
  };

  const renderCell = React.useCallback((record, columnKey) => {
    const cellValue = record[columnKey];
    switch (columnKey) {
      case 'expand':
        return (
          <div
            className="expand-cell"
            onClick={() => {
              showRecordDetail(record);
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
      case 'role':
        const statusColorMap = {
          admin: 'warning',
          regular: 'default',
        };
        return (
          <>
            {cellValue ? (
              <Chip
                className="capitalize"
                color={statusColorMap[record.role]}
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
              showRecordDetail(record);
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
      <Metaheader title="Listado de Usuarios | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Inicio' },
              { href: false, title: 'Usuarios' },
            ],
          }}
        />
        <TableComponent
          data={{
            title: 'Listado de Usuarios',
            button: {
              label: 'Nuevo Usuario',
              callback: () => {
                onNewRecord();
              },
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'User ID' },
              { key: 'name', label: 'Nombre' },
              { key: 'role', label: 'Rol' },
              { key: 'date', label: 'Fecha' },
            ],
            rows: users,
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
          show={showModalRecordDetail}
          onSave={saveRecord}
          title="Detalle del Usuario"
          onCloseModal={() => {
            onRecordChange(false);
          }}
          allowSave={recordChange}
        >
          <DetailUser
            onRecordChange={(value) => {
              onRecordChange(value);
            }}
            record={recordModal}
            onFieldChange={(key, value) => {
              onFieldChange(key, value);
            }}
            schema={{
              title: 'Detalle del Usuario',
              fields: [
                {
                  key: 'id',
                  label: 'Usuario ID',
                  type: 'hidden',
                },
                {
                  key: 'name',
                  label: 'Nombre',
                  type: 'text',
                },
                { key: 'username', label: 'Usuario', type: 'text' },
                { key: 'email', label: 'Email', type: 'text' },
                { key: 'password', label: 'Password', type: 'password' },
                {
                  key: 'role',
                  label: 'Rol',
                  type: 'select',
                  items: [
                    { value: 'regular', label: 'Regular' },
                    { value: 'admin', label: 'Administrador' },
                  ],
                },
              ],
            }}
          />
        </ModalComponent>
      </Layout>
    </>
  );
}

ListUsers.auth = { adminOnly: true };
export default ListUsers;
