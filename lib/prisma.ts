type AnyRecord = Record<string, any>

const modelHandler = {
  get: (_target: AnyRecord, prop: string) => {
    if (prop === "findMany") return async () => []
    if (prop === "findUnique") return async () => null
    if (prop === "findFirst") return async () => null
    if (prop === "create") return async (args?: AnyRecord) => args?.data || null
    if (prop === "update") return async (args?: AnyRecord) => args?.data || null
    if (prop === "delete") return async () => null
    if (prop === "upsert") return async (args?: AnyRecord) => args?.update || args?.create || null
    return async () => null
  },
}

const prisma = new Proxy(
  {},
  {
    get: () => new Proxy({}, modelHandler),
  }
) as any

export { prisma }
export default prisma
