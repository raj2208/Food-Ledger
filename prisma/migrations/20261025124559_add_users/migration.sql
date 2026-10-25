-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date_of_birth" DATE,
    "height_cm" DOUBLE PRECISION,
    "weight_kg" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Dummy profile for the app's single user (placeholder email, safe to commit).
INSERT INTO "users" ("name", "email", "date_of_birth", "height_cm", "weight_kg")
VALUES ('Rajkumar Rai', 'rajkumar.rai@example.com', DATE '1995-06-15', 175, 72)
ON CONFLICT ("email") DO NOTHING;
