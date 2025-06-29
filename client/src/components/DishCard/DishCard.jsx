import "./DishCard.css";
import useDishStore from "../../store/useDishStore";
import { useState } from "react";

export default function DishCard({ dishId }) {
    const { getDishById, toggleDishSelectionById, isDishIdInSelectedDishIds } =
        useDishStore();
    const dish = getDishById(dishId);
    const [isSelected, setIsSelected] = useState(
        isDishIdInSelectedDishIds(dishId)
    );

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => {
                toggleDishSelectionById(dishId);
                setIsSelected(!isSelected);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                    toggleDishSelectionById(dishId);
                setIsSelected(!isSelected);
            }}
            className={`dish-card__container ${isSelected ? "-selected" : ""}`}
        >
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
