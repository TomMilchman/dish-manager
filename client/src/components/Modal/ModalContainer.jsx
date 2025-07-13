import "./ModalContainer.css";
import { useEffect } from "react";
import { FaX } from "react-icons/fa6";
import useModalStore from "../../store/useModalStore";

export default function ModalContainer() {
    const { isOpen, content, closeModal } = useModalStore();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                closeModal();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeModal]);

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal__content">
                <button
                    className="modal__close-button"
                    title="Close"
                    onClick={closeModal}
                >
                    <FaX />
                </button>
                {content}
            </div>
        </div>
    );
}
