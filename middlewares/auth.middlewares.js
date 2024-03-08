const jwt = require("jsonwebtoken");

function isTokenValid(req, res, next) {
  try {
    // intentar recibir el token
    console.log(req.headers.authorization);

    // validarlo
    const tokenArr = req.headers.authorization.split(" ");
    console.log(tokenArr);

    const token = tokenArr[1];

    const payload = jwt.verify(token, process.env.TOKEN_SECRET);

    console.log(payload);

    req.payload = payload
    // dar acceso a cualquier ruta que use este middleware a saber QUIEN está haciendo la llamada

    next() // continua con la ruta
  } catch (error) {
    console.log(error)
    res.status(401).json({ errorMessage: "Token no valido o expirado" });
  }
}

module.exports = {
  isTokenValid
}
