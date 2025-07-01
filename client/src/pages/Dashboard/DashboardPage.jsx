// External libraries
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Styles
import "./DashboardPage.css";

// State management
import useDishStore from "../../store/useDishStore";
import useIngredientStore from "../../store/useIngredientStore";
import useAuthStore from "../../store/useAuthStore.js";

// API
import { getAllDishesFromServer } from "../../api/dishes.js";
import { getAllIngredientsFromServer } from "../../api/ingredients.js";

// Components
import TopBar from "../../components/TopBar/TopBar";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";
import DishCard from "../../components/DishCard/DishCard.jsx";
import SummaryPanel from "../../components/SummaryPanel/SummaryPanel.jsx";

export default function DashboardPage() {
    const { setDishes, dishes } = useDishStore();
    const { username } = useAuthStore();
    const { setIngredients } = useIngredientStore();

    const {
        data: dishesData,
        isLoading: dishesLoading,
        isSuccess: dishesSuccess,
    } = useQuery({
        queryKey: ["dishes"],
        queryFn: getAllDishesFromServer,
    });

    const {
        data: ingredientsData,
        isLoading: ingredientsLoading,
        isSuccess: ingredientsSuccess,
    } = useQuery({
        queryKey: ["ingredients"],
        queryFn: getAllIngredientsFromServer,
    });

    // Sync data into Zustand after query success
    useEffect(() => {
        if (dishesSuccess && dishesData) {
            setDishes(dishesData.dishes);
        }
    }, [dishesSuccess, dishesData, setDishes]);

    useEffect(() => {
        if (ingredientsSuccess && ingredientsData) {
            setIngredients(ingredientsData.ingredients);
        }
    }, [ingredientsSuccess, ingredientsData, setIngredients]);

    if (dishesLoading || ingredientsLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard__container">
            <TopBar />
            <div className="dashboard__top-container">
                <h1 className="dashboard__username-header">
                    {username}'s Dashboard
                </h1>
            </div>
            <div className="dashboard__main-content">
                <div className="dashboard__dish-cards-panel">
                    {dishes?.map((dish, index) => (
                        <DishCard key={index} dishId={dish._id} index={index} />
                    ))}
                </div>
                <div className="dashboard__summary-panel">
                    <SummaryPanel />
                </div>
            </div>
        </div>
    );
}
