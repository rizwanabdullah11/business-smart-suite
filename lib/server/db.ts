import mongoose from "mongoose"

function getMongoUri(): string {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error("Missing MONGO_URI environment variable")
  }
  return uri
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  uri: string | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  uri: null,
}

global.mongooseCache = cache

export async function connectToDatabase(): Promise<typeof mongoose> {
  const mongoUri = getMongoUri()

  if (cache.conn && cache.uri === mongoUri) {
    return cache.conn
  }

  if (cache.uri !== mongoUri) {
    cache.conn = null
    cache.promise = null
    cache.uri = null
  }

  if (!cache.promise) {
    cache.uri = mongoUri
    cache.promise = mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || undefined,
    }).catch((error) => {
      cache.conn = null
      cache.promise = null
      cache.uri = null
      throw error
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
