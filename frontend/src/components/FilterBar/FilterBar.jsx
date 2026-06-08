function FilterBar({
  filter,
  setFilter,
}) {
  return (
    <select
      value={filter}
      onChange={(e) =>
        setFilter(e.target.value)
      }
    >
      <option value="">
        All
      </option>

      <option value="Full Time">
        Full Time
      </option>

      <option value="Part Time">
        Part Time
      </option>

      <option value="Contract">
        Contract
      </option>
    </select>
  );
}

export default FilterBar;