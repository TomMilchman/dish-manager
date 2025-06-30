import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import "./ModalForms.css";
import IngredientInputRow from "../IngredientInputRow/IngredientInputRow";

import { handleSubmit } from "../../../utils/formHandlers";
import { addDishToServer } from "../../../api/dishes";

import useIngredientStore from "../../../store/useIngredientStore";
import useDishStore from "../../../store/useDishStore";
import useModalStore from "../../../store/useModalStore";

export default function AddDishForm() {
    const [dishName, setDishName] = useState("");
    const {
        ingredients,
        selectedIngredients,
        removeSelectedIngredientAtIndex,
        addIngredientRow,
        clearSelectedIngredients,
    } = useIngredientStore();
    const { closeModal } = useModalStore();

    const addDishMutation = useMutation({
        mutationFn: addDishToServer,
        onSuccess: (data) => {
            const dish = data.dish;
            useDishStore.getState().addDish(dish);
            clearSelectedIngredients();
            setDishName("");
            toast.success("Successfully created a new dish!");
            console.info(`Created a new dish ${dish.name}`);
            closeModal();
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
            <div className="add-dish__row-controls">
                <button
                    onClick={() => addIngredientRow()}
                    className="add-dish__add-row-btn"
                    disabled={selectedIngredients.length === ingredients.length}
                >
                    Add Row
                </button>
                <button
                    onClick={() => clearSelectedIngredients()}
                    className="add-dish__clear-rows-btn"
                >
                    Clear Rows
                </button>
            </div>
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

                    handleSubmit(e, addDishMutation, {
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
                <div className="add-dish__name-container">
                    <label htmlFor="dish-name-input">Name:</label>

                    <input
                        className="add-dish__name-input"
                        id="dish-name-input"
                        type="text"
                        placeholder="Dish Name"
                        onChange={(e) => setDishName(e.target.value)}
                        required
                    />
                </div>
                <hr className="add-dish__divider" />
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

                <button
                    className="add-dish__form-submit-btn"
                    type="submit"
                    disabled={addDishMutation.isPending}
                >
                    Save
                </button>
            </form>
        </div>
    );
}
