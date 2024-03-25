import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import { useRouter } from 'next/router';
import { CircularProgress } from '@nextui-org/react';

import styles from '@/styles/dashboard/users/DetailUserStatic.module.css';

async function getUser(userid) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/get?id=${userid}`
  );
  return await res.json();
}

function DetailUserStatic() {
  const [user, setUser] = React.useState(null);
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(true);

  const userid = router.query['id'];

  useEffect(() => {
    if (!userid) return;
    if (typeof window !== 'undefined') {
      const fetchRecord = async () => {
        setIsLoading(true);
        const userBD = await getUser(userid);

        const { records } = userBD.data;

        if (records && records.length > 0) {
          setUser(records[0]);
          console.log(records[0]);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      };
      fetchRecord(userid);
    }
  }, [userid]);

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <Metaheader title="Detalle de Usuarios | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Inicio' },
              { href: '/dashboard/users', title: 'Usuarios' },
              { href: false, title: 'Detalle de Usuario' },
            ],
          }}
        />
        <h3 className={`${styles.title}`}>Detalle del Usuario</h3>
        {isLoading ? (
          <div className={`${styles.loading}`}>
            <CircularProgress size="sm" aria-label="Loading..." />
          </div>
        ) : (
          <>
            <div className={`${styles.group}`}>
              <div className={`${styles.label}`}>ID:</div>
              <div className={`${styles.text}`}>{user.id}</div>
            </div>
            <div className={`${styles.group}`}>
              <div className={`${styles.label}`}>Nombre:</div>
              <div className={`${styles.text}`}>{user.name}</div>
            </div>
            <div className={`${styles.group}`}>
              <div className={`${styles.label}`}>Email:</div>
              <div className={`${styles.text}`}>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>
            </div>
            <div className={`${styles.group}`}>
              <div className={`${styles.label}`}>Teléfono:</div>
              <div className={`${styles.text}`}>
                <a href={`tel:${user.contact_phone}`}>{user.contact_phone}</a>
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
}

DetailUserStatic.auth = { adminOnly: true };
export default DetailUserStatic;
