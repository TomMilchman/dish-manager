// Styling
import "./DishCard.css";

// State Management
import useDishStore from "../../store/useDishStore";
import useModalStore from "../../store/useModalStore";
import useAuthStore from "../../store/useAuthStore";
import useMetaStore from "../../store/useMetaStore";

// React Packages
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTrash, FaPencil, FaRegStar, FaStar } from "react-icons/fa6";

// API
import {
    deleteDishFromServer,
    toggleIsFavoriteInServer,
} from "../../api/dishApi";

// Components
import DishFormModal from "../Modal/ModalForms/DishFormModal";

const PLACEHOLDER_ICON =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiI+PHBhdGggZmlsbD0iI2EzMmUwMyIgZD0iTTIwOCAyOEg0OGEyMCAyMCAwIDAgMC0yMCAyMHYxNjBhMjAgMjAgMCAwIDAgMjAgMjBoMTYwYTIwIDIwIDAgMCAwIDIwLTIwVjQ4YTIwIDIwIDAgMCAwLTIwLTIwbS00IDE1OUw2OSA1MmgxMzVaTTUyIDY5bDEzNSAxMzVINTJaIi8+PC9zdmc+";

export default function DishCard({ dishId }) {
    // Stores & State
    const {
        toggleDishSelectionById,
        isDishIdInSelectedDishIds,
        setDishToEdit,
    } = useDishStore();
    const dish = useDishStore((state) => state.getDishById(dishId));
    const colorMap = useMetaStore((state) => state.colorMap);
    const isSelected = isDishIdInSelectedDishIds(dishId);
    const [isHovered, setIsHovered] = useState(false);

    // Modal & Auth
    const { openModal } = useModalStore();
    const { username } = useAuthStore();

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
            const isFavorite = data.isFavorite;
            dish.isFavorite = isFavorite;

            const message = isFavorite
                ? `Added ${dish.name} to favorites.`
                : `Removed ${dish.name} from favorites.`;
            toast.success(message);
            console.info(message);
        },
    });

    return (
        <div
            className={`dish-card__container ${isSelected ? "selected" : ""}`}
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
            style={{
                backgroundColor: colorMap[dish.cardColor],
            }}
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
            {dish.owner.username.toLowerCase() === username.toLowerCase() && (
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
                    <div className="dish-card__tags-container">
                        {dish.tags?.map((tag) => (
                            <div
                                className="dish-card__tag"
                                key={`${dish.name}-${tag}`}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                    <hr className="dish-card__divider" />
                    <ul className="dish-card__ingredient-list">
                        {dish.ingredients?.map((ingredientObj) => {
                            const ingredient = ingredientObj.ingredient;
                            const unit = unitSuffix[ingredient.unitType] || "";

                            return (
                                <li
                                    key={`${dishId}-${ingredient.name}`}
                                    className="ingredient-list__item"
                                >
                                    <img
                                        src={
                                            ingredient.imageUrl.length > 0
                                                ? ingredient.imageUrl
                                                : PLACEHOLDER_ICON
                                        }
                                        alt={ingredient.name}
                                        className="ingredient-icon"
                                    />
                                    {ingredient.name} x {ingredientObj.amount}
                                    {unit}
                                </li>
                            );
                        })}
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
