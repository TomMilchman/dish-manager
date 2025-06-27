import { useState } from "react";
import { toast } from "react-toastify";
import { handleChange, handleSubmit } from "../../../utils/formHandlers";
import IngredientInputRow from "../IngredientInputRow/IngredientInputRow";
import useIngredientStore from "../../../store/useIngredientStore";
import { useMutation } from "@tanstack/react-query";
import { addDish } from "../../../api/dishes";
import useDishStore from "../../../store/useDishStore";

export default function AddDishForm() {
    const [dishName, setDishName] = useState("");
    const {
        selectedIngredients,
        removeSelectedIngredientAtIndex,
        addIngredientRow,
        clearSelectedIngredients,
    } = useIngredientStore();

    const mutation = useMutation({
        mutationFn: addDish,
        onSuccess: (data) => {
            const dish = data.dish;
            useDishStore.getState().addDish(dish);
            clearSelectedIngredients();
            toast.success("Successfully created a new dish!");
            console.info(`Created a new dish ${data.name}`);
        },
    });

    function renameKeyImmutable(obj, oldKey, newKey) {
        const { [oldKey]: oldValue, ...rest } = obj;
        return { ...rest, [newKey]: oldValue };
    }

    const validateInput = () =>
        !selectedIngredients.some(
            ({ ingredientId, amount }) => ingredientId === "" || amount <= 0
        );

    return (
        <div className="add-dish__container">
            <h2>Add New Dish</h2>
            <button
                onClick={() => addIngredientRow()}
                className="add-dish__add-row-btn"
            >
                Add Row
            </button>
            <button
                onClick={() => clearSelectedIngredients()}
                className="add-dish__clear-rows-btn"
            >
                Clear Rows
            </button>
            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    if (!validateInput()) {
                        toast.error(
                            "Invalid input, please fill in all fields."
                        );
                        console.error("Invalid input for Add Dish form.");
                        return;
                    }

                    handleSubmit(e, mutation, {
                        name: dishName,
                        // Dish creation route in server expects the field ingredient inside each array object
                        ingredients: selectedIngredients.map((obj) =>
                            renameKeyImmutable(
                                obj,
                                "ingredientId",
                                "ingredient"
                            )
                        ),
                    });
                }}
                className="add-dish__form"
            >
                <label htmlFor="dish-name-input">Name:</label>

                <input
                    className="add-dish__name-input"
                    id="dish-name-input"
                    type="text"
                    placeholder="Dish Name"
                    onChange={(e) => handleChange(e, dishName, setDishName)}
                />
                <IngredientInputRow
                    key={0}
                    rowIndex={0}
                    currentIngredient={selectedIngredients[0]}
                    onDelete={() => removeSelectedIngredientAtIndex(0)}
                />
                {selectedIngredients.slice(1).map((ing, idx) => (
                    <IngredientInputRow
                        key={idx + 1}
                        rowIndex={idx + 1}
                        currentIngredient={ing}
                        onDelete={() =>
                            removeSelectedIngredientAtIndex(idx + 1)
                        }
                    />
                ))}

                <button type="submit">Save</button>
            </form>
        </div>
    );
}
