import Image from 'next/image';
import * as React from 'react';
import OptionItemMenu from './OptionItemMenu';

export default function MyComponent(props) {
  const { theme, order } = props;

  const product = order.product;
  //const image = `${product.productImage.src}?w=158&q=75`;
  const image =
    product && product.productImage && product.productImage.src
      ? `${product.productImage.src}?w=158&q=75`
      : '';

  return (
    <>
      <div className="OptionsCard">
        <div className="title">{product.productName}</div>
        <div className="subtitle">{product.productSubtitle}</div>
        {image && (
          <div className="productImage">
            <Image src={image} width={158} height={158} alt="" />
          </div>
        )}
        <div className="text">Adicionales:</div>
        {order.addons.map((addon, index) => (
          <div className="OptionItem" key={index}>
            <div className="OptionItemBody">
              <div className="OptionItemTitle">
                <div className="OptionItemTitleText">{addon.text}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .OptionsCard {
          align-items: flex-start;
          border-radius: 10px;
          border: 1px solid rgba(212, 212, 212, 0.6);
          background-color: #fff;
          display: flex;
          max-width: 240px;
          flex-direction: column;
          padding: 27px 17px;
        }
        .title {
          color: #153d68;
          align-self: stretch;
          font: 400 18px/111% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .subtitle {
          color: rgba(21, 61, 104, 0.79);
          align-self: stretch;
          margin-top: 5px;
          font: 400 12px/117% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .text {
          color: rgba(21, 61, 104, 0.79);
          align-self: stretch;
          margin-top: 5px;
          font: 400 14px/117% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
          margin-bottom: 15px;
        }
        .OptionItemTitle {
          align-items: center;
          align-self: stretch;
          display: flex;
          margin-top: 0px;
          justify-content: flex-start;
          gap: 12px;
        }

        .OptionItemTitleText {
          color: #222;
          letter-spacing: 0.15px;
          font: 400 15px/160% Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
        }
        .OptionItemBody {
          padding-left: 15px;
          align-self: stretch;
          display: flex;
          margin-top: 0px;
          flex-direction: column;
        }
        .productImage {
          width: 100%;
          height: 100%;
          margin-top: 10px;
        }
      `}</style>
    </>
  );
}
