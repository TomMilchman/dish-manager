import "./DashboardPage.css";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "../../components/TopBar/TopBar";
import useDishStore from "../../store/useDishStore";
import useIngredientStore from "../../store/useIngredientStore";
import { getAllDishesFromServer } from "../../api/dishes.js";
import { getAllIngredientsFromServer } from "../../api/ingredients.js";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";

function Dashboard() {
    const { setDishes } = useDishStore();
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
        <div className="dashboard">
            <TopBar />
            <div className="main-content">
                <div className="dish-panel"></div>
                <div className="summary-panel"></div>
            </div>
        </div>
    );
}

export default Dashboard;
