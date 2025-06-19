const request = require("supertest");
const express = require("express");
const dishController = require("../../controllers/dishesController"); // path to your controller file
const Dish = require("../../models/Dish");
const ingredientController = require("../../controllers/ingredientsController");
const Ingredient = require("../../models/Ingredient");

// Mock Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware that adds req.user
app.use((req, res, next) => {
    req.user = { userId: "user1", role: "user" };
    next();
});

// Dummy routes for testing
app.post("/dishes", dishController.createUserDish);
app.get("/dishes", dishController.getAllUserDishes);
app.get("/dishes/:id", dishController.getUserDishById);
app.get(
    "/admin/dishes",
    (req, res, next) => {
        req.user.role = "admin";
        next();
    },
    dishController.getAllDishes
);
app.put("/dishes/:id", dishController.updateDish);
app.delete("/dishes/:id", dishController.deleteDish);
app.post("/dishes/aggregate", dishController.aggregateIngredientsFromDishes);

app.post("/ingredients", ingredientController.createIngredient);
app.get("/ingredients", ingredientController.getAllIngredients);
app.get("/ingredients/:id", ingredientController.getIngredientById);
app.put("/ingredients/:id", ingredientController.updateIngredient);
app.delete("/ingredients/:id", ingredientController.deleteIngredient);

// Mock Dish model methods
jest.mock("../../models/Dish");
jest.mock("../../models/Ingredient");

describe("Ingredient Controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /ingredients", () => {
        it("creates an ingredient and returns 201", async () => {
            Ingredient.create.mockResolvedValue();

            const res = await request(app).post("/ingredients").send({
                name: "Tomato",
                price: 2.5,
                imageUrl: "http://example.com/tomato.png",
            });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toMatch(/created/i);
            expect(Ingredient.create).toHaveBeenCalledWith({
                name: "Tomato",
                price: 2.5,
                imageUrl: "http://example.com/tomato.png",
            });
        });

        it("returns 500 if DB error", async () => {
            Ingredient.create.mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .post("/ingredients")
                .send({ name: "Tomato", price: 2.5 });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Internal server error.");
        });
    });

    describe("GET /ingredients", () => {
        it("returns all ingredients", async () => {
            const ingredients = [
                { _id: "i1", name: "Salt", price: 1 },
                { _id: "i2", name: "Pepper", price: 1.5 },
            ];
            Ingredient.find.mockResolvedValue(ingredients);

            const res = await request(app).get("/ingredients");

            expect(res.statusCode).toBe(200);
            expect(res.body.ingredients).toHaveLength(2);
        });

        it("returns 500 on error", async () => {
            Ingredient.find.mockRejectedValue(new Error("DB Error"));

            const res = await request(app).get("/ingredients");

            expect(res.statusCode).toBe(500);
        });
    });

    describe("GET /ingredients/:id", () => {
        it("returns ingredient by ID", async () => {
            const ingredient = { _id: "i1", name: "Salt", price: 1 };
            Ingredient.findById.mockResolvedValue(ingredient);

            const res = await request(app).get("/ingredients/i1");

            expect(res.statusCode).toBe(200);
            expect(res.body.ingredient.name).toBe("Salt");
        });

        it("returns 404 if not found", async () => {
            Ingredient.findById.mockResolvedValue(null);

            const res = await request(app).get("/ingredients/unknown");

            expect(res.statusCode).toBe(404);
        });
    });

    describe("PUT /ingredients/:id", () => {
        it("updates ingredient and returns updated object", async () => {
            const updated = { _id: "i1", name: "Salt", price: 2 };
            Ingredient.findByIdAndUpdate.mockResolvedValue(updated);

            const res = await request(app)
                .put("/ingredients/i1")
                .send({ price: 2 });

            expect(res.statusCode).toBe(200);
            expect(res.body.ingredient.price).toBe(2);
        });

        it("returns 404 if ingredient not found", async () => {
            Ingredient.findByIdAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .put("/ingredients/i1")
                .send({ price: 2 });

            expect(res.statusCode).toBe(404);
        });
    });

    describe("DELETE /ingredients/:id", () => {
        it("deletes ingredient and returns 200", async () => {
            const deleted = { _id: "i1", name: "Salt" };
            Ingredient.findByIdAndDelete.mockResolvedValue(deleted);

            const res = await request(app).delete("/ingredients/i1");

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/deleted/i);
        });

        it("returns 404 if ingredient not found", async () => {
            Ingredient.findByIdAndDelete.mockResolvedValue(null);

            const res = await request(app).delete("/ingredients/i1");

            expect(res.statusCode).toBe(404);
        });
    });
});

describe("Dishes API routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /dishes", () => {
        it("creates a dish and returns 201", async () => {
            const fakeDish = {
                _id: "dish1",
                name: "Pizza",
                ingredients: [],
                owner: "user1",
                __v: 0,
            };
            Dish.create.mockResolvedValue(fakeDish);

            const res = await request(app)
                .post("/dishes")
                .send({ name: "Pizza", ingredients: [] });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe("Successfully created user dish.");
            expect(res.body.dish).toMatchObject({
                name: "Pizza",
                owner: "user1",
            });
            expect(Dish.create).toHaveBeenCalledWith({
                name: "Pizza",
                ingredients: [],
                owner: "user1",
            });
        });

        it("handles error and returns 500", async () => {
            Dish.create.mockRejectedValue(new Error("DB Error"));

            const res = await request(app)
                .post("/dishes")
                .send({ name: "Pizza", ingredients: [] });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe("Internal server error.");
        });
    });

    describe("GET /dishes", () => {
        it("returns all user dishes with 200", async () => {
            const fakeDishes = [
                {
                    _id: "dish1",
                    name: "Pasta",
                    ingredients: [],
                    owner: "user1",
                },
            ];
            Dish.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeDishes),
            });

            const res = await request(app).get("/dishes");

            expect(res.statusCode).toBe(200);
            expect(res.body.dishes).toHaveLength(1);
            expect(Dish.find).toHaveBeenCalledWith({ owner: "user1" });
        });

        it("returns 404 if no dishes", async () => {
            Dish.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue([]),
            });

            const res = await request(app).get("/dishes");

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("No dishes found for user.");
        });

        it("handles error with 500", async () => {
            Dish.find.mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error("DB Error")),
            });

            const res = await request(app).get("/dishes");

            expect(res.statusCode).toBe(500);
        });
    });

    describe("GET /dishes/:id", () => {
        it("returns dish for user", async () => {
            const fakeDish = {
                _id: "dish1",
                name: "Pasta",
                ingredients: [],
                owner: "user1",
            };
            const populateMock = jest.fn().mockResolvedValue(fakeDish);
            Dish.findById.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                equals: jest.fn().mockReturnValue({ populate: populateMock }),
            });

            const res = await request(app).get("/dishes/dish1");

            expect(res.statusCode).toBe(200);
            expect(res.body.dish).toMatchObject({ name: "Pasta" });
        });

        it("returns 404 if dish not found", async () => {
            const populateMock = jest.fn().mockResolvedValue(null);
            Dish.findById.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                equals: jest.fn().mockReturnValue({ populate: populateMock }),
            });

            const res = await request(app).get("/dishes/dish1");

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Dish not found");
        });
    });

    describe("GET /admin/dishes (admin only)", () => {
        it("returns all dishes for admin", async () => {
            const fakeDishes = [
                {
                    _id: "dish1",
                    name: "Pizza",
                    ingredients: [],
                    owner: {
                        _id: "owner1",
                        username: "u1",
                        email: "u1@example.com",
                    },
                },
            ];
            Dish.find.mockReturnValue({
                populate: jest
                    .fn()
                    .mockReturnThis()
                    .mockReturnValue({
                        populate: jest.fn().mockResolvedValue(fakeDishes),
                    }),
            });

            const res = await request(app).get("/admin/dishes");

            expect(res.statusCode).toBe(200);
            expect(res.body.dishes).toHaveLength(1);
        });

        it("returns 403 if not admin", async () => {
            // Create a fresh app instance to avoid middleware pollution
            const nonAdminApp = express();
            nonAdminApp.use(express.json());
            // Simulate a non-admin user
            nonAdminApp.use((req, res, next) => {
                req.user = { userId: "user1", role: "user" };
                next();
            });
            nonAdminApp.get(
                "/admin/dishes",
                (req, res, next) => {
                    // Do not set admin role here
                    next();
                },
                dishController.getAllDishes
            );
            const res = await request(nonAdminApp).get("/admin/dishes");
            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Admin access required.");
        });
    });

    describe("PUT /dishes/:id", () => {
        it("updates dish if user owns it", async () => {
            const dish = { _id: "dish1", owner: "user1", save: jest.fn() };
            Dish.findById.mockResolvedValue(dish);

            const res = await request(app)
                .put("/dishes/dish1")
                .send({ name: "Updated Dish" });

            expect(res.statusCode).toBe(200);
            expect(dish.save).toHaveBeenCalled();
        });

        it("returns 403 if user does not own and not admin", async () => {
            const dish = {
                _id: "dish1",
                owner: "someoneElse",
                save: jest.fn(),
            };
            Dish.findById.mockResolvedValue(dish);

            const res = await request(app)
                .put("/dishes/dish1")
                .send({ name: "Updated Dish" });

            expect(res.statusCode).toBe(403);
        });

        it("returns 404 if dish not found", async () => {
            Dish.findById.mockResolvedValue(null);

            const res = await request(app)
                .put("/dishes/dish1")
                .send({ name: "Updated Dish" });

            expect(res.statusCode).toBe(404);
        });
    });

    describe("DELETE /dishes/:id", () => {
        it("deletes dish if user owns it", async () => {
            const dish = { _id: "dish1", owner: "user1", deleteOne: jest.fn() };
            Dish.findById.mockResolvedValue(dish);

            const res = await request(app).delete("/dishes/dish1");

            expect(res.statusCode).toBe(200);
            expect(dish.deleteOne).toHaveBeenCalled();
        });

        it("returns 403 if user does not own and not admin", async () => {
            const dish = {
                _id: "dish1",
                owner: "someoneElse",
                deleteOne: jest.fn(),
            };
            Dish.findById.mockResolvedValue(dish);

            const res = await request(app).delete("/dishes/dish1");

            expect(res.statusCode).toBe(403);
        });

        it("returns 404 if dish not found", async () => {
            Dish.findById.mockResolvedValue(null);

            const res = await request(app).delete("/dishes/dish1");

            expect(res.statusCode).toBe(404);
        });
    });

    describe("/dishes/aggregate", () => {
        it("aggregates ingredients for user dishes", async () => {
            const fakeDishes = [
                {
                    _id: "d1",
                    ingredients: [
                        { _id: "i1", name: "Tomato", price: 1 },
                        { _id: "i2", name: "Cheese", price: 2 },
                    ],
                },
                {
                    _id: "d2",
                    ingredients: [{ _id: "i1", name: "Tomato", price: 1 }],
                },
            ];
            Dish.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(fakeDishes),
            });

            const res = await request(app)
                .post("/dishes/aggregate")
                .send({ dishIds: ["d1", "d2"] });

            expect(res.statusCode).toBe(200);
            expect(res.body.totalIngredientsPrice).toBe(4);
            expect(
                res.body.ingredients.find((i) => i.name === "Tomato").count
            ).toBe(2);
        });

        it("returns 400 if dishIds missing or empty", async () => {
            const res = await request(app)
                .post("/dishes/aggregate")
                .send({ dishIds: [] });
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("No dish IDs provided.");
        });
    });
});
