import Image from 'next/image';
import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

export default function OptionItemMenu(props) {
  const { option, index, onChangeOption, addon, readOnly = false } = props;
  const [isAdded, setIsAdded] = React.useState(option.selected);
  return (
    <>
      <div className="OptionItemMenu">
        <div className={`OptionItemMenuInfo ${readOnly && 'read-only'}`}>
          {!readOnly && (
            <Image
              src="/assets/images/icon-help.svg"
              width={12}
              height={12}
              alt=""
              data-tooltip-id={`optioItemMenuToolTip${index}`}
            />
          )}
          <div
            className="OptionItemMenuInfoText"
            onClick={() => {
              if (readOnly) return;
              onChangeOption(
                option,
                addon,
                isAdded === true ? 'remove' : 'add'
              );
              setIsAdded(!isAdded);
            }}
          >
            {option.text}
          </div>
        </div>
        {!readOnly && (
          <ReactTooltip
            id={`optioItemMenuToolTip${index}`}
            place="bottom"
            openOnClick={true}
            content={option.help}
            style={{
              backgroundColor: 'var(--theme-light-color-secondary)',
              color: 'var(--color-white)',
              fontWeight: '600',
              maxWidth: '200px',
            }}
          />
        )}
        {!readOnly && (
          <>
            <div
              className="OptionItemMenuRemove"
              style={{ display: isAdded ? 'flex' : 'none' }}
              onClick={() => {
                if (readOnly) return;
                setIsAdded(false);
                onChangeOption(option, addon, 'remove');
              }}
            >
              <Image
                src="/assets/images/icon-remove.svg"
                width={16}
                height={16}
                alt="Remove"
              />
            </div>
            <div
              className="OptionItemMenuAdd"
              style={{ display: !isAdded ? 'flex' : 'none' }}
              onClick={() => {
                if (readOnly) return;
                setIsAdded(true);
                onChangeOption(option, addon, 'add');
              }}
            >
              <Image
                src="/assets/images/icon-add.svg"
                width={16}
                height={16}
                className="IconAdd"
                alt="Add"
              />
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        .OptionItemMenu {
          justify-content: space-between;
          display: flex;
          gap: 20px;
        }
        .OptionItemMenuInfo {
          justify-content: flex-start;
          align-items: center;
          display: flex;
          gap: 4px;
          cursor: pointer;
          width: 150px;
        }
        .read-only {
          cursor: default;
        }
        .OptionItemMenuRemove,
        .OptionItemMenuAdd {
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 16px;
          height: 16px;
        }
        .img-2 {
          aspect-ratio: 1;
          object-fit: contain;
          object-position: center;
          width: 12px;
          overflow: hidden;
          max-width: 100%;
          margin: auto 0;
        }
        .OptionItemMenuInfoText {
          color: #153d68;
          letter-spacing: 0.15px;
          font: 400 12px/13px Roboto, -apple-system, Roboto, Helvetica,
            sans-serif;
          margin: 5px 0;
        }
      `}</style>
    </>
  );
}
