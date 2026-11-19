import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { STATUS_VALUES } from "../../constants/mediaOptions";
import "./Library.css";

function Library() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  async function fetchItems() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    // This request saves the response directly into items.
    // If the session expires, the API returns an error object, and items.map()
    // will fail when the page renders. Could we check the response status first,
    // redirect to login for a 401, and show a message for other errors?
    setError("");
    try {
      const res = await fetch(`/api/media?${params.toString()}`);
  
      if (res.status === 401) {
        navigate("/login");
        return;
      }
  
      if (!res.ok) {
        throw new Error("Could not load your library. Please try again.");
      }
  
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    fetchItems();
  }, [search, status]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    await fetch(`/api/media/${id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <div className="library-page">
      <div className="library-controls">
        <input
          placeholder="Search title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Link to="/add-item" className="library-add-button">
          + Add item
        </Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="library-list">
        {items.map((item) => (
          <div className="library-row" key={item._id}>
            <div>
              <p className="library-row-title">{item.title}</p>
              <p className="library-row-sub">
                {item.mediaType} · {item.genre}
              </p>
            </div>
            <div className="library-row-right">
              <span className="library-row-status">{item.status}</span>
              <Link
                to={`/edit-item/${item._id}`}
                className="library-row-update"
              >
                Update
              </Link>
              <button
                type="button"
                className="library-row-delete"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="library-empty">No items found.</p>}
      </div>
    </div>
  );
}

export default Library;
