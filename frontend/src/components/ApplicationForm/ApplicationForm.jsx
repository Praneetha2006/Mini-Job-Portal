import { useState } from "react";

function ApplicationForm() {
  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    alert("Applied Successfully");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />

      <br /><br />

      <input
        type="text"
        name="phone"
        placeholder="Phone"
        onChange={handleChange}
      />

      <br /><br />

      <button type="submit">
        Apply
      </button>
    </form>
  );
}

export default ApplicationForm;