import bcrypt from "bcrypt";
import userModel from "../model/userModel.js";
import TransactionModel from "../model/transactionModel.js";
import transactionModel from "../model/transactionModel.js";
import jwt from "jsonwebtoken";

export const signUpAction = async (req, res) => {
  const midtransUrl = process.env.MIDTRANS_URL;
  const midtransAuthString = process.env.MIDTRANS_AUTH_STRING;

  try {
    const body = req.body;

    const hashPassword = bcrypt.hashSync(body.password, 12);

    const user = new userModel({
      name: body.name,
      email: body.email,
      photo: "default.png",
      password: hashPassword,
      role: "manager"
    });

    const transaction = new TransactionModel({
      user: user._id,
      price: 290000
    });

    const midtrans = await fetch(midtransUrl, {
      method: "POST",
      body: JSON.stringify({
        transaction_details: {
          order_id: transaction._id.toString(),
          gross_amount: transaction.price
        },
        credit_card: {
          secure: true
        },
        customer_details: {
          email: user.email
        },
        callbacks: {
          finish: "http://localhost:5173/success-checkout"
        }
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${midtransAuthString}`
      }
    });

    const resMidtrans = await midtrans.json();

    await user.save();
    await transaction.save();

    return res.json({
      message: "Sign Up Success",
      data: {
        midtrans_payment_url: resMidtrans.redirect_url || null
      }
    });
  } catch (error) {
    console.error("Midtrans error:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

export const signInAction = async (req, res) => {
  try {
    const body = req.body;

    const existingUser = await userModel.findOne({ email: body.email });

    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const comparePassword = bcrypt.compareSync(body.password, existingUser.password);
    if (!comparePassword) {
      return res.status(400).json({ message: "email / password incorrect" });
    }

    const isValidUser = await transactionModel.findOne({
      user: existingUser._id,
      status: "success"
    });

    if (existingUser.role !== "student" && !isValidUser) {
      return res.status(403).json({ message: "User is not verified" });
    }

    const token = jwt.sign({ id: existingUser._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: "100d" });

    let photo_url = null;
    if (existingUser.role === "student") {
      photo_url = `${process.env.APP_URL}/uploads/students/${existingUser.photo}`;
    }

    return res.json({
      message: "User logged in successfully",
      data: {
        name: existingUser.name,
        email: existingUser.email,
        token,
        role: existingUser.role,
        photo_url
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
