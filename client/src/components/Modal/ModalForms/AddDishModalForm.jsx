export default function AddDishForm() {
    return (
        <form className="add-dish__form">
            <h3>Add New Dish</h3>
            <input type="text" placeholder="Dish Name" />
            <button type="submit">Save</button>
        </form>
    );
}
