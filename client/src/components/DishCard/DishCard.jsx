// Styling
import "./DishCard.css";

// State Management
import useDishStore from "../../store/useDishStore";

// React Packages
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa6";

// API
import { deleteDishFromServer } from "../../api/dishes";

export default function DishCard({ dishId, index }) {
    const { getDishById, toggleDishSelectionById, isDishIdInSelectedDishIds } =
        useDishStore();
    const dish = getDishById(dishId);
    const isSelected = isDishIdInSelectedDishIds(dishId);
    const [isHovered, setIsHovered] = useState(false);

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

    // TODO: Aggregate all mutations to the same file
    const deleteDishMutation = useMutation({
        mutationFn: deleteDishFromServer,
        onSuccess: (data) => {
            useDishStore.getState().deleteDishById(data.id);
            toast.success(`Successfully deleted dish ${data.name}.`);
            console.info(`Deleted a dish ${data.name}`);
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
                <div className="dish-card__button-control-container">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteDishMutation.mutate(dishId);
                        }}
                        className={"dish-delete-btn"}
                        title={"Delete Dish"}
                        disabled={deleteDishMutation.isPending}
                    >
                        <FaTrash />
                    </button>
                </div>
            )}
            <h3 className="dish-card__dish-name">{dish.name}</h3>
            <ul className="dish-card__ingredient-list">
                {dish.ingredients?.map((ingredientObj) => (
                    <li key={`${dishId}-${ingredientObj.ingredient.name}`}>
                        {ingredientObj.ingredient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
