const jwt = require('jsonwebtoken');

export function createToken(email: string) {
  const token: string = jwt.sign(
    { email: email },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: '1h',
    }
  );
  return token;
}
