import React from 'react';
import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';

import DetailProfile from '@/components/dashboard/profile/DetailProfile';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useContext, useEffect, useState } from 'react';

import userModel from '@/models/userModel';
import { toast } from 'react-toastify';

async function getProfile() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/get`
  );
  return await res.json();
}

function DashBoardScreen() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const flag = React.useRef();

  const [loading, setLoading] = useState(false);

  const [record, setRecord] = React.useState(userModel);
  const [recordChange, setRecordChange] = React.useState(false);
  const [savingRecord, setSavingRecord] = React.useState(false);
  const [validation, setValidation] = React.useState({});

  const onRecordChange = (value) => {
    setRecordChange(value);
  };

  const onFieldChange = (key, value) => {
    const newRecord = { ...record };
    newRecord[key] = value;
    setRecord(newRecord);
    setRecordChange(true);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (flag.current) return;
      flag.current = true;
      const fetchProfile = async () => {
        setLoading(true);
        const profileBD = await getProfile();
        if (!profileBD) {
          return;
        }
        const record = profileBD.profile.records[0];
        if (!record) return;
        setRecord({ ...record, password: '', role: '' });
        setLoading(false);
      };
      fetchProfile();
    }
  }, []);

  const saveRecord = async () => {
    if (savingRecord) return;
    setSavingRecord(true);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile/update`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ record }),
    });

    if (response.ok) {
      toast.success('Registro Guardado con éxito');
      setSavingRecord(false);
      setRecordChange(false);
      setValidation({});
    } else {
      const { message, validation } = await response.json();
      if (validation) setValidation(validation);
      //toast.error(message);
      setSavingRecord(false);
      setRecordChange(false);
    }
    // .then((response) => {
    //   //IF RESPONSE STATUS IS NOT 200 THEN THROW ERROR
    //   if (response.status !== 200) {
    //     toast.error('No se pudo enviar la información');
    //     setSavingRecord(false);
    //     setRecordChange(false);
    //   }
    //   return response.json();
    // })
    // .then((data) => {
    //   toast.success('Registro Guardado con éxito');
    //   setShowModalRecordDetail(0);
    //   setRefreshTable((currCount) => currCount + 1);
    //   setSavingRecord(false);
    //   setRecordChange(false);
    // })
    // .catch((error) => {
    //   //console.error('Error:', error);
    //   toast.error('El registro no se pudo guardar');
    //   setSavingRecord(false);
    //   setRecordChange(false);
    // });
  };

  return (
    <>
      <Metaheader title="Perfil | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <DetailProfile
          onRecordChange={(value) => {
            onRecordChange(value);
          }}
          record={record}
          onFieldChange={(key, value) => {
            onFieldChange(key, value);
          }}
          isLoading={loading}
          onSave={saveRecord}
          allowSave={recordChange}
          savingRecord={savingRecord}
          validation={validation}
          schema={{
            title: 'Perfil',
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
                isRequerid: true,
              },
              {
                key: 'username',
                label: 'Usuario',
                type: 'text',
                isRequerid: true,
              },
              { key: 'email', label: 'Email', type: 'text', isRequerid: true },
              { key: 'password', label: 'Password', type: 'password' },
              {
                key: 'contact_name',
                label: 'Nombre de Contácto',
                type: 'text',
                isRequerid: true,
              },
              {
                key: 'contact_phone',
                label: 'Teléfono de Contácto',
                type: 'text',
                isRequerid: true,
              },
              {
                key: 'address',
                label: 'Dirección',
                type: 'text',
                isRequerid: true,
              },
              {
                key: 'invoice_to',
                label: 'Facturar a nombre de',
                type: 'text',
                isRequerid: true,
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

DashBoardScreen.auth = true;
export default DashBoardScreen;
