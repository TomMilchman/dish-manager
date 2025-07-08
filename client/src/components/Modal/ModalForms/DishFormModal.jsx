import "./ModalForms.css";

import { useState, useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import IngredientInputRow from "../IngredientInputRow/IngredientInputRow";
import ColorPicker from "../../ColorPicker";

import { handleSubmit } from "../../../utils/formHandlers";
import { addDishToServer, updateDishInServer } from "../../../api/dishApi";

import useIngredientStore from "../../../store/useIngredientStore";
import useDishStore from "../../../store/useDishStore";
import useModalStore from "../../../store/useModalStore";

function renameKeyImmutable(obj, oldKey, newKey) {
    const { [oldKey]: oldValue, ...rest } = obj;
    return { ...rest, [newKey]: oldValue };
}

function validateInput(selectedIngredients) {
    return !selectedIngredients.some(
        ({ ingredientId, amount }) => ingredientId === "" || amount <= 0
    );
}

export default function DishFormModal() {
    const { clearDishToEdit, addDish, updateDish } = useDishStore();
    const { closeModal } = useModalStore();
    const {
        ingredients,
        selectedIngredients,
        setSelectedIngredients,
        removeSelectedIngredientAtIndex,
        addIngredientRow,
        clearSelectedIngredients,
    } = useIngredientStore();
    const dishToEdit = useDishStore((state) => state.dishToEdit);

    const [dishName, setDishName] = useState("");
    const [cardColor, setCardColor] = useState("white");
    const isEdit = Boolean(dishToEdit);
    const originalIngredients = useMemo(
        () => dishToEdit?.ingredients || [],
        [dishToEdit]
    );

    useEffect(() => {
        if (dishToEdit) {
            setDishName(dishToEdit.name);
            setCardColor(dishToEdit.cardColor);

            const formatted = dishToEdit.ingredients.map(
                ({ ingredient, amount }) => ({
                    ingredientId: ingredient._id || ingredient, // handle both populated and raw IDs
                    amount,
                })
            );
            setSelectedIngredients(formatted);
        } else {
            clearSelectedIngredients();
        }
    }, [clearSelectedIngredients, dishToEdit, setSelectedIngredients]);

    const onSuccessHandler = (data) => {
        const dish = data.dish;

        if (isEdit) {
            updateDish(dish);
            toast.success("Successfully updated dish!");
        } else {
            addDish(dish);
            toast.success("Successfully created a new dish!");
        }

        clearSelectedIngredients();
        setDishName("");
        clearDishToEdit();
        closeModal();
    };

    const mutation = useMutation({
        mutationFn: isEdit ? updateDishInServer : addDishToServer,
        onSuccess: onSuccessHandler,
    });

    return (
        <div className="dish-modal__container">
            <h2>{isEdit ? "Edit Dish" : "Add New Dish"}</h2>
            <div className="dish-modal__row-controls">
                <button
                    onClick={() => addIngredientRow()}
                    className="dish-modal__add-row-btn"
                    disabled={selectedIngredients.length === ingredients.length}
                >
                    Add Row
                </button>
                <button
                    onClick={() => clearSelectedIngredients()}
                    className="dish-modal__clear-rows-btn"
                >
                    Clear Rows
                </button>
                {isEdit && (
                    <button
                        type="button"
                        className="dish-modal__revert-btn"
                        onClick={() => {
                            setDishName(dishToEdit.name);
                            setCardColor(dishToEdit.cardColor);
                            setSelectedIngredients(
                                originalIngredients.map(
                                    ({ ingredient, amount }) => ({
                                        ingredientId:
                                            ingredient._id || ingredient,
                                        amount,
                                    })
                                )
                            );
                        }}
                    >
                        Revert Changes
                    </button>
                )}
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    if (!validateInput(selectedIngredients)) {
                        toast.error(
                            "Invalid input, please fill in all fields."
                        );
                        return;
                    }

                    const payload = {
                        name: dishName,
                        cardColor,
                        ingredients: selectedIngredients.map((obj) =>
                            renameKeyImmutable(
                                obj,
                                "ingredientId",
                                "ingredient"
                            )
                        ),
                    };

                    if (isEdit) {
                        handleSubmit(e, mutation, {
                            id: dishToEdit._id,
                            updates: payload,
                        });
                    } else {
                        handleSubmit(e, mutation, payload);
                    }
                }}
                className="dish-modal__form"
            >
                <div className="dish-modal__name-container">
                    <label htmlFor="dish-name-input">Name:</label>

                    <input
                        className="dish-modal__name-input"
                        id="dish-name-input"
                        type="text"
                        placeholder="Dish Name"
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        required
                    />
                </div>
                <ColorPicker
                    color={cardColor}
                    onChange={(newColor) => setCardColor(newColor)}
                />
                <hr className="dish-modal__divider" />
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
                    className="dish-modal__form-submit-btn"
                    type="submit"
                    disabled={mutation.isPending}
                >
                    Save
                </button>
            </form>
        </div>
    );
}
