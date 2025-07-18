import "./FormModal.css";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import {
    addIngredientToServer,
    updateIngredientInServer,
} from "../../../api/ingredientApi";

import useModalStore from "../../../store/useModalStore";
import useIngredientStore from "../../../store/useIngredientStore";
import useFilterStore from "../../../store/useFilterStore";

import { handleFormChange, handleSubmit } from "../../../utils/formHandlers";
import { getPriceForIngredient } from "../../../utils/dishUtils";

export default function IngredientFormModal({ isEdit }) {
    const { addOrUpdateIngredient, getIngredientById } = useIngredientStore();
    const ingredientsById = useIngredientStore(
        (state) => state.ingredientsById
    );
    const { tags } = useFilterStore();

    const { closeModal } = useModalStore();

    const [ingredientToEdit, setIngredientToEdit] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        unitType: "unit",
        price: 0,
        tags: [],
        imageUrl: "",
    });

    // Revert to default
    function loadIngredientIntoForm(ingredient) {
        return {
            name: ingredient.name || "",
            unitType: ingredient.unitType || "",
            price: getPriceForIngredient(ingredient) || 0,
            tags: ingredient.tags || [],
            imageUrl: ingredient.imageUrl || "",
        };
    }

    useEffect(() => {
        if (ingredientToEdit) {
            setFormData(loadIngredientIntoForm(ingredientToEdit));
        }
    }, [ingredientToEdit]);

    const onSuccessHandler = (data) => {
        let message = "";

        const ingredient = data.ingredient;
        addOrUpdateIngredient(ingredient);

        if (isEdit) {
            message = `Successfully updated an ingredient: ${ingredient.name}`;
        } else {
            message = `Successfully added a new ingredient: ${ingredient.name}`;
        }

        toast.success(message);
        console.log(message);
        closeModal();
    };

    const mutation = useMutation({
        mutationFn: isEdit ? updateIngredientInServer : addIngredientToServer,
        onSuccess: onSuccessHandler,
    });

    return (
        <div className="modal__container">
            <h2>{isEdit ? "Edit Ingredient" : "Add New Ingredient"}</h2>
            {isEdit && (
                <>
                    <label htmlFor="edit-ingredient-select">
                        Ingredient to edit:
                    </label>
                    <select
                        className="modal__select"
                        id="edit-ingredient-select"
                        value={ingredientToEdit?._id || ""}
                        onChange={(e) => {
                            const selectedIngredient = getIngredientById(
                                e.target.value
                            );
                            setIngredientToEdit(selectedIngredient);
                        }}
                    >
                        <option value="" disabled>
                            Select ingredient
                        </option>
                        {Object.values(ingredientsById).map((ing) => (
                            <option key={ing._id} value={ing._id}>
                                {ing.name}
                            </option>
                        ))}
                    </select>
                    {ingredientToEdit && (
                        <div className="modal__row-controls">
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData(
                                        loadIngredientIntoForm(ingredientToEdit)
                                    )
                                }
                            >
                                Revert Changes
                            </button>
                        </div>
                    )}
                    {ingredientToEdit && <hr className="modal__divider" />}
                </>
            )}
            {(isEdit ? ingredientToEdit : true) && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();

                        if (formData["name"].trim() === "") {
                            toast.error(
                                "Invalid input, please fill in all fields."
                            );
                            return;
                        }

                        if (isEdit) {
                            handleSubmit(e, mutation, {
                                id: ingredientToEdit._id,
                                updates: formData,
                            });
                        } else {
                            handleSubmit(e, mutation, formData);
                        }
                    }}
                    className="modal__form"
                >
                    <div className="modal__name-container">
                        <label htmlFor="name-input">Name:</label>
                        <input
                            className="modal__name-input"
                            id="name-input"
                            type="text"
                            name="name"
                            placeholder="Ingredient Name"
                            value={formData.name}
                            onChange={(e) =>
                                handleFormChange(e, formData, setFormData)
                            }
                            required
                        />
                    </div>
                    <div className="modal__unit-type-container">
                        <label htmlFor="unit-type-select">Unit type:</label>
                        <select
                            value={formData.unitType || "unit"}
                            name="unitType"
                            id="unit-type-select"
                            onChange={(e) =>
                                handleFormChange(e, formData, setFormData)
                            }
                        >
                            <option value="unit">Unit</option>
                            <option value="gram">Gram</option>
                            <option value="liter">Liter</option>
                        </select>
                    </div>
                    <div className="modal__price-container">
                        <label htmlFor="price-input">Base price:</label>
                        <input
                            type="number"
                            step={0.01}
                            id="price-input"
                            name="price"
                            value={formData.price}
                            onChange={(e) =>
                                handleFormChange(e, formData, setFormData)
                            }
                            min={0}
                        />
                    </div>
                    <div modal__image-url-container>
                        <label htmlFor="image-url-input">Image URL:</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) =>
                                handleFormChange(e, formData, setFormData)
                            }
                        />
                    </div>
                    <div className="modal__tags-container">
                        <label>Tags:</label>
                        <div className="modal__tags-grid">
                            {tags?.map((tag) => (
                                <div
                                    key={`${tag}-container`}
                                    className="modal__tag"
                                >
                                    <input
                                        type="checkbox"
                                        id={`modal__${tag}-tag`}
                                        checked={formData.tags.includes(tag)}
                                        onChange={(e) => {
                                            const updatedTags = e.target.checked
                                                ? [...formData.tags, tag]
                                                : formData.tags.filter(
                                                      (t) => t !== tag
                                                  );

                                            setFormData({
                                                ...formData,
                                                tags: updatedTags,
                                            });
                                        }}
                                    />

                                    <label
                                        key={`${tag}-label`}
                                        htmlFor={`modal__${tag}-tag`}
                                    >
                                        {tag}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        className="modal__form-submit-btn"
                        type="submit"
                        disabled={mutation.isPending}
                    >
                        Save
                    </button>
                </form>
            )}
        </div>
    );
}
