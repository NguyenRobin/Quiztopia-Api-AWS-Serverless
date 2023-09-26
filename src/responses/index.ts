export function sendResponse(statusCode: number, message: string) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ success: true, message }),
  };
}

export function sendErrorResponse(error: any) {
  return {
    statusCode: error.statusCode || 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: error.message }),
  };
}
