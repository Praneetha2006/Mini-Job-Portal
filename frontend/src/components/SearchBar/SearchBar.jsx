function SearchBar({
  search,
  setSearch,
}) {
  return (
    <input
      type="text"
      placeholder="Search Jobs"
      value={search}
      onChange={(e) =>
        setSearch(e.target.value)
      }
    />
  );
}

export default SearchBar;