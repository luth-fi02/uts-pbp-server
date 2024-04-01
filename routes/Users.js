const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");
const { sign } = require('jsonwebtoken');
const {validateToken} = require('../middlewares/AuthMiddleWare')

router.post("/", async (req, res) => {
  const { 
    username, 
    password,
    realname,
    age,
    gender,
    birthdate,
    statu,
    email,
    phonenumber,
    address,
    title,
    salary,
  } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
      realname: realname,
      age: age,
      gender: gender,
      birthdate: birthdate,
      statu: statu,
      email: email,
      phonenumber: phonenumber,
      address: address,
      title: title,
      salary: salary,
    });
    res.json("SUCCESS");
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ where: { username: username } });

  if (!user) return res.json({ error: "User Doesn't Exist" });

  bcrypt.compare(password, user.password).then((match) => {
    if (!match) return res.json({ error: "Wrong Username And Password Combination" });
  
  const accessToken = sign(
    {username: user.username, id: user.id}, 
    "importantsecret");

  res.json({
    token: accessToken,
    username: username,
    id: user.id});
  });
});

router.get('/auth', validateToken, (req, res) => {
  res.json(req.user)
});

router.get("/profile", validateToken, async (req, res) => {
  const id = req.user.id;

  const basicInfo= await Users.findByPk(id, {
    attributes: {exclude: ["password"]},
  });

  res.json(basicInfo)
})

router.get("/profileall", async (req, res) => {
  const basicInfo= await Users.findAll({
    attributes: {exclude: ["password"]}
  });

  res.json(basicInfo)
})

router.get("/profile/:id", async (req, res) => {
  const id = req.params.id;

  const basicInfo= await Users.findByPk(id, {
    attributes: {exclude: ["password"]},
  });

  res.json(basicInfo)
})

router.put('/passwordreset', validateToken, async (req, res) => {
  const {oldPassword, newPassword} = req.body;
  const user = await Users.findOne({where: {username: req.user.username}});

  bcrypt.compare(oldPassword, user.password).then(async (match) => {
    if (!match) return res.json({error: "Wrong Password Entered"});

    bcrypt.hash(newPassword, 10).then((hash) => {
      Users.update(
        { password: hash}, 
        { where: {username: req.user.username}}
        );
      res.json("SUCCESS");
    });
  });
});

module.exports = router;