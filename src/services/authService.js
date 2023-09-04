const db = require('../models');
const JWT = require('jsonwebtoken');
const authUtils = require('../utils/authUtils'); 

const addUser = async (data) => {
  const { email, password } = data;
  console.log('email', password);
  if(email === undefined || password === undefined || email =='') throw new Error('email or password is undefined');
  const user = await db.user.findOne({ where: { email: email } } 
  const hashedPassword = await authUtils.hashPass(password);
  return await db.user.create({ email:email, password:hashedPassword }).then((user) => {
    return { email: user.email, success: true };
  }
  ).catch((err) => {
    return { success: false, error: err };
  }
  );
};

const verifyUser = async (data) => {
  const { email, password } = data;
  const user = await db.user.findOne({ where: { email: email } });


  if (user) {
    const passwordMatch = await authUtils.checkAuth(password, user.password);
    if (passwordMatch) {
      const token = JWT.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1D' });
      //if(authUtils.verifyJWT(token)) 
      await global.redisClient.set(email, token);
      return { email, token, success: true };
    }
  }
  return false;
};

const verifyJWT = async (token) => {
  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  if(!decoded) return false;
  const user = await db.user.findOne({ where: { email: decoded.email } });
  // if (user) {
  //   return true;
  // }
  // return false;
  const savedToken = await global.redisClient.get(user.email);
  if (savedToken !== token) {
    return {
      success: false,
    };
  }
  return {
    email: user.email,
    success: true
  };
};
  

module.exports = {
  addUser,
  verifyUser,
  verifyJWT
};