import { FaPlus } from "react-icons/fa6";
import useModalStore from "../../../store/useModalStore";
import AddDishForm from "../ModalForms/AddDishModalForm";

export default function AddDishModal() {
    const openModal = useModalStore((state) => state.openModal);

    return (
        <button
            className="icon-button"
            title="Add Dish"
            onClick={() => openModal(<AddDishForm />)}
        >
            <FaPlus />
        </button>
    );
}
