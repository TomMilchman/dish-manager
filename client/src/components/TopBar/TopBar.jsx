// Styling
import "./TopBar.css";

// External Dependencies
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaPowerOff } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { MdOutlinePlaylistRemove } from "react-icons/md";

// State Management
import useAuthStore from "../../store/useAuthStore";
import useModalStore from "../../store/useModalStore.js";
import useDishStore from "../../store/useDishStore.js";

// Components
import DishFormModal from "../../components/Modal/ModalForms/DishFormModal.jsx";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import IngredientFormModal from "../Modal/ModalForms/IngredientFormModal.jsx";

// API
import { logout } from "../../api/auth";

export default function TopBar() {
    const openModal = useModalStore((state) => state.openModal);
    const role = useAuthStore((state) => state.role);
    const { clearSelectedDishes } = useDishStore();
    const navigate = useNavigate();

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: (data) => {
            toast.success(data.message);
            console.log(data.message);
            navigate("/login");
            useAuthStore.getState().logout();
        },
    });

    return (
        <div className="top-bar__container">
            <div className="top-bar__logo-and-left-buttons-container">
                <div className="top-bar__logo-container">
                    <img
                        className="top-bar__logo-image"
                        src="/DishManager.png"
                        alt="Logo"
                    />
                    <h1 className="top-bar__title">DISH MANAGER</h1>
                </div>
                <div className="top-bar__left-buttons-container">
                    <button
                        className="top-bar-btn add-dish-btn"
                        title="Add Dish"
                        onClick={() => {
                            useDishStore.getState().clearDishToEdit();
                            openModal(<DishFormModal />);
                        }}
                    >
                        <FaPlus /> Add Dish
                    </button>
                    {role === "admin" && (
                        <>
                            <button
                                className="top-bar-btn"
                                onClick={() => {
                                    openModal(<IngredientFormModal />);
                                }}
                            >
                                <FaPlus />
                                Add Ingredient
                            </button>
                            <button
                                className="top-bar-btn"
                                onClick={() => {
                                    openModal(
                                        <IngredientFormModal isEdit={true} />
                                    );
                                }}
                            >
                                <FaPlus />
                                Edit Ingredient
                            </button>
                        </>
                    )}
                    <button
                        className="top-bar-btn clear-card-selection-btn"
                        title="Clear Selection"
                        onClick={() => clearSelectedDishes()}
                    >
                        <MdOutlinePlaylistRemove /> Clear Selection
                    </button>
                </div>
            </div>
            <div className="top-bar__right-buttons-container">
                <h2 className="top-bar__username">
                    Hi, {useAuthStore.getState().username}
                </h2>
                <button
                    onClick={logoutMutation.mutate}
                    className="top-bar-btn logout-btn"
                    title="Log Out"
                >
                    <FaPowerOff />
                </button>
            </div>
            {logoutMutation.isPending && <LoadingSpinner />}
        </div>
    );
}
