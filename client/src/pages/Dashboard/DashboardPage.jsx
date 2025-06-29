import "./DashboardPage.css";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "../../components/TopBar/TopBar";
import useDishStore from "../../store/useDishStore";
import useIngredientStore from "../../store/useIngredientStore";
import { getAllDishesFromServer } from "../../api/dishes.js";
import { getAllIngredientsFromServer } from "../../api/ingredients.js";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";
import DishCard from "../../components/DishCard/DishCard.jsx";

function Dashboard() {
    const { setDishes, dishes } = useDishStore();
    const { setIngredients } = useIngredientStore();

    const {
        data: dishesData,
        isLoading: dishesLoading,
        isSuccess: dishesSuccess,
    } = useQuery({
        queryKey: ["dishes"],
        queryFn: getAllDishesFromServer,
        retry: true,
    });

    const {
        data: ingredientsData,
        isLoading: ingredientsLoading,
        isSuccess: ingredientsSuccess,
    } = useQuery({
        queryKey: ["ingredients"],
        queryFn: getAllIngredientsFromServer,
        retry: true,
    });

    // Sync data into Zustand after query success
    useEffect(() => {
        if (dishesSuccess && dishesData) {
            setDishes(dishesData.dishes);
        }
        console.log(dishesData);
    }, [dishesSuccess, dishesData, setDishes]);

    useEffect(() => {
        if (ingredientsSuccess && ingredientsData) {
            setIngredients(ingredientsData.ingredients);
        }
        console.log(ingredientsData);
    }, [ingredientsSuccess, ingredientsData, setIngredients]);

    if (dishesLoading || ingredientsLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="dashboard__container">
            <TopBar />
            <div className="dashboard__main-content">
                <div className="dashboard__dish-cards-panel">
                    {dishes.map((dish) => (
                        <DishCard key={dish._id} dishId={dish._id} />
                    ))}
                </div>
                <div className="dashboard__summary-panel"></div>
            </div>
        </div>
    );
}

export default Dashboard;
