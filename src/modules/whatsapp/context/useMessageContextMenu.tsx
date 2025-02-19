import React, { Dispatch, SetStateAction } from 'react';
import { WMessage } from '../interfaces';

interface ContextMenuOptions {
  setQuotedMessage: Dispatch<SetStateAction<WMessage | null>>;
}

export const useMessageContextMenu = ({ setQuotedMessage }: ContextMenuOptions) => {
  let currentContextMenu: HTMLDivElement | null = null;

  const handleContextMenu = (event: React.MouseEvent, message: WMessage) => {
    event.preventDefault();

    if (currentContextMenu) {
      document.body.removeChild(currentContextMenu);
      currentContextMenu = null;
    }

    // Create a new context menu
    const contextMenu = document.createElement('div');
    contextMenu.style.position = 'absolute';
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.backgroundColor = 'white';
    contextMenu.style.border = '1px solid #ccc';
    contextMenu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    contextMenu.style.zIndex = '1000';
    contextMenu.style.padding = '8px';
    contextMenu.style.borderRadius = '4px';

    // Add the "Reply" option
    const replyOption = document.createElement('div');
    replyOption.textContent = 'Responder';
    replyOption.style.cursor = 'pointer';
    replyOption.style.padding = '4px 8px';
    replyOption.style.borderRadius = '4px';
    replyOption.onclick = () => {
      setQuotedMessage(message);
      document.body.removeChild(contextMenu);
      currentContextMenu = null;
    };

    replyOption.onmouseenter = () => {
      replyOption.style.backgroundColor = '#f0f0f0';
    };
    replyOption.onmouseleave = () => {
      replyOption.style.backgroundColor = 'transparent';
    };

    contextMenu.appendChild(replyOption);

    document.body.appendChild(contextMenu);
    currentContextMenu = contextMenu;

    const onClickOutside = () => {
      if (currentContextMenu) {
        document.body.removeChild(currentContextMenu);
        currentContextMenu = null;
      }
      document.removeEventListener('click', onClickOutside);
    };

    document.addEventListener('click', onClickOutside);
  };

  return handleContextMenu;
};
