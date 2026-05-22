const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// الاتصال بقاعدة البيانات
mongoose.connect("mongodb://127.0.0.1:27017/store")
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.error("Database connection error:", err));

// ==========================================
// 1. الموديلات وقواعد البيانات (MODELS)
// ==========================================

const User = mongoose.model("User", {
  phone: String,
  role: String // admin / cashier
});

const Product = mongoose.model("Product", {
  name: String,
  price: Number,
  qty: Number,
  barcode: String
});

const Sale = mongoose.model("Sale", {
  items: Array,
  total: Number,
  type: String,
  customer: String,
  date: { type: Date, default: Date.now }
});

const Debt = mongoose.model("Debt", {
  customerName: String,
  phone: String,
  totalAmount: Number,
  paidAmount: { default: 0, type: Number },
  remainingAmount: Number,
  status: { default: "active", type: String },
  dueDate: Date
});

const Payment = mongoose.model("Payment", {
  debtId: String,
  amount: Number,
  date: { default: Date.now, type: Date }
});

// دالة مشتركة لإرسال إشارة التحديث لـ Socket.io لمنع تكرار السطر
const emitUpdate = () => io.emit("update");
