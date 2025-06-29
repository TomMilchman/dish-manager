import { FaPlus } from "react-icons/fa6";
import useModalStore from "../../../store/useModalStore";
import AddDishForm from "../../Modal/ModalForms/AddDishModalForm";

export default function AddDishModal() {
    const openModal = useModalStore((state) => state.openModal);

    return (
        <button
            className="add-dish-btn"
            title="Add Dish"
            onClick={() => openModal(<AddDishForm />)}
        >
            <FaPlus />
            Add Dish
        </button>
    );
}
