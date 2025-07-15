import "./FilterBar.css";

import { useState, useEffect } from "react";
import { FaArrowRotateLeft, FaXmark } from "react-icons/fa6";

import useFilterStore from "../../store/useFilterStore";
import useAuthStore from "../../store/useAuthStore";

export default function FilterBar() {
    const {
        tags,
        selectedTags,
        showFavoritesOnly,
        setShowFavoritesOnly,
        searchQuery,
        clearSearchQuery,
        setSearchQuery,
        toggleSelectedTag,
        showUserOnly,
        setShowUserOnly,
        clearSelectedFilters,
    } = useFilterStore();
    const { role } = useAuthStore();
    const [localInput, setLocalInput] = useState("");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchQuery(localInput);
        }, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [localInput, setSearchQuery]);

    useEffect(() => {
        setLocalInput(searchQuery);
    }, [searchQuery]);

    return (
        <div className="filter-bar__container">
            <div className="filter-bar__name-search">
                <input
                    type="text"
                    placeholder="Dish Name"
                    className="search-bar"
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                />
                <button
                    onClick={clearSearchQuery}
                    className="filter-bar__btn"
                    title="Clear Search"
                >
                    <FaXmark />
                </button>
            </div>
            <div className="filter-bar__search-tags">
                <div className="filter-bar__tag" key={"favorites"}>
                    <input
                        type="checkbox"
                        className="filter-bar__checkbox"
                        id={"filter-by-favorite-checkbox"}
                        checked={showFavoritesOnly}
                        onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    />
                    <label htmlFor="filter-by-favorite-checkbox">
                        Favorites
                    </label>
                </div>
                {role === "admin" && (
                    <label
                        className="filter-bar__tag"
                        htmlFor="user-only-checkbox"
                        key="user-only"
                    >
                        <input
                            type="checkbox"
                            className="filter-bar__checkbox"
                            id="user-only-checkbox"
                            checked={showUserOnly}
                            onChange={(e) => setShowUserOnly(e.target.checked)}
                        />
                        <span>User Only</span>
                    </label>
                )}

                {tags?.map((tag) => (
                    <label
                        className="filter-bar__tag"
                        htmlFor={`${tag}-checkbox`}
                        key={tag}
                    >
                        <input
                            type="checkbox"
                            className="filter-bar__checkbox"
                            id={`${tag}-checkbox`}
                            checked={selectedTags.has(tag)}
                            onChange={() => toggleSelectedTag(tag)}
                        />
                        <span>{tag}</span>
                    </label>
                ))}
            </div>
            <button
                onClick={() => clearSelectedFilters()}
                className="filter-bar__btn"
                title="Remove Filters"
            >
                <FaArrowRotateLeft />
            </button>
        </div>
    );
}
