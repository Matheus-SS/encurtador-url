declare global {
  namespace Express {
    interface Request {
      user: {
        user_id?: number | null;
      };
    }
  }
}
