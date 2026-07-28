import { MapPin, Search } from "lucide-react";

import "./SearchBar.css";

function SearchBar({
    query,
    setQuery,
    city,
    setCity,
    cities,
    onSearch,
}) {

    return (

        <form
            className="catalog-search"
            onSubmit={onSearch}
        >

            {/* Campo de pesquisa */}

            <div>

                <Search size={18} />

                <input
                    value={query}
                    placeholder="Título, autor ou ISBN"
                    onChange={(event) =>
                        setQuery(event.target.value)
                    }
                />

            </div>

            {/* Filtro por cidade */}

            <div className="city-filter">

    <MapPin size={16} />

    <select
        value={city}
        onChange={(event) => setCity(event.target.value)}
    >
        {cities.map((city) => (
            <option
                key={city}
                value={city}
            >
                {city}
            </option>
        ))}
    </select>

</div>

<button
    className="button button--primary"
>
    Buscar
</button>

        </form>

    );

}

export default SearchBar;