import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserModel from '@/models/User';

const JWT_SECRET = process.env.NEXTAUTH_SECRET!;

export const generateToken = (user: any) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export const ensureAdminExists = async () => {
  try {
    const adminExists = await UserModel.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await hashPassword('admin');
      await UserModel.create({
        email: 'admin@admin.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
        whatsapp: ''
      });
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error ensuring admin exists:', error);
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      throw new Error('Senha incorreta');
    }

    const token = generateToken(user);
    return { 
      token, 
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        whatsapp: user.whatsapp
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};