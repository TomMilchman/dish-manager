import "./Modal.css";
import { useState } from "react";

export default function Modal({ modalAction, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button onClick={() => setIsOpen(true)}>{modalAction}</button>

            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <button
                            className="close"
                            onClick={() => setIsOpen(false)}
                        >
                            &times;
                        </button>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}
