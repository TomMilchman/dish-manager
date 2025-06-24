import "./ModalContainer.css";
import { FaX } from "react-icons/fa6";
import useModalStore from "../../store/useModalStore";

export default function ModalContainer() {
    const { isOpen, content, closeModal } = useModalStore();

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal__content">
                <button className="modal__close-button" onClick={closeModal}>
                    <FaX />
                </button>
                {content}
            </div>
        </div>
    );
}
