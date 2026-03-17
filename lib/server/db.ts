import mongoose from "mongoose"

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error("Missing MONGO_URI environment variable")
}

type MongooseCache = {
  
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

global.mongooseCache = cache

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGO_URI as string, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
