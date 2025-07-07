import { useEffect, useRef, useMemo } from "react";
// External libraries
import { useQuery } from "@tanstack/react-query";

// Styles
import "./DashboardPage.css";

// State management
import useDishStore from "../../store/useDishStore";
import useIngredientStore from "../../store/useIngredientStore";
import useFilterStore from "../../store/useFilterStore.js";

// API
import { getAllDishesFromServer } from "../../api/dishes.js";
import {
    getAllIngredientsFromServer,
    getAllTagsFromServer,
} from "../../api/ingredients.js";

// Components
import TopBar from "../../components/TopBar/TopBar";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";
import DishCard from "../../components/DishCard/DishCard.jsx";
import SummaryPanel from "../../components/SummaryPanel/SummaryPanel.jsx";
import FilterBar from "../../components/FilterBar/FilterBar.jsx";

export default function DashboardPage() {
    const { setDishes, dishesById, setSelectedDishIds, selectedDishIds } =
        useDishStore();
    const { setIngredients } = useIngredientStore();
    const { setTags, selectedTags, showFavoritesOnly, searchQuery } =
        useFilterStore();

    const filteredDishes = useMemo(
        () =>
            Object.values(dishesById)?.filter((dish) => {
                const nameMatch = dish.name
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase());
                const tagsMatch =
                    selectedTags.size === 0
                        ? true
                        : dish.tags?.some((tag) => selectedTags.has(tag));
                const favoriteMatch = showFavoritesOnly
                    ? dish.isFavorite
                    : true;

                return nameMatch && tagsMatch && favoriteMatch;
            }),
        [dishesById, selectedTags, searchQuery, showFavoritesOnly]
    );

    const validSelectedDishIds = useMemo(() => {
        const filteredIds = new Set(filteredDishes.map((dish) => dish._id));
        return Array.from(selectedDishIds).filter((id) => filteredIds.has(id));
    }, [filteredDishes, selectedDishIds]);

    useEffect(() => {
        if (
            validSelectedDishIds.length !==
                Array.from(selectedDishIds).length ||
            !validSelectedDishIds.every(
                (id, i) => id === Array.from(selectedDishIds)[i]
            )
        ) {
            setSelectedDishIds(validSelectedDishIds);
        }
    }, [validSelectedDishIds, selectedDishIds, setSelectedDishIds]);

    function useSyncQueryToStore({ queryKey, queryFn, selectData, onSuccess }) {
        const hasSyncedRef = useRef(false);

        const { data, isLoading, isSuccess } = useQuery({ queryKey, queryFn });

        useEffect(() => {
            if (isSuccess && data && !hasSyncedRef.current) {
                onSuccess(selectData(data));
                hasSyncedRef.current = true;
            }
        }, [isSuccess, data, onSuccess, selectData]);

        return { isLoading };
    }

    const { isLoading: dishesLoading } = useSyncQueryToStore({
        queryKey: ["dishes"],
        queryFn: getAllDishesFromServer,
        selectData: (data) => data.dishes,
        onSuccess: setDishes,
    });

    const { isLoading: ingredientsLoading } = useSyncQueryToStore({
        queryKey: ["ingredients"],
        queryFn: getAllIngredientsFromServer,
        selectData: (data) => data.ingredients,
        onSuccess: setIngredients,
    });

    const { isLoading: tagsLoading } = useSyncQueryToStore({
        queryKey: ["tags"],
        queryFn: getAllTagsFromServer,
        selectData: (data) => data.tags,
        onSuccess: setTags,
    });

    if (dishesLoading || ingredientsLoading || tagsLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard__container">
            <TopBar />
            <FilterBar />
            <div className="dashboard__main-content">
                <div className="dashboard__dish-cards-panel">
                    {filteredDishes?.map((dish, index) => (
                        <DishCard
                            key={dish._id}
                            dishId={dish._id}
                            index={index}
                        />
                    ))}
                </div>
                <div className="dashboard__summary-panel">
                    <SummaryPanel />
                </div>
            </div>
        </div>
    );
}
