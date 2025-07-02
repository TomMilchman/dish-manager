import "./SummaryPanel.css";
import { useMemo } from "react";
import useDishStore from "../../store/useDishStore";

export default function SummaryPanel() {
    const dishesMap = useDishStore((state) => state.dishesById);
    const selectedDishIds = useDishStore((state) => state.selectedDishIds);

    const selectedDishes = useMemo(() => {
        return selectedDishIds.map((id) => dishesMap[id]).filter(Boolean);
    }, [dishesMap, selectedDishIds]);

    const aggregatedIngredients = useMemo(() => {
        const map = new Map();
        selectedDishes.forEach((dish) => {
            dish.ingredients.forEach(({ ingredient, amount }) => {
                if (map.has(ingredient._id)) {
                    map.get(ingredient._id).amount += amount;
                } else {
                    const { _id, name, unitType } = ingredient;
                    map.set(_id, {
                        name,
                        unitType,
                        price:
                            ingredient.unitType === "unit"
                                ? ingredient.pricePerUnit
                                : ingredient.unitType === "gram"
                                ? ingredient.pricePer100g
                                : ingredient.pricePerLiter,
                        amount,
                    });
                }
            });
        });

        return Array.from(map.values());
    }, [selectedDishes]);

    const totalCost = useMemo(() => {
        return aggregatedIngredients.reduce((sum, ing) => {
            const cost =
                ing.unitType === "gram"
                    ? (ing.amount / 100) * ing.price
                    : ing.amount * ing.price;
            return sum + cost;
        }, 0);
    }, [aggregatedIngredients]);

    return (
        <div className="summary-panel__container">
            <div className="summary-panel__aggregated-ingredients-container">
                <h1>Summary Panel</h1>
                {selectedDishes.length === 0 ? (
                    <p>No Dishes Selected</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Ingredient</th>
                                <th>Amount</th>
                                <th>Cost</th>
                                <th>Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {aggregatedIngredients.map((ing, idx) => (
                                <tr key={`${ing.id}-${idx}`}>
                                    <td>{ing.name}</td>
                                    <td>
                                        {ing.amount} {ing.unitType}(s)
                                    </td>
                                    <td>
                                        {ing.unitType === "unit"
                                            ? `$${ing.price}/unit`
                                            : ing.unitType === "liter"
                                            ? `$${ing.price}/liter`
                                            : `$${ing.price}/100g`}
                                    </td>
                                    <td>
                                        {ing.unitType === "gram"
                                            ? `$${
                                                  (ing.amount / 100) * ing.price
                                              }`
                                            : `$${ing.amount * ing.price}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="summary-panel__total-cost-container">
                <h2>Sum Total: ${totalCost}</h2>
            </div>
        </div>
    );
}
