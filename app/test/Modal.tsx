import { useCallback, useEffect, type ReactNode } from "react";

const NAME = "modal";
const CLASS_NAME_DIALOG = "modal-dialog";
const CLASS_NAME_CONTENT = "modal-content";
const CLASS_NAME_OPEN = "modal-open";

interface ModalProps {
  children: ReactNode
  show: boolean
}
function Modal(props: Partial<ModalProps>) {
  const handleShow = useCallback(() => {
    const container = getContainer();
    container.classList.add(CLASS_NAME_OPEN);

  }, []);

  const handleHide = useCallback(() => {
    const container = getContainer();
    container.classList.remove(CLASS_NAME_OPEN);
  }, []);

  useEffect(() => {
    if (props.show)
      handleShow();
    else
      handleHide();
  }, [props.show, handleShow, handleHide]);

  return (
    <div className={NAME} tabIndex={-1}>
      <div className={CLASS_NAME_DIALOG}>
        <div className={CLASS_NAME_CONTENT}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

function getContainer() {
  return document.body;
}

export default Modal;
