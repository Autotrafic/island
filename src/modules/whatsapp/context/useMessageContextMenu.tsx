import React, { Dispatch, SetStateAction } from 'react';
import { WMessage } from '../interfaces';
import { copyToClipboard } from '../helpers';

interface ContextMenuOptions {
  setQuotedMessage: Dispatch<SetStateAction<WMessage | null>>;
  setMessageToEdit: Dispatch<SetStateAction<WMessage | null>>;
  setEditText: Dispatch<SetStateAction<string>>;
  setDeleteMessage: Dispatch<SetStateAction<WMessage | null>>;
  setModalDeleteMessage: Dispatch<SetStateAction<boolean>>;
}

export const useMessageContextMenu = ({
  setQuotedMessage,
  setMessageToEdit,
  setEditText,
  setDeleteMessage,
  setModalDeleteMessage,
}: ContextMenuOptions) => {
  let currentContextMenu: HTMLDivElement | null = null;

  const createMenuOption = (label: string, onClick: () => void) => {
    const option = document.createElement('div');
    option.textContent = label;
    option.style.cursor = 'pointer';
    option.style.padding = '4px 8px';
    option.style.borderRadius = '4px';
    option.onclick = () => {
      onClick();
      closeContextMenu();
    };
    option.onmouseenter = () => (option.style.backgroundColor = '#f0f0f0');
    option.onmouseleave = () => (option.style.backgroundColor = 'transparent');
    return option;
  };

  const closeContextMenu = () => {
    if (currentContextMenu) {
      document.body.removeChild(currentContextMenu);
      currentContextMenu = null;
    }
  };

  const handleContextMenu = (event: React.MouseEvent, message: WMessage) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('messages-background') || target.classList.contains('messages-date')) {
      return;
    }

    event.preventDefault();
    closeContextMenu();

    const selectedText = window.getSelection()?.toString();

    const messageElement = target.closest('.message');
    if (!messageElement) {
      return;
    }

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
    contextMenu.style.display = 'flex';
    contextMenu.style.flexDirection = 'column';

    contextMenu.appendChild(
      createMenuOption(selectedText ? 'Copiar selección' : 'Copiar mensaje', () =>
        copyToClipboard(selectedText, message.body)
      )
    );

    contextMenu.appendChild(createMenuOption('Responder', () => setQuotedMessage(message)));

    contextMenu.appendChild(
      createMenuOption('Editar', () => {
        setMessageToEdit(message);
        setEditText(message.body);
      })
    );

    contextMenu.appendChild(
      createMenuOption('Eliminar', () => {
        if (message.fromMe) {
          setDeleteMessage(message);
          setModalDeleteMessage(true);
        }
      })
    );

    document.body.appendChild(contextMenu);
    currentContextMenu = contextMenu;

    const onClickOutside = () => {
      closeContextMenu();
      document.removeEventListener('click', onClickOutside);
    };

    document.addEventListener('click', onClickOutside);
  };

  return handleContextMenu;
};
