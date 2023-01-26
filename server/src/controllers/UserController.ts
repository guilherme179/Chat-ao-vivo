import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";

const login = async (request: Request, response: Response) => {
  // Validate request body
  const getClientBody = z.object({
    login:     z.string().min(3).max(30).nonempty(),
    password:  z.string().min(8).max(30).nonempty(),
  });

  try{
    const clientBody = getClientBody.parse(request.body);
    
    // Find the user by login
    const user = await prisma.user.findFirst({
      where: {
        login: clientBody.login,
      }
    });

    const isPasswordValid = await bcrypt.compare(clientBody.password, user.password);
    
    // Check if password is valid
    if(isPasswordValid) {
      const expiredAt = Math.floor(Date.now() / 1000) + 86400;

      const token = jwt.sign({user: user.username, id: user.id, exp: expiredAt}, 'a4639bcc6786cf0f399675b012892ead', {algorithm: 'HS256'});
      return response.status(202).json({ token: token });
    } else {
      return response.status(401).send('Incorrect login or password');
    }
  } catch (error) {
    // handle error
    if (error.message.includes("user not found")) {
      return response.status(401).json({
      message: "Incorrect login or password."
      });
    }
    return response.status(400).json({ message: error.message });
  }
};

const register = async (request: Request, response: Response) => {
  // Validate request body
  const getClientBody = z.object({
    login:     z.string().min(3).max(30).nonempty(),
    password:  z.string().min(8).max(30).nonempty(),
    email:     z.string().email().nonempty(),
    username:  z.string().min(3).max(50).nonempty(),
  });

  try {
    const clientBody = getClientBody.parse(request.body);
    // Hash the password
    const hashedPassword = await bcrypt.hash(clientBody.password, 10);
    // Create a new user
    const user = await prisma.user.create({
      data: {
        login: clientBody.login,
        password: hashedPassword,
        email: clientBody.email,
        username: clientBody.username
      }
    });
    return response.status(201).json({ user });
  } catch (error) {
    // handle error
    if (error.message.includes("unique")) {
      return response.status(409).json({
        message: `${error.message.split(".")[0]} already exist.`
      });
    }
    return response.status(400).json({ message: error.message });
  }
};

module.exports = {
  login,
  register
}