const router = require("express").Router();

const User = require("../models/User.model")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { isTokenValid } = require("../middlewares/auth.middlewares")

// POST "/api/auth/signup" => recibir info del usuario y crear documento en la DB
router.post("/signup", async (req, res, next) => {

  const { email, password } = req.body
  console.log(email, password)

  // deberiamos validar datos del usuario
  if (!email || !password) {
    res.status(400).json({message: "email y password son obligatorios"})
    return; // detener la ejecucion de la ruta
  }

  // que la contraseña sea lo suficiente fuerte
  // const passwordRegex = new RegExp("/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm")
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm

  if (passwordRegex.test(password) === false) {
    res.status(400).json({message: "password debe contener min 8 caracteres, 1 mayuscula y 1 minuscula y 1 número"})
    return; // detener la ejecucion de la ruta
  }

  try {

    // validar que el usuario no existe en la DB
    const foundUser = await User.findOne({ email: email })
    if (foundUser !== null) {
      // el usuario ya existe
      res.status(400).json({message: "correo de usuario ya registrado"})
      return; // detener la ejecucion de la ruta
    }


    // cifrar la contraseña
    const salt = await bcrypt.genSalt(12)
    const hashPassword = await bcrypt.hash(password, salt)
    console.log(hashPassword)

    
    // crear el usuario en la DB
    await User.create({
      email,
      password: hashPassword
    })

    res.sendStatus(201)

  } catch (error) {
    next(error)
  }
})

// POST "/api/auth/login" => validar las credenciales del usuario y enviar un Token
router.post("/login", async (req, res, next) => {

  const { email, password } = req.body
  console.log(email, password)

  if (!email || !password) {
    res.status(400).json({message: "email y password son obligatorios"})
    return; // detener la ejecucion de la ruta
  }

  try {

    // validar que el usuario no existe en la DB
    const foundUser = await User.findOne({ email: email })
    console.log(foundUser)
    if (foundUser === null) {
      // el usuario no existe
      res.status(400).json({message: "usuario no registrado"})
      return; // detener la ejecucion de la ruta
    }


    // comprobar si la contraseña es correcta
    const isPasswordCorrect = await bcrypt.compare(password, foundUser.password )
    console.log(isPasswordCorrect)
    if (isPasswordCorrect === false) {
      res.status(400).json({message: "contraseña no valida"})
      return; // detener la ejecucion de la ruta
    }

    // creamos el Token y lo enviamos al cliente
    const payload = {
      _id: foundUser._id,
      email: foundUser.email
      // si tuvieramos roles en nuestra app, tendrian que ir acá
    }

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "7d" // el token funcionara por 7 días
    })

    res.status(200).json({authToken: authToken})
  } catch (error) {
    next(error)
  }
})


// GET "/api/auth/verify" => validar el token e indicar al cliente que el usuario está autenticado
router.get("/verify", isTokenValid, (req, res, next) => {

  console.log(req.payload)

  // enviar payload al cliente
  res.json(req.payload)

})


router.get("/ejemplo-ruta-privada", isTokenValid, (req, res, next) => {

  console.log(req.payload)

  res.json({data: "data privada"})

})



module.exports = router;