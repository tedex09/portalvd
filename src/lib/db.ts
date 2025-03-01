import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI não está definida no ambiente.");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("Conectado ao MongoDB com sucesso!");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("Erro ao conectar ao MongoDB:", error);
    throw new Error("Falha na conexão com o banco de dados.");
  }
};

export default dbConnect;