// External libraries
import { useEffect, useRef, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";

// Styles
import "./DashboardPage.css";

// State management
import useAuthStore from "../../store/useAuthStore.js";
import useDishStore from "../../store/useDishStore";
import useIngredientStore from "../../store/useIngredientStore";
import useFilterStore from "../../store/useFilterStore.js";
import useMetaStore from "../../store/useMetaStore.js";

// API
import { getAllDishesFromServer } from "../../api/dishApi.js";
import { getAllIngredientsFromServer } from "../../api/ingredientApi.js";
import {
    getAllTagsFromServer,
    getColorMapFromServer,
} from "../../api/metaApi.js";

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
    const {
        setTags,
        selectedTags,
        showFavoritesOnly,
        showUserOnly,
        searchQuery,
    } = useFilterStore();
    const { setColorMap } = useMetaStore();

    const username = useAuthStore((state) => state.username);
    const role = useAuthStore((state) => state.role);

    const [showFilters, setShowFilters] = useState(false);

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
                const userOnlyMatch =
                    showUserOnly && role === "admin"
                        ? dish.owner.username.toLowerCase() ===
                          username.toLowerCase()
                        : true;
                const favoriteMatch = showFavoritesOnly
                    ? dish.isFavorite
                    : true;

                return nameMatch && tagsMatch && favoriteMatch && userOnlyMatch;
            }),
        [
            dishesById,
            searchQuery,
            selectedTags,
            showUserOnly,
            role,
            username,
            showFavoritesOnly,
        ]
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

    const dishesQuery = useSyncQueryToStore({
        queryKey: ["dishes"],
        queryFn: getAllDishesFromServer,
        selectData: (data) => data.dishes,
        onSuccess: setDishes,
    });

    const ingredientsQuery = useSyncQueryToStore({
        queryKey: ["ingredients"],
        queryFn: getAllIngredientsFromServer,
        selectData: (data) => data.ingredients,
        onSuccess: setIngredients,
    });

    const tagsQuery = useSyncQueryToStore({
        queryKey: ["tags"],
        queryFn: getAllTagsFromServer,
        selectData: (data) => data.tags,
        onSuccess: setTags,
    });

    const colorsQuery = useSyncQueryToStore({
        queryKey: ["colors"],
        queryFn: getColorMapFromServer,
        selectData: (data) => data.colorMap,
        onSuccess: setColorMap,
    });

    const isLoading =
        dishesQuery.isLoading ||
        ingredientsQuery.isLoading ||
        tagsQuery.isLoading ||
        colorsQuery.isLoading;

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard__container">
            <TopBar />
            <div>
                {showFilters && <FilterBar />}
                <button
                    className="filter-toggle-btn"
                    onClick={() => setShowFilters((prev) => !prev)}
                >
                    {showFilters ? <FaAngleDoubleUp /> : <FaAngleDoubleDown />}
                    {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
            </div>
            <div className="dashboard__main-content">
                <div className="dashboard__dish-cards-panel">
                    {Object.values(dishesById).length <= 0 ? (
                        <div className="dashboard__dish-card-zero-dishes">
                            <div className="dashboard__dish-card-zero-dishes-text">
                                <h2>No Dishes Found</h2>
                                <p>
                                    Press on the <span>Add Dish</span> button at
                                    the top to create a dish!
                                </p>
                            </div>
                            <img
                                alt="No Dishes"
                                src="/DishManagerTray.png"
                            ></img>
                        </div>
                    ) : selectedTags.size === 0 &&
                      filteredDishes.length === 0 ? (
                        <div className="dashboard__tags-not-matching">
                            No dishes match selected tags
                        </div>
                    ) : (
                        <div className="dashboard__dish-card-grid">
                            {filteredDishes?.map((dish) => (
                                <DishCard key={dish._id} dishId={dish._id} />
                            ))}
                        </div>
                    )}
                </div>
                <div className="dashboard__right-side">
                    <div className="dashboard__summary-panel">
                        <SummaryPanel />
                    </div>
                    <div className="dashboard__bottom-banner">
                        <img alt="banner" src="DishManagerBanner.png"></img>
                    </div>
                </div>
            </div>
        </div>
    );
}
