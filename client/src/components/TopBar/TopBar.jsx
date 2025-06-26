import "./TopBar.css";
import LogoutButton from "../LogoutButton/LogoutButton";
import AddDishModalButton from "../Modal/ModalButtons/AddDishModalButton";

export default function TopBar() {
    return (
        <div className="top-bar__container">
            <div className="top-bar__logo-container">
                <img
                    className="top-bar__logo-image"
                    src="/DishManager.png"
                    alt="Logo"
                />
                <h1 className="top-bar__title">DISH MANAGER</h1>
            </div>
            <div className="top-bar__buttons-container">
                <AddDishModalButton />
                <LogoutButton />
            </div>
        </div>
    );
}
