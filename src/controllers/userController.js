const userService =
    require("../services/userService");

function register(req,res,next){
    console.log("BODY:",req.body);
    const {
        username,
        email,
        password
    } = req.body;

    userService.registerUser(
        username,
        email,
        password,
        (err,result)=>{

            if(err){
                return next(err);
            }

            res.status(201).json({
                message:
                    "User registered successfully"
            });
        }
    );
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const token = await userService.loginUser(email, password);

res.status(200).json({
  message: "Login successful",
  token
});
  } catch (error) {
    next(error);
  }
}
module.exports = {
    register,
    login
};