const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});


// control de todas nuestros archivos de rutas

const authRouter = require("./auth.routes")
router.use("/auth", authRouter)


module.exports = router;
