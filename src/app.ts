
import express from "express";

import { getAllOffices, getOfficeById } from "./modules/offices/office.service.js";
import {
  getAllVolunteers,
  getVolunteersByOffice,
  getVolunteerById,
} from "./modules/volunteers/volunteer.service.js";

import {
  getAllRefillRequests,
  getRefillRequestById,
  getRefillRequestsByOffice,
  createRefillRequest,
  claimRefillRequest,
  submitPurchase,
  submitReceipt,
  reviewReimbursement,
} from "./modules/refill-requests/refill-request.service.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "UP", application: "Snack Counter Automation" });
});

// Offices
app.get("/offices", async (_req, res) => {
  try {
    res.json(await getAllOffices());
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/offices/:id", async (req, res) => {
  try {
    const result = await getOfficeById(req.params.id);
    if (!result) return res.status(404).json({ message: "Office not found" });
    res.json(result);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Volunteers
app.get("/volunteers", async (_req, res) => {
  try {
    res.json(await getAllVolunteers());
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/offices/:officeId/volunteers", async (req, res) => {
  try {
    res.json(await getVolunteersByOffice(req.params.officeId));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/volunteers/:id", async (req, res) => {
  try {
    const result = await getVolunteerById(req.params.id);
    if (!result) return res.status(404).json({ message: "Volunteer not found" });
    res.json(result);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Refill requests
app.get("/refill-requests", async (_req, res) => {
  try {
    res.json(await getAllRefillRequests());
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/refill-requests/:id", async (req, res) => {
  try {
    const result = await getRefillRequestById(req.params.id);
    if (!result) return res.status(404).json({ message: "Request not found" });
    res.json(result);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/offices/:officeId/refill-requests", async (req, res) => {
  try {
    res.json(await getRefillRequestsByOffice(req.params.officeId));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/refill-requests", async (req, res) => {
  try {
    const { officeId, reportedBy, description } = req.body;
    if (!officeId || !reportedBy || !description?.trim()) {
      return res.status(400).json({ message: "officeId, reportedBy and description are required" });
    }
    res.status(201).json(await createRefillRequest(officeId, reportedBy, description));
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_REPORTER") {
      return res.status(400).json({ message: "Invalid reporter" });
    }
    res.status(500).json({ message: "Could not create request" });
  }
});

app.post("/refill-requests/:id/claim", async (req, res) => {
  try {
    res.json(await claimRefillRequest(req.params.id, req.body.volunteerId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const status = message === "REQUEST_NOT_FOUND" ? 404 :
      message === "WRONG_OFFICE" ? 403 :
      message === "INVALID_VOLUNTEER" ? 400 : 409;
    res.status(status).json({ message });
  }
});

app.post("/refill-requests/:id/purchase", async (req, res) => {
  try {
    const { volunteerId, amount, receiptReference } = req.body;
    res.json(await submitPurchase(req.params.id, volunteerId, amount, receiptReference));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Purchase failed" });
  }
});

app.post("/refill-requests/:id/receipt", async (req, res) => {
  try {
    res.json(await submitReceipt(req.params.id, req.body.volunteerId));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Receipt submission failed" });
  }
});

app.post("/refill-requests/:id/hr-review", async (req, res) => {
  try {
    const { approved, remarks } = req.body;
    if (typeof approved !== "boolean") {
      return res.status(400).json({ message: "approved must be true or false" });
    }
    res.json(await reviewReimbursement(req.params.id, approved, remarks ?? ""));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Review failed" });
  }
});

export default app;
