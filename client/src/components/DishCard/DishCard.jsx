// Styling
import "./DishCard.css";

// State Management
import useDishStore from "../../store/useDishStore";
import useModalStore from "../../store/useModalStore";
import useAuthStore from "../../store/useAuthStore";

// React Packages
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTrash, FaPencil, FaRegStar, FaStar } from "react-icons/fa6";

// API
import {
    deleteDishFromServer,
    toggleIsFavoriteInServer,
} from "../../api/dishes";

// Components
import DishFormModal from "../Modal/ModalForms/DishFormModal";

export default function DishCard({ dishId, index }) {
    // Stores & State
    const {
        toggleDishSelectionById,
        isDishIdInSelectedDishIds,
        setDishToEdit,
    } = useDishStore();
    const dish = useDishStore((state) => state.getDishById(dishId));
    const isSelected = isDishIdInSelectedDishIds(dishId);
    const [isHovered, setIsHovered] = useState(false);

    // Modal & Auth
    const { openModal } = useModalStore();
    const { username } = useAuthStore();

    function selectColor() {
        switch (index % 4) {
            case 0:
                return "yellow";
            case 1:
                return "baige";
            case 2:
                return "orange";
            case 3:
                return "light-green";
            default:
                return "white";
        }
    }

    const unitSuffix = {
        gram: "g",
        liter: "L",
    };

    const deleteDishMutation = useMutation({
        mutationFn: deleteDishFromServer,
        onSuccess: (data) => {
            useDishStore.getState().deleteDishById(data.id);
            toast.success(`Successfully deleted dish ${data.name}.`);
            console.info(`Deleted a dish ${data.name}`);
        },
    });
    const toggleFavoriteMutation = useMutation({
        mutationFn: toggleIsFavoriteInServer,
        onSuccess: (data) => {
            useDishStore.getState().updateDish(data.dish);

            const message = data.dish.isFavorite
                ? `Added ${dish.name} to favorites.`
                : `Removed ${dish.name} from favorites.`;
            toast.success(message);
            console.info(message);
        },
    });

    return (
        <div
            className={`dish-card__container ${isSelected ? "selected" : ""}
            color-${selectColor()}`}
            role="button"
            tabIndex={0}
            onClick={() => {
                toggleDishSelectionById(dishId);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                    toggleDishSelectionById(dishId);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isHovered && (
                <>
                    <div className="dish-card__button-control-container">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setDishToEdit(dish);
                                openModal(<DishFormModal />);
                            }}
                            className={"dish-card-hover-btn"}
                            title={"Edit Dish"}
                        >
                            <FaPencil />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteDishMutation.mutate(dishId);
                            }}
                            className={"dish-card-hover-btn"}
                            title={"Delete Dish"}
                            disabled={deleteDishMutation.isPending}
                        >
                            <FaTrash />
                        </button>
                    </div>
                </>
            )}
            {dish.owner.username === username && (
                <button
                    className={`dish-card__favorite-btn${
                        dish.isFavorite ? " selected" : ""
                    }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMutation.mutate(dishId);
                    }}
                    disabled={toggleFavoriteMutation.isPending}
                    title="Toggle Favorite"
                >
                    {dish.isFavorite ? <FaStar /> : <FaRegStar />}
                </button>
            )}
            <div className="dish-card__content">
                <div className="dish-card__dish-info">
                    <h3 className="dish-card__dish-name">{dish.name}</h3>
                    <hr className="dish-card__divider" />
                    <ul className="dish-card__ingredient-list">
                        {dish.ingredients?.map((ingredientObj) => (
                            <li
                                key={`${dishId}-${ingredientObj.ingredient.name}`}
                            >
                                {ingredientObj.ingredient.name} x{" "}
                                {`${ingredientObj.amount}${
                                    unitSuffix[
                                        ingredientObj.ingredient.unitType
                                    ] || ""
                                }`}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="dish-card__owner-information">
                    {useAuthStore.getState().role === "admin" && (
                        <div className="dish-card__owner">
                            Owner: {dish.owner.username}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
