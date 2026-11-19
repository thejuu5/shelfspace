import { useState } from "react";
import PropTypes from "prop-types";
import {
  STATUS_VALUES,
  CONDITION_VALUES,
  MEDIA_TYPES,
  BOOK_FORMATS,
  MOVIE_FORMATS,
  MOVIE_RATINGS,
  MOVIE_GENRES,
  VG_ESRB,
  VG_GENRES,
  TG_AGE_RATINGS,
  TG_PLAYTIMES,
  TG_GENRES,
} from "../../constants/mediaOptions";
import "./MediaItemForm.css";

const emptyForm = {
  title: "",
  genre: "",
  releaseYear: "",
  // I noticed that the form starts with “Want-to-read,” but the backend only accepts “Wishlist,” “In Progress,” and “Finished.” 
  // This could be confusing because a user might fill out everything correctly and still get an error if they leave the default status selected. 
  // Maybe we can use STATUS_VALUES[0] as the default
  status: "Want-to-read", 
  condition: "Good",
};

function MediaItemForm({ initialValues, onSubmit, submitLabel, onDelete }) {
  const [mediaType, setMediaType] = useState(initialValues?.mediaType || "");
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await onSubmit({ ...form, mediaType });
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }

  if (!mediaType) {
    return (
      <div className="media-form-type-picker">
        <h2>What are you adding?</h2>
        <div className="media-form-type-options">
          {MEDIA_TYPES.map((type) => (
            <button key={type} type="button" onClick={() => setMediaType(type)}>
              {type}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form className="media-item-form" onSubmit={handleSubmit}>
      <h2>{mediaType}</h2>
      {error && <p className="media-form-error">{error}</p>}

      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </label>

      <label>
        Release year
        <input
          type="number"
          value={form.releaseYear}
          onChange={(e) => update("releaseYear", Number(e.target.value))}
          required
        />
      </label>

      <label>
        Status
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
        >
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label>
        Condition
        <select
          value={form.condition}
          onChange={(e) => update("condition", e.target.value)}
        >
          {CONDITION_VALUES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {mediaType === "Book" && (
        <>
          <label>
            Genre{" "}
            <input
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              required
            />
          </label>
          <label>
            ISBN{" "}
            <input
              value={form.isbn || ""}
              onChange={(e) => update("isbn", e.target.value)}
              required
            />
          </label>
          <label>
            Author{" "}
            <input
              value={form.author || ""}
              onChange={(e) => update("author", e.target.value)}
              required
            />
          </label>
          <label>
            Publisher{" "}
            <input
              value={form.publisher || ""}
              onChange={(e) => update("publisher", e.target.value)}
              required
            />
          </label>
          <label>
            Series (optional){" "}
            <input
              value={form.series || ""}
              onChange={(e) => update("series", e.target.value)}
            />
          </label>
          <label>
            Page count{" "}
            <input
              type="number"
              value={form.pageCount || ""}
              onChange={(e) => update("pageCount", Number(e.target.value))}
              required
            />
          </label>
          <label>
            Format
            <select
              value={form.format || ""}
              onChange={(e) => update("format", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {BOOK_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {mediaType === "Movie" && (
        <>
          <label>
            Genre
            <select
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {MOVIE_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label>
            UPC (12 digits){" "}
            <input
              value={form.upc || ""}
              onChange={(e) => update("upc", e.target.value)}
              required
            />
          </label>
          <label>
            Director{" "}
            <input
              value={form.director || ""}
              onChange={(e) => update("director", e.target.value)}
              required
            />
          </label>
          <label>
            Runtime (minutes){" "}
            <input
              type="number"
              value={form.runtimeMinutes || ""}
              onChange={(e) => update("runtimeMinutes", Number(e.target.value))}
              required
            />
          </label>
          <label>
            Rating
            <select
              value={form.rating || ""}
              onChange={(e) => update("rating", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {MOVIE_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Format
            <select
              value={form.format || ""}
              onChange={(e) => update("format", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {MOVIE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {mediaType === "Video Game" && (
        <>
          <label>
            Genre
            <select
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {VG_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label>
            UPC (12 digits){" "}
            <input
              value={form.upc || ""}
              onChange={(e) => update("upc", e.target.value)}
              required
            />
          </label>
          <label>
            Developer{" "}
            <input
              value={form.developer || ""}
              onChange={(e) => update("developer", e.target.value)}
              required
            />
          </label>
          <label>
            Publisher{" "}
            <input
              value={form.publisher || ""}
              onChange={(e) => update("publisher", e.target.value)}
              required
            />
          </label>
          <label>
            Platform{" "}
            <input
              value={form.platform || ""}
              onChange={(e) => update("platform", e.target.value)}
              required
            />
          </label>
          <label>
            ESRB rating
            <select
              value={form.esrbRating || ""}
              onChange={(e) => update("esrbRating", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {VG_ESRB.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      {mediaType === "Tabletop Game" && (
        <>
          <label>
            Genre
            <select
              value={form.genre}
              onChange={(e) => update("genre", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {TG_GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label>
            UPC (12 digits){" "}
            <input
              value={form.upc || ""}
              onChange={(e) => update("upc", e.target.value)}
              required
            />
          </label>
          <label>
            Designer{" "}
            <input
              value={form.designer || ""}
              onChange={(e) => update("designer", e.target.value)}
              required
            />
          </label>
          <label>
            Publisher{" "}
            <input
              value={form.publisher || ""}
              onChange={(e) => update("publisher", e.target.value)}
              required
            />
          </label>
          <label>
            Age rating
            <select
              value={form.ageRating || ""}
              onChange={(e) => update("ageRating", e.target.value)}
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {TG_AGE_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Min players{" "}
            <input
              type="number"
              value={form.minPlayers || ""}
              onChange={(e) => update("minPlayers", Number(e.target.value))}
              required
            />
          </label>
          <label>
            Max players{" "}
            <input
              type="number"
              value={form.maxPlayers || ""}
              onChange={(e) => update("maxPlayers", Number(e.target.value))}
              required
            />
          </label>
          <label>
            Play time (minutes)
            <select
              value={form.playTimeMinutes || ""}
              onChange={(e) =>
                update("playTimeMinutes", Number(e.target.value))
              }
              required
            >
              <option value="" disabled>
                Select...
              </option>
              {TG_PLAYTIMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <div className="media-form-actions">
        <button type="submit">{submitLabel}</button>
        {!initialValues && (
          <button type="button" onClick={() => setMediaType("")}>
            Change type
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="media-form-delete"
            onClick={onDelete}
          >
            Delete item
          </button>
        )}
      </div>
    </form>
  );
}

MediaItemForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
};

MediaItemForm.defaultProps = {
  initialValues: null,
  onDelete: null,
};

export default MediaItemForm;
