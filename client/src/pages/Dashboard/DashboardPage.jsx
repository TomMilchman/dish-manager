// External libraries
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaPlus } from "react-icons/fa6";
import { MdOutlinePlaylistRemove } from "react-icons/md";

// Styles
import "./DashboardPage.css";

// State management
import useDishStore from "../../store/useDishStore";
import useModalStore from "../../store/useModalStore";
import useIngredientStore from "../../store/useIngredientStore";

// API
import { getAllDishesFromServer } from "../../api/dishes.js";
import { getAllIngredientsFromServer } from "../../api/ingredients.js";

// Components
import TopBar from "../../components/TopBar/TopBar";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";
import DishCard from "../../components/DishCard/DishCard.jsx";
import AddDishForm from "../../components/Modal/ModalForms/AddDishModalForm.jsx";

export default function Dashboard() {
    const { setDishes, dishes, clearSelectedDishes } = useDishStore();
    const { setIngredients } = useIngredientStore();
    const openModal = useModalStore((state) => state.openModal);

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
            <div className="dashboard__dish-cards-controls">
                <button
                    className="dashboard-btn add-dish-btn"
                    title="Add Dish"
                    onClick={() => openModal(<AddDishForm />)}
                >
                    <FaPlus /> Add Dish
                </button>
                <button
                    className="dashboard-btn clear-card-selection-btn"
                    title="Clear Selection"
                    onClick={() => clearSelectedDishes()}
                >
                    <MdOutlinePlaylistRemove /> Clear Selection
                </button>
            </div>
            <div className="dashboard__main-content">
                <div className="dashboard__dish-cards-panel">
                    {dishes.map((dish, index) => (
                        <DishCard key={index} dishId={dish._id} index={index} />
                    ))}
                </div>
                <div className="dashboard__summary-panel"></div>
            </div>
        </div>
    );
}
