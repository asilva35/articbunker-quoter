import Image from 'next/image';
import * as React from 'react';
import { Button } from '@nextui-org/react';

export default function MyComponent(props) {
  const [allowSubmit, setAllowSubmit] = React.useState(true);

  return (
    <>
      <div className="div">
        {/* <div
          className="div-4"
          onClick={() => props.onActionsEvent && props.onActionsEvent('next')}
        >
          <Image
            src="/assets/images/icon-check.svg"
            width={20}
            height={20}
            alt=""
          />
          <div className="div-5">Siguiente</div>
        </div> */}
        <Button
          color={!allowSubmit ? 'default' : 'success'}
          disabled={!allowSubmit}
          isLoading={props.isSubmitting}
          onPress={() => props.onActionsEvent && props.onActionsEvent('next')}
          className={`text-white`}
          startContent={
            <Image
              src="/assets/images/icon-check.svg"
              width={20}
              height={20}
              alt=""
            />
          }
        >
          Siguiente
        </Button>
      </div>
      <style jsx>{`
        .div {
          display: flex;
          gap: 18px;
          margin-left: auto;
          width: 100%;
          justify-content: flex-end;
          padding: 20px;
        }
        @media (max-width: 640px) {
          .div {
            justify-content: center;
          }
        }
        .div-2 {
          justify-content: space-between;
          align-items: center;
          border-radius: 10px;
          box-shadow: 0px 3px 1px 0px rgba(0, 0, 0, 0.2);
          background-color: rgba(64, 65, 65, 0.6);
          display: flex;
          gap: 8px;
          padding: 8px 14px;
          cursor: pointer;
        }
        .img {
          aspect-ratio: 1;
          object-fit: contain;
          object-position: center;
          width: 20px;
          overflow: hidden;
          max-width: 100%;
          margin: auto 0;
        }
        .div-3 {
          color: #fff;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          align-self: stretch;
          flex-grow: 1;
          white-space: nowrap;
          font: 400 14px/25px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .div-4 {
          justify-content: space-between;
          align-items: center;
          border-radius: 10px;
          box-shadow: 0px 3px 1px 0px rgba(0, 0, 0, 0.2);
          background-color: #82bb30;
          display: flex;
          gap: 8px;
          padding: 8px 14px;
          cursor: pointer;
        }
        .div-5 {
          color: #fff;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          align-self: stretch;
          flex-grow: 1;
          white-space: nowrap;
          font: 400 14px/25px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
      `}</style>
    </>
  );
}
