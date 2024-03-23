import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import { useRouter } from 'next/router';
import { formatDate, capitalizeFirstLetter } from '@/utils/utils';
import { Chip, Button, Spinner, Select, SelectItem } from '@nextui-org/react';
import Image from 'next/image';
import ModalComponent from '@/components/dashboard/ModalComponent';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

async function getOrder(order_id) {
  //SIMULATE SLOW CONNECTION
  //await new Promise((resolve) => setTimeout(resolve, 2000));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/get?order_id=${order_id}`
  );
  return await res.json();
}

function DetailOrderScreen() {
  const [order, setOrder] = React.useState(null);
  const [addons, setAddons] = React.useState([]);
  const mounted = React.useRef(false);
  const router = useRouter();
  const [showModalChangeStatus, setShowModalChangeStatus] = React.useState(0);
  const [statusOrderChange, setStatusOrderChange] = React.useState(false);
  const [savingOrder, setSavingOrder] = React.useState(false);

  const { data: session } = useSession();
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    if (typeof window !== 'undefined') {
      const fetchOrder = async (order_id) => {
        const orderBD = await getOrder(order_id);
        if (
          orderBD &&
          orderBD.order &&
          orderBD.order.records &&
          orderBD.order.records.length > 0
        ) {
          const _order = orderBD.order.records[0];
          const product = _order.product;
          const data_contact = _order.data_contact;
          const userid = _order.userid;

          //VERIFY IF ORDER HAVE A ADDON SELECTED
          if (addons.length === 0) {
            if (_order && _order.addons && _order.addons.length > 0) {
              _order.addons.forEach((addon) => {
                setAddons((prev) => [...prev, addon.text]);
              });
            }
          }
          setOrder({
            key: 1,
            id: _order.id,
            product: product ? product?.productName : '',
            productImage:
              product && product.productImage && product.productImage.src
                ? `${product?.productImage.src}?w=158&q=75`
                : '',
            date: _order.createdAt,
            status: _order.status,
            data_contact,
            userid,
          });
        }
      };
      const order_id = router.query['order-id'];
      fetchOrder(order_id);
    }
  }, []);

  const showRecordDetail = () => {
    setShowModalChangeStatus((currCount) => currCount + 1);
  };

  const saveOrder = () => {
    if (savingOrder) return;
    setSavingOrder(true);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/orders/update`;
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ record: order }),
    })
      .then((response) => {
        //IF RESPONSE STATUS IS NOT 200 THEN THROW ERROR
        if (response.status !== 200) {
          toast.error('No se pudo enviar la información');
          setSavingOrder(false);
        }
        return response.json();
      })
      .then((data) => {
        toast.success('Registro Guardado con éxito');
        setShowModalChangeStatus(0);
        setSavingOrder(false);
      })
      .catch((error) => {
        //console.error('Error:', error);
        toast.error('El Registro no se pudo guardar');
        setSavingOrder(false);
      });
  };

  const { theme, toggleTheme } = useContext(ThemeContext);

  const getColorStatus = (status) => {
    let color = 'default';
    switch (status) {
      case 'completada':
        color = 'success';
        break;
      case 'pendiente':
        color = 'danger';
        break;
      case 'procesada':
        color = 'warning';
        break;
    }
    return color;
  };

  return (
    <>
      <Metaheader title="Detalle de Cotización | Arctic Bunker" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Inicio' },
              { href: '/dashboard/orders', title: 'Cotizaciones' },
              { href: false, title: 'Cotización' },
            ],
          }}
        />
        {order ? (
          <div className="OrderDeail">
            <div className="div-2">
              <div className="column">
                <div className="div-3">
                  <div className="div-4">Detalle de la Cotización</div>
                  <div className="div-5">Fecha: {formatDate(order.date)}</div>
                  {order.productImage && (
                    <Image
                      src={order.productImage}
                      width={158}
                      height={158}
                      alt={order.product}
                    />
                  )}
                </div>
              </div>
              <div className="column-2">
                <div className="div-6">
                  <div className="div-7">
                    <Chip color={getColorStatus(order.status)}>
                      {capitalizeFirstLetter(order.status)}
                    </Chip>
                    {session.user.role === 'admin' && (
                      <Button
                        isIconOnly
                        color="default"
                        variant="light"
                        aria-label="Edit"
                        onClick={showRecordDetail}
                      >
                        <Image
                          src="/assets/images/icon_pencil.svg"
                          width={24}
                          height={24}
                          alt="Edit"
                        />
                      </Button>
                    )}
                  </div>
                  <div className="div-8">
                    <span>
                      <b>Nro Orden:</b> {order.id}
                    </span>
                  </div>
                  <div className="div-9">Nombre del Producto</div>
                  <div className="div-10">{order.product}</div>
                  <div className="divider" />
                  {order.data_contact && (
                    <>
                      <div className="clientTitle">Datos del Cliente</div>
                      <div className="clientData">
                        <p>
                          <span>Nombre: </span>
                          {order.data_contact.contact_name}
                        </p>
                        <p>
                          <span>Teléfono: </span>
                          {order.data_contact.contact_phone}
                        </p>
                        <p>
                          <span>Facturar a: </span>
                          {order.data_contact.invoice_to}
                        </p>
                        <p>
                          <span>Dirección de entrega: </span>
                          {order.data_contact.address}
                        </p>
                      </div>
                      <div className="divider" />
                    </>
                  )}
                  <div className="div-11">Adicionales</div>
                  {addons.length > 0 ? (
                    addons.map((addon, index) => {
                      return (
                        <div className="addonText" key={index}>
                          {addon}
                        </div>
                      );
                    })
                  ) : (
                    <div className="addonText">- No tiene adicionales -</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {' '}
            <Spinner />
          </div>
        )}
        <ModalComponent
          show={showModalChangeStatus}
          onSave={saveOrder}
          title="Cambiar Estatus de la Cotización"
          onCloseModal={() => {
            setStatusOrderChange(false);
          }}
          allowSave={statusOrderChange}
          size={'md'}
        >
          {order && (
            <>
              <Select
                items={[
                  { label: 'Pendiente', value: 'pendiente' },
                  { label: 'Procesada', value: 'procesada' },
                  { label: 'Completada', value: 'completada' },
                  { label: 'Cancelada', value: 'cancelada' },
                ]}
                placeholder={'Estatus de la Cotización'}
                className="max-w-xs"
                defaultSelectedKeys={[order.status]}
                onChange={(e) => {
                  const newOrder = { ...order };
                  newOrder.status = e.target.value;
                  setOrder(newOrder);
                  setStatusOrderChange(true);
                }}
              >
                {(item) => (
                  <SelectItem key={item.value}>{item.label}</SelectItem>
                )}
              </Select>
            </>
          )}
        </ModalComponent>
      </Layout>
      <style jsx>{`
        .OrderDeail {
          max-width: 535px;
          margin: 0 auto;
          padding: 50px 0px;
        }
        .div-2 {
          gap: 20px;
          display: flex;
        }
        @media (max-width: 991px) {
          .div-2 {
            flex-direction: column;
            align-items: stretch;
            gap: 0px;
          }
        }
        .column {
          display: flex;
          flex-direction: column;
          line-height: normal;
          width: 43%;
          margin-left: 0px;
        }
        @media (max-width: 991px) {
          .column {
            width: 100%;
          }
        }
        .div-3 {
          align-items: start;
          display: flex;
          flex-grow: 1;
          flex-direction: column;
          padding: 2px 20px;
        }
        @media (max-width: 991px) {
          .div-3 {
            margin-top: 40px;
          }
        }
        .div-4 {
          color: #000;
          letter-spacing: 0.15px;
          align-self: stretch;
          white-space: nowrap;
          font: 400 20px/120% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        @media (max-width: 991px) {
          .div-4 {
            white-space: initial;
          }
        }
        .div-5 {
          color: #000;
          letter-spacing: 0.15px;
          align-self: stretch;
          margin-top: 14px;
          font: 400 12px/200% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .img {
          aspect-ratio: 0.49;
          object-fit: contain;
          object-position: center;
          width: 157px;
          overflow: hidden;
          margin-top: 36px;
        }
        .column-2 {
          display: flex;
          flex-direction: column;
          line-height: normal;
          width: 57%;
          margin-left: 20px;
        }
        @media (max-width: 991px) {
          .column-2 {
            width: 100%;
          }
        }
        .div-6 {
          display: flex;
          flex-direction: column;
          padding: 1px 20px;
        }
        @media (max-width: 991px) {
          .div-6 {
            margin-top: 40px;
          }
        }

        .div-8 {
          color: #000;
          letter-spacing: 0.15px;
          margin-top: 25px;
          white-space: nowrap;
          font: 400 12px/24px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        @media (max-width: 991px) {
          .div-8 {
            white-space: initial;
          }
        }
        .div-9 {
          color: #153d68;
          margin-top: 27px;
          font: 400 22px/91% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .divider {
          margin-top: 10px;
          border-bottom: 1px solid #e0e0e0;
        }
        .clientTitle {
          color: #153d68;
          margin-top: 27px;
          font: 400 18px/91% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .clientData {
          display: flex;
          flex-direction: column;
          padding: 20px 0;
          gap: 10px;
          font: 400 14px/167% Roboto, -apple-system, Roboto, Helvetica;
        }
        .clientData span {
          font: 700 12px/167% Roboto, -apple-system, Roboto, Helvetica;
        }
        .div-10 {
          color: #153d68;
          margin-top: 19px;
          font: 400 18px/111% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div-11 {
          color: #153d68;
          margin-top: 42px;
          font: 400 12px/167% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        @media (max-width: 991px) {
          .div-11 {
            margin-top: 40px;
          }
        }
        .addonText {
          color: #222;
          letter-spacing: 0.15px;
          margin-top: 8px;
          font: 400 12px/108% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div-13 {
          color: #153d68;
          letter-spacing: 0.15px;
          margin-top: 14px;
          font: 400 12px/108% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div-14 {
          color: #153d68;
          letter-spacing: 0.15px;
          margin-top: 11px;
          font: 400 12px/108% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div-15 {
          color: #153d68;
          letter-spacing: 0.15px;
          margin-top: 14px;
          font: 400 12px/108% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div-16 {
          color: #153d68;
          letter-spacing: 0.15px;
          margin-top: 14px;
          font: 400 12px/108% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
      `}</style>
    </>
  );
}

DetailOrderScreen.auth = true;
export default DetailOrderScreen;
