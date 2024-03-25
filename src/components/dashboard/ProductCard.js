import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { shortText } from '@/utils/utils';

export default function MyComponent(props) {
  const { theme, product } = props;
  const image = `${product.productImage.src}?w=105&q=75`;
  return (
    <>
      <div className={`div ${theme}`}>
        {product.productImage.src && (
          <div className="cntImage">
            <Image
              src={`${image}`}
              width={105}
              height={105}
              alt={product.productName}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}
        <div className="div-2">
          <div className="div-3">{product.productName}</div>
          <div className="div-4">{shortText(product.description)}</div>
          <div className="div-5">
            <Link
              href={`/dashboard/orders/new/customize/${product.id}`}
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex',
                gap: '8px',
              }}
            >
              <Image
                src="/assets/images/icon-cart.svg"
                width={20}
                height={20}
                alt=""
              />
              <div className="div-6">COTIZAR</div>
            </Link>
          </div>
        </div>
      </div>
      <style jsx>{`
        .div {
          border-radius: 10px;
          border: 1px solid rgba(212, 212, 212, 0.6);
          background-color: #fff;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          width: 352px;
          margin: 0 auto;
          padding: 31px 17px;
        }
        .div.dark {
          background-color: transparent;
        }
        .cntImage {
          width: 105px;
          height: 213px;
        }
        .div-2 {
          align-self: center;
          display: flex;
          flex-grow: 1;
          flex-basis: 0%;
          flex-direction: column;
          margin: auto 0;
        }
        .div-3 {
          color: rgba(0, 0, 0, 0.87);
          font: 400 18px/178% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div.dark .div-3 {
          color: #fff;
        }
        .div-4 {
          color: rgba(0, 0, 0, 0.6);
          letter-spacing: 0.15px;
          margin-top: 26px;
          font: 400 12px/14px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div.dark .div-4 {
          color: #fff;
        }
        .div-5 {
          justify-content: space-between;
          align-items: center;
          border-radius: 10px;
          box-shadow: 0px 3px 1px 0px rgba(0, 0, 0, 0.2);
          background-color: #4f3cc9;
          display: flex;
          margin-top: 21px;
          gap: 8px;
          max-width: 150px;
          padding: 8px 22px;
        }
        .img-2 {
          aspect-ratio: 1;
          object-fit: contain;
          object-position: center;
          width: 20px;
          overflow: hidden;
          max-width: 100%;
          margin: auto 0;
        }
        .div-6 {
          color: #fff;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          font: 400 14px/25px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
      `}</style>
    </>
  );
}
