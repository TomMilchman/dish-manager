import { FaPlus } from "react-icons/fa6";
import useModalStore from "../../../store/useModalStore";

export default function AddDishModal() {
    const openModal = useModalStore((state) => state.openModal);

    const AddDishForm = () => {
        return (
            <form className="add-dish__form">
                <h3>Add New Dish</h3>
                <input type="text" placeholder="Dish Name" />
                <button type="submit">Save</button>
            </form>
        );
    };

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
