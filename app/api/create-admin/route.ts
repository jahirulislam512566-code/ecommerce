import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("Admin123!", 10);
      
      await prisma.user.create({
        data: {
          email: "admin@example.com",
          password: hashedPassword,
          name: "Admin User",
          role: "ADMIN",
        },
      });
      
      return NextResponse.json({ 
        message: "Admin user created!",
        email: "admin@example.com",
        password: "Admin123!"
      });
    }
    
    return NextResponse.json({ message: "Admin user already exists" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}