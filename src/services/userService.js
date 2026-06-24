const jwt = require("jsonwebtoken");
const bcrypt =
    require("bcrypt");

const userRepository =
    require("../repositories/userRepository");

function registerUser(
    username,
    email,
    password,
    callback
){

    bcrypt.hash(
        password,
        10,
        (err,hashedPassword)=>{

            if(err){
                return callback(err);
            }

            userRepository.createUser(
                username,
                email,
                hashedPassword,
                callback
            );
        }
    );
}
async function loginUser(email, password) {
  const user = await userRepository.findByEmail(email);

  console.log("USER FOUND:", user);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  console.log("PASSWORD MATCH:", isMatch);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
  {
    id: user.id,
    email: user.email
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1d"
  }
);

return token;;
}
module.exports = {
    registerUser,
    loginUser
};