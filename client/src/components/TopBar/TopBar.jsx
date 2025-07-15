// Styling
import "./TopBar.css";
import "@szhsin/react-menu/dist/index.css";

// External Dependencies
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaPowerOff, FaBars } from "react-icons/fa6";
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

    const menuItems = [
        {
            label: "Add Dish",
            icon: <FaPlus />,
            onClick: () => {
                useDishStore.getState().clearDishToEdit();
                openModal(<DishFormModal />);
            },
            adminOnly: false,
        },
        {
            label: "Add Ingredient",
            icon: <FaPlus />,
            onClick: () => openModal(<IngredientFormModal />),
            adminOnly: true,
        },
        {
            label: "Edit Ingredient",
            icon: <FaPlus />,
            onClick: () => openModal(<IngredientFormModal isEdit={true} />),
            adminOnly: true,
        },
        {
            label: "Clear Selection",
            icon: <MdOutlinePlaylistRemove />,
            onClick: () => clearSelectedDishes(),
            adminOnly: false,
        },
        {
            label: "Log Out",
            icon: <FaPowerOff />,
            onClick: logoutMutation.mutate,
            adminOnly: false,
        },
    ];

    function renderMenu(mode) {
        return menuItems
            .filter((item) => !item.adminOnly || role === "admin")
            .map((item, index) => {
                const content = (
                    <>
                        {item.icon} {item.label}
                    </>
                );

                return mode === "float" ? (
                    <MenuItem
                        key={index}
                        className={`menu-item  ${item.label
                            .toLowerCase()
                            .replace(/\s+/g, "-")}-menu-item`}
                        onClick={item.onClick}
                    >
                        {content}
                    </MenuItem>
                ) : (
                    <button
                        key={index}
                        className={`top-bar-btn ${item.label
                            .toLowerCase()
                            .replace(/\s+/g, "-")}-btn`}
                        title={item.label}
                        onClick={item.onClick}
                    >
                        {content}
                    </button>
                );
            });
    }

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
                <div className="top-bar__menu-options">
                    <Menu
                        menuButton={
                            <MenuButton
                                className={`top-bar-btn top-bar__float-menu ${
                                    role === "admin" ? "is-admin" : "not-admin"
                                }`}
                            >
                                <FaBars />
                            </MenuButton>
                        }
                    >
                        {renderMenu("float")}
                    </Menu>
                    <div
                        className={`top-bar__left-buttons-container ${
                            role === "admin" ? "is-admin" : "not-admin"
                        }`}
                    >
                        {renderMenu("inline")}
                    </div>
                </div>
            </div>
            {logoutMutation.isPending && <LoadingSpinner />}
        </div>
    );
}
