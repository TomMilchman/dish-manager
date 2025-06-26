import "./DashboardPage.css";
import { useQuery } from "@tanstack/react-query";
import TopBar from "../../components/TopBar/TopBar";
import useDishStore from "../../store/useDishStore";
import useIngredientStore from "../../store/useIngredientStore";
import { getAllDishes } from "../../api/dishes.js";
import { getAllIngredients } from "../../api/ingredients.js";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";

function Dashboard() {
    const { setDishes } = useDishStore();
    const { setIngredients } = useIngredientStore();

    const { isLoading: dishesLoading } = useQuery({
        queryKey: ["dishes"],
        queryFn: getAllDishes,
        onSuccess: (data) => {
            setDishes(data.dishes);
        },
    });

    const { isLoading: ingredientsLoading } = useQuery({
        queryKey: ["ingredients"],
        queryFn: getAllIngredients,
        onSuccess: (data) => {
            setIngredients(data.ingredients);
        },
    });

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
