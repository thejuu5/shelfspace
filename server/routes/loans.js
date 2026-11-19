import express from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../db.js";
import requireAuth from "../middleware/requireAuth.js";
import { getLoanStatus, statusFilter } from "../utils/loanStatus.js";
import { validateLoan } from "../validators/loanValidators.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const now = new Date();
    const { status } = req.query;

    const statusConditions = statusFilter(status, now);

    if (status && !statusConditions) {
      return res.status(400).json({ error: "Unknown status filter" });
    }

    const filter = {
      ownerId: new ObjectId(req.user._id),
      ...statusConditions,
    };

    const items = await db
      .collection("loans")
      .aggregate([
        { $match: filter },
        { $sort: { dateOut: -1 } },
        {
          $lookup: {
            from: "media",
            localField: "itemId",
            foreignField: "_id",
            as: "item",
          },
        },
      ])
      .toArray();
    const loans = items.map((loan) => ({
      ...loan,
      status: getLoanStatus(loan, now),
      itemTitle: loan.item[0]?.title,
    }));
    res.json(loans);
  } catch {
    res.status(500).json({ error: "Failed to fetch loan items" });
  }
});

// GET /api/loans/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const loan = await db.collection("loans").findOne({
      _id: new ObjectId(req.params.id),
      ownerId: new ObjectId(req.user._id),
    });
    if (!loan) return res.status(404).json({ error: "Loan not found" });
    res.json({ ...loan, status: getLoanStatus(loan, new Date()) });
  } catch {
    res.status(400).json({ error: "Invalid loan id" });
  }
});

// POST /api/loans
router.post("/", requireAuth, async (req, res) => {
  const errors = validateLoan(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const db = await connectDB();

    const itemOwnerCheck = await db.collection("media").findOne({
      _id: new ObjectId(req.body.itemId),
      ownerId: new ObjectId(req.user._id),
    });
    if (!itemOwnerCheck)
      return res.status(404).json({ error: "Invalid media item or owner" });

    const availableCheck = await db.collection("loans").findOne({
      itemId: new ObjectId(req.body.itemId),
      dateReturned: null,
    });
    if (availableCheck)
      return res.status(409).json({ error: "Item is already on loan" });

    const newLoan = {
      ownerId: new ObjectId(req.user._id),
      itemId: new ObjectId(req.body.itemId),
      borrowerName: req.body.borrowerName.trim(),
      borrowerEmail: req.body.borrowerEmail
        ? req.body.borrowerEmail.trim()
        : null,
      dateOut: new Date(req.body.dateOut),
      dueDate: new Date(req.body.dueDate),
      dateReturned: req.body.dateReturned
        ? new Date(req.body.dateReturned)
        : null,
    };

    const result = await db.collection("loans").insertOne(newLoan);
    res.status(201).json({
      _id: result.insertedId,
      ...newLoan,
      status: getLoanStatus(newLoan, new Date()),
    });
  } catch {
    res.status(500).json({ error: "Failed to create loan" });
  }
});

// PATCH /api/loans/:id/return
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const updated = await db.collection("loans").findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
        ownerId: new ObjectId(req.user._id),
        dateReturned: null,
      },
      { $set: { dateReturned: new Date() } },
      { returnDocument: "after" }
    );
    if (!updated)
      return res
        .status(404)
        .json({ error: "Loan not found or already returned" });
    res.json({ ...updated, status: getLoanStatus(updated, new Date()) });
  } catch {
    res.status(400).json({ error: "Invalid Loan id" });
  }
});

// PUT /api/loans/:id
router.put("/:id", requireAuth, async (req, res) => {
  const errors = validateLoan(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  try {
    const db = await connectDB();
    // I noticed that clearing the return date on an old loan can reopen it,
    // even when the same item has already been lent to someone else.
    // Could we check for another outstanding loan before allowing this update?
    // A partial unique index for loans with dateReturned: null would also help
    // prevent duplicate loans when two requests arrive at the same time.
    const updated = await db.collection("loans").findOneAndUpdate(
      {
        _id: new ObjectId(req.params.id),
        ownerId: new ObjectId(req.user._id),
      },
      {
        $set: {
          borrowerName: req.body.borrowerName.trim(),
          borrowerEmail: req.body.borrowerEmail
            ? req.body.borrowerEmail.trim()
            : null,
          dateOut: new Date(req.body.dateOut),
          dueDate: new Date(req.body.dueDate),
          dateReturned: req.body.dateReturned
            ? new Date(req.body.dateReturned)
            : null,
        },
      },
      { returnDocument: "after" }
    );
    if (!updated) return res.status(404).json({ error: "Loan not found" });
    res.json({ ...updated, status: getLoanStatus(updated, new Date()) });
  } catch {
    res.status(400).json({ error: "Invalid Loan id" });
  }
});

// DELETE /api/loans/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db.collection("loans").deleteOne({
      _id: new ObjectId(req.params.id),
      ownerId: new ObjectId(req.user._id),
    });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Loan not found" });
    res.json({ message: "Loan deleted" });
  } catch {
    res.status(400).json({ error: "Invalid Loan id" });
  }
});

export default router;
