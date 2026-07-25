import "server-only";

export class CommerceError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CommerceError";
  }
}

export function publicCommerceError(error: unknown) {
  if (error instanceof CommerceError) {
    return {
      status: error.status,
      body: { error: error.message, code: error.code },
    };
  }

  return {
    status: 500,
    body: {
      error: "The commerce service could not complete this request.",
      code: "COMMERCE_ERROR",
    },
  };
}
