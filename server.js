/*******************************************************
 *  Smart Restaurant Backend (Assignment 2 - Optimized)
 *******************************************************/

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

console.log("📍 Using MongoDB URI:", process.env.MONGO_URI);

// ===== Groq API Setup =====

// Call Groq API for AI response
async function callGroqAPI(prompt) {
    const https = require('https');

    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const options = {
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (result.choices && result.choices[0] && result.choices[0].message) {
                        resolve(result.choices[0].message.content);
                    } else if (result.error) {
                        reject(new Error(result.error.message || 'Groq API error'));
                    } else {
                        reject(new Error('Invalid Groq response'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// ===== JWT 生成 Token =====
function generateToken(user) {
    return jwt.sign(
        { id: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
    );
}

// ===== 验证用户是否登录 =====
function authenticateUser(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        req.user = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
}

// ===== Only Admin can access =====
function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
}

// ===== App Init =====
const app = express();
app.use(
    cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

let db, mongoClient;

// ===== 环境变量检测 =====
function checkEnv() {
    if (!uri) throw new Error("Missing MONGO_URI");
    if (!dbName) throw new Error("Missing DB_NAME");
}

// ===== 优雅关闭 =====
function shutdown(signal) {
    console.log(`Received ${signal}, shutting down.`);
    process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ======================================================
//                START SERVER
// ======================================================
async function startServer() {
    try {
        checkEnv();
        console.log("Connecting to MongoDB.");

        mongoClient = await MongoClient.connect(uri, {
            maxPoolSize: 20,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000,
            socketTimeoutMS: 45000,
        });

        db = mongoClient.db(dbName);
        console.log("⚡ MongoDB connected with optimized pool");

        /*******************************************************
         *                   USER AUTH
         *******************************************************/
        app.post("/api/users/register", async (req, res) => {
            try {
                const { name, email, password, adminKey } = req.body;

                if (!name || !email || !password) {
                    return res.status(400).json({ message: "Missing fields" });
                }

                const exists = await db.collection("users").findOne({ email });
                if (exists) {
                    return res
                        .status(400)
                        .json({ message: "Email already registered" });
                }

                const hashed = await bcrypt.hash(password, 10);

                // 默认普通用户
                let role = "customer";

                // 如果 adminKey 正确，则创建管理员
                if (adminKey && adminKey === process.env.ADMIN_SECRET) {
                    role = "admin";
                }

                const userDoc = {
                    name,
                    email,
                    password: hashed,
                    role,
                    createdAt: new Date(),
                };

                const result = await db.collection("users").insertOne(userDoc);
                const userWithId = { ...userDoc, _id: result.insertedId };

                const token = generateToken(userWithId);

                res.json({
                    message: "Registration successful",
                    user: {
                        id: result.insertedId,
                        name,
                        email,
                        role,
                    },
                    token,
                });
            } catch (err) {
                console.error("Registration failed:", err);
                res.status(500).json({ message: "Registration failed" });
            }
        });

        app.post("/api/users/login", async (req, res) => {
            const { email, password } = req.body;

            const user = await db.collection("users").findOne({ email });
            if (!user) return res.status(400).json({ message: "Invalid email" });

            const match = await bcrypt.compare(password, user.password);
            if (!match)
                return res.status(400).json({ message: "Invalid password" });

            const token = generateToken(user);

            res.json({
                message: "Login success",
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role,
                },
            });
        });

        app.get("/api/users/me", authenticateUser, async (req, res) => {
            const user = await db
                .collection("users")
                .findOne({ _id: new ObjectId(req.user.id) });

            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        });

        /*******************************************************
         *                      MENU CRUD + CACHE
         *******************************************************/
        let menuCache = null;
        let menuCacheTime = null;

        app.get("/api/menu", async (req, res) => {
            const now = Date.now();

            if (menuCache && now - menuCacheTime < 5000) {
                return res.json(menuCache);
            }

            const menu = await db.collection("menu").find().toArray();
            menuCache = menu;
            menuCacheTime = now;

            res.json(menu);
        });

        app.post("/api/menu", authenticateUser, requireAdmin, async (req, res) => {
            const result = await db.collection("menu").insertOne({
                ...req.body,
                price: parseFloat(req.body.price),
                createdAt: new Date(),
            });

            res.json({ message: "Menu item added", id: result.insertedId });
        });

        app.put(
            "/api/menu/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                await db
                    .collection("menu")
                    .updateOne(
                        { _id: new ObjectId(req.params.id) },
                        { $set: req.body }
                    );

                res.json({ message: "Menu updated" });
            }
        );

        app.delete(
            "/api/menu/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                await db
                    .collection("menu")
                    .deleteOne({ _id: new ObjectId(req.params.id) });
                res.json({ message: "Menu deleted" });
            }
        );

        /*******************************************************
         *                      ORDERS
         *******************************************************/
        // 客户创建订单（CartPage 用）
        app.post("/api/orders", authenticateUser, async (req, res) => {
            const order = {
                ...req.body,
                userId: req.user.id,
                createdAt: new Date(),
                status: req.body.status || "In Progress",
            };

            const result = await db.collection("orders").insertOne(order);

            res.json({
                message: "Order created",
                insertedId: result.insertedId,
            });
        });

        // 管理员查看所有订单（Admin Orders 页面）
        app.get(
            "/api/orders",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                const orders = await db
                    .collection("orders")
                    .find()
                    .sort({ createdAt: -1 })
                    .toArray();
                res.json(orders);
            }
        );

        // 管理员更新订单状态（Mark Completed）
        app.put(
            "/api/orders/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                const { status } = req.body;

                await db.collection("orders").updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: { status: status || "Completed" } }
                );

                res.json({ message: "Order updated" });
            }
        );

        // 管理员删除订单（Delete）
        app.delete(
            "/api/orders/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                await db
                    .collection("orders")
                    .deleteOne({ _id: new ObjectId(req.params.id) });

                res.json({ message: "Order deleted" });
            }
        );

        /*******************************************************
         *                  RESERVATIONS
         *******************************************************/
        app.post("/api/reservations", authenticateUser, async (req, res) => {
            const { date, time, table } = req.body;

            const conflict = await db
                .collection("reservations")
                .findOne({ date, time, table });

            if (conflict)
                return res.status(400).json({ message: "Table already booked!" });

            await db.collection("reservations").insertOne({
                ...req.body,
                userId: req.user.id,
                createdAt: new Date(),
                status: "Pending",
            });

            res.json({ message: "Reservation created" });
        });

        // 管理员查看所有预订（Admin Reservation Management 页面）
        app.get(
            "/api/reservations",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                const list = await db
                    .collection("reservations")
                    .find()
                    .sort({ createdAt: -1 })
                    .toArray();
                res.json(list);
            }
        );

        // 管理员确认预订（Confirm 按钮）
        app.put(
            "/api/reservations/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                const { status } = req.body;

                await db.collection("reservations").updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: { status: status || "Confirmed" } }
                );

                res.json({ message: "Reservation updated" });
            }
        );

        // 管理员删除预订（Delete 按钮）
        app.delete(
            "/api/reservations/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                await db
                    .collection("reservations")
                    .deleteOne({ _id: new ObjectId(req.params.id) });

                res.json({ message: "Reservation deleted" });
            }
        );

        /*******************************************************
         *                        EVENTS
         *******************************************************/
        app.get("/api/events", async (req, res) => {
            res.json(await db.collection("events").find().toArray());
        });

        app.post("/api/events", authenticateUser, requireAdmin, async (req, res) => {
            await db.collection("events").insertOne({
                ...req.body,
                createdAt: new Date(),
            });

            res.json({ message: "Event created" });
        });

        app.put(
            "/api/events/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                await db
                    .collection("events")
                    .updateOne(
                        { _id: new ObjectId(req.params.id) },
                        { $set: req.body }
                    );

                res.json({ message: "Event updated" });
            }
        );

        app.delete(
            "/api/events/:id",
            authenticateUser,
            requireAdmin,
            async (req, res) => {
                await db
                    .collection("events")
                    .deleteOne({ _id: new ObjectId(req.params.id) });
                res.json({ message: "Event deleted" });
            }
        );

        /*******************************************************
         *                        AI
         *******************************************************/
        app.get("/api/ai/recommend", authenticateUser, async (req, res) => {
            const popular = await db.collection("menu").find().limit(3).toArray();
            res.json(popular);
        });

        app.post("/api/ai/learn", authenticateUser, (req, res) => {
            const { category, name } = req.body || {};
            console.log("🧠 AI learn called:", {
                userId: req.user && req.user.id,
                category,
                name,
            });

            return res.json({ success: true });
        });

        // AI Chat with RAG (Retrieval-Augmented Generation) + Groq API
        app.post("/api/ai/chat", authenticateUser, async (req, res) => {
            const { message } = req.body || {};
            const userId = req.user ? req.user.id : "guest";

            // 📋 DEBUG: Log incoming request
            console.log("📥 AI Chat Request:", {
                message,
                userId,
                timestamp: new Date().toISOString()
            });

            if (!message) {
                return res.json({ reply: "Hi! I'm your restaurant AI assistant. Ask me about our menu, prices, or recommendations!" });
            }

            try {
                // Step 1: Retrieve ALL menu data from database
                const allMenuItems = await db.collection("menu").find().toArray();

                // Step 2: Build complete menu context for AI
                let menuText = "Restaurant Menu:\n\n";

                // Group by category
                const categories = {};
                allMenuItems.forEach(item => {
                    if (!categories[item.category]) {
                        categories[item.category] = [];
                    }
                    categories[item.category].push(item);
                });

                // Format menu data
                for (const [category, items] of Object.entries(categories)) {
                    menuText += `${category}:\n`;
                    items.forEach(item => {
                        menuText += `- ${item.name}: $${item.price}\n`;
                    });
                    menuText += "\n";
                }

                // Step 3: Create prompt for AI model
                const prompt = `You are a helpful restaurant assistant. Here is our current menu:

${menuText}

Customer: "${message}"

Please answer the customer's question. If it's about menu items, prices, or recommendations, use the menu data above. For other questions, feel free to provide helpful responses.

Your answer:`;

                console.log("📝 Sending prompt (first 200 chars):", prompt.substring(0, 200) + "...");

                // Step 4: Try Groq API
                if (process.env.GROQ_API_KEY) {
                    try {
                        console.log("🚀 Using Groq API for response...");
                        const groqReply = await callGroqAPI(prompt);

                        if (groqReply && groqReply.trim()) {
                            console.log("✅ Groq API response generated");
                            return res.json({ reply: groqReply.trim() });
                        }
                    } catch (groqError) {
                        console.error("⚠️  Groq API failed:", groqError.message);
                        console.log("💡 Falling back to rule-based response...");
                    }
                }

                // Step 5: Fallback - System error message
                console.log("❌ AI service unavailable, returning error message");
                return res.json({
                    reply: "Sorry, due to a system error, the AI assistant is currently unavailable. Please contact our attendance staff for assistance."
                });

            } catch (error) {
                console.error("❌ AI chat error:", error);
                return res.json({ reply: "Sorry, due to a system error, the AI assistant is currently unavailable. Please contact our attendance staff for assistance." });
            }
        });

        /*******************************************************
         *                      SERVER RUN
         *******************************************************/
        app.listen(port, host, () => {
            console.log(`🚀 Optimized API running at: http://${host}:${port}`);
        });
    } catch (err) {
        console.error("❌ Startup failed:", err);
        process.exit(1);
    }
}

startServer();
