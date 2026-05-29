import jwt from 'jsonwebtoken';

// GENERATION DE TOKEN D'ACCES COURT TERME
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    });
};

// GENERATION DE REFRESH TOKEN LONG TERME
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    });
};

export { generateAccessToken, generateRefreshToken };
export default {
    generateAccessToken,
    generateRefreshToken
};
