import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Settings from "@/models/Settings";

export async function POST(req: NextRequest) {
  try {
    // Check if registration is enabled
    await dbConnect();
    const settings = await Settings.findOne();
    
    if (settings && !settings.registrationEnabled) {
      return NextResponse.json(
        { error: "O registro de novos usuários está desativado no momento." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, password, whatsapp } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está em uso" },
        { status: 409 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      whatsapp: whatsapp || "",
      role: "user"
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(
      { message: "Usuário criado com sucesso", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}