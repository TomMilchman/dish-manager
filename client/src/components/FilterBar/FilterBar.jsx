import { useState, useEffect } from "react";

import "./FilterBar.css";
import useFilterStore from "../../store/useFilterStore";

export default function FilterBar() {
    const { tags, setShowFavoritesOnly, setSearchQuery, toggleSelectedTag } =
        useFilterStore();
    const [localInput, setLocalInput] = useState("");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(localInput);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [localInput, setSearchQuery]);

    return (
        <div className="filter-bar__container">
            <div className="filter-bar__name-search">
                <input
                    type="text"
                    placeholder="Dish Name"
                    className="search-bar"
                    onChange={(e) => setLocalInput(e.target.value)}
                />
            </div>
            <div className="filter-bar__search-tags">
                <div className="filter-bar__tag" key={"favorites"}>
                    <input
                        type="checkbox"
                        className="filter-bar__checkbox"
                        id={"filter-by-favorite-checkbox"}
                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    />
                    <label htmlFor="filter-by-favorite-checkbox">
                        Favorites
                    </label>
                </div>
                {tags?.map((tag) => (
                    <div className="filter-bar__tag" key={tag}>
                        <input
                            type="checkbox"
                            className="filter-bar__checkbox"
                            id={`${tag}-checkbox`}
                            onChange={() => toggleSelectedTag(tag)}
                        />
                        <label htmlFor={`${tag}-checkbox`}>{tag}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}
