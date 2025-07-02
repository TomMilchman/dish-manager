// Styling
import "./DishCard.css";

// State Management
import useDishStore from "../../store/useDishStore";
import useModalStore from "../../store/useModalStore";

// React Packages
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaTrash, FaPencil } from "react-icons/fa6";

// API
import { deleteDishFromServer } from "../../api/dishes";

// Components
import DishFormModal from "../Modal/ModalForms/DishFormModal";

export default function DishCard({ dishId, index }) {
    const {
        getDishById,
        toggleDishSelectionById,
        isDishIdInSelectedDishIds,
        setDishToEdit,
    } = useDishStore();
    const { openModal } = useModalStore();
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

    const unitSuffix = {
        gram: "G",
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
            )}
            <h3 className="dish-card__dish-name">{dish.name}</h3>
            <hr className="dish-card__divider" />
            <ul className="dish-card__ingredient-list">
                {dish.ingredients?.map((ingredientObj) => (
                    <li key={`${dishId}-${ingredientObj.ingredient.name}`}>
                        {ingredientObj.ingredient.name} x{" "}
                        {`${ingredientObj.amount}${
                            unitSuffix[ingredientObj.ingredient.unitType] || ""
                        }`}
                    </li>
                ))}
            </ul>
        </div>
    );
}
