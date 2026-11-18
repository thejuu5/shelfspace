# Peer Review: ShelfSpace

## What works well

- **Rubric basics are covered.** Node + Express, MongoDB native driver (no Mongoose), Passport local login with bcrypt, React with hooks and React Router, MIT license, separate `package.json` for backend and frontend, `.env.example` with no real secrets.
- **Two collections with full CRUD.** `media` and `loans` both have create, read, update and delete routes, and every query is limited to the logged-in user (`ownerId`), so one user cannot see or edit another user's data.
- **Seed data.** The loader creates 1,000 media items and about 3,000 loans with Faker.
- **Lint and Prettier pass.** On a clean checkout with LF line endings, `eslint` (backend and frontend) and `prettier --check` show no errors.
- **Code organization.** One folder per component with a matching `.css` file, routes / validators / utils are separated on the server, and constants are shared between forms and filters.
- **Good UX details.** The form changes its fields based on media type (author/ISBN for books, director/runtime for movies, etc.), overdue status is calculated from the due date automatically, the server blocks lending an item that is already out, and deletes ask for confirmation.
- **README** has authors, class link, objective, screenshots, build steps, API table and a demo account.

## Issues and suggestions

### Bug

1. **Deleting a library item leaves its loans behind.** The loans then show as "(deleted item)". Consider deleting the related loans too, or blocking delete while the item is on loan.
    Steps to reproduce:

    Log in and go to My Library. Click '+ Add item' and add an item, e.g. 'Test Book'.
    Go to the Loans page and create a loan for 'Test Book' (any borrower).
    Go back to My Library and delete 'Test Book'.
    Open the Loans page again. The loan is still there and shows '(deleted item)'.


### Rubric items to double check

2. **Leftover / unused bits.** The root `package.json` has a `test` script and `jest` dev dependencies, but there are no tests. The README points to `docs/dataDictionary.md`, but the file is in `misc/`.
3. **Sessions in memory.** `express-session` uses the default MemoryStore, so on Render every restart or sleep logs everyone out (the README mentions this for local dev). Something like `connect-mongo` would fix it, if it is allowed.

### Usability ideas

4. **Genre filter.** The README says you can filter by genre, but the Library page only has search and status. Adding the genre (and media type) dropdown would match the docs, since the API already supports them.

## Overall

Great job overall! A solid, working project that solves a real-world problem.