-- CreateTable
CREATE TABLE "Student" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("email")
);
