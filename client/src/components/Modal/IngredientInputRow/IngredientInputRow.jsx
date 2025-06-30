import "./IngredientInputRow.css";
import useIngredientStore from "../../../store/useIngredientStore";
import { FaTrash } from "react-icons/fa";

export default function IngredientInputRow({
    rowIndex,
    currentIngredient,
    onDelete,
}) {
    const {
        ingredients: allIngredients,
        selectedIngredients,
        updateSelectedIngredientAtIndex,
    } = useIngredientStore();

    const handleFieldChange = (field, value) => {
        updateSelectedIngredientAtIndex(rowIndex, {
            ...selectedIngredients[rowIndex],
            [field]: value,
        });
    };

    const getIngredientUnitType = (ingredientId) =>
        allIngredients.find((ing) => ing._id === ingredientId)?.unitType || "";

    return (
        <div className="ingredient-input-row__container">
            <div className="ingredient-input-row__ingredient-type-container">
                <label htmlFor={`ingredient-select-${rowIndex}`}>
                    Choose an ingredient:
                </label>
                <select
                    id={`ingredient-select-${rowIndex}`}
                    className="ingredient-input-row__drop-list"
                    required
                    value={currentIngredient.ingredientId || ""}
                    onChange={(e) =>
                        handleFieldChange("ingredientId", e.target.value)
                    }
                >
                    <option value="" disabled>
                        Select ingredient
                    </option>
                    {allIngredients
                        .filter(
                            (ing) =>
                                !selectedIngredients.some(
                                    (selectedIng, idx) =>
                                        selectedIng.ingredientId === ing._id &&
                                        idx !== rowIndex
                                )
                        )
                        .map((ing) => (
                            <option key={ing._id} value={ing._id}>
                                {ing.name}
                            </option>
                        ))}
                </select>
            </div>

            <div className="ingredient-input-row__amount-container">
                <label htmlFor={`amount-input-${rowIndex}`}>Amount:</label>
                <div className="ingredient-input-row__amount-input-container">
                    <input
                        id={`amount-input-${rowIndex}`}
                        type="number"
                        required
                        min={0}
                        value={currentIngredient.amount || ""}
                        onChange={(e) =>
                            handleFieldChange("amount", e.target.value)
                        }
                    />

                    <label>
                        {getIngredientUnitType(currentIngredient.ingredientId)}
                    </label>
                </div>
            </div>

            <button
                onClick={onDelete}
                className="ingredient-input-row__delete-btn"
                type="button"
                disabled={rowIndex === 0}
            >
                <FaTrash />
            </button>
            <hr className="ingredient-input-row__divider" />
        </div>
    );
}
