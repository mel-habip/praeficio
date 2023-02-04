"use strict"
import nodemailer from "nodemailer";
import is_valid_email from '../utils/is_valid_email.js';
import dotenv from 'dotenv';
import env_dir from '../utils/env_dir.js';

dotenv.config({
    path: env_dir
});

const DEF_FROM = `"Test from Mel's Portfolio Tracker Demo 0" ${process.env.DOMAIN_EMAIL_ADDRESS}`; //will be replaced when domain goes live.

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "gmail",
    auth: {
        user: process.env.DOMAIN_EMAIL_ADDRESS, // generated ethereal user
        pass: process.env.DOMAIN_EMAIL_PASSWORD, // generated ethereal password
    },
    tls: {
        rejectUnauthorized: false
    }
});

//turn it into an async function so that we can call and await the result
async function wrappedSendMail(mailOptions) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                resolve(false);
                reject(error);
            } else {
                console.log("Email Sent Successfully", info.response);
                resolve(true);
            }
        });
    })
}
/**
 * @function emailService - sends email as requested 
 * @async
 * @param {{to:String, subject:String, text:String, html:String, cc?:String, bcc?:String}} emailDetails - Hash with parts
 * @returns {Promise<{success:Boolean, errors:Array<String>, message:String}>}
 */
export default async function emailService(emailDetails = {}) {

    const errors = [];

    emailDetails.from = DEF_FROM;

    if (!emailDetails.to) {
        errors.push(`"to" param is required.`);
    } else if (!is_valid_email(emailDetails.to)) {
        errors.push(`"to" email is invalid.`);
    }

    if (emailDetails.cc && !is_valid_email(emailDetails.cc)) {
        errors.push(`"cc" email is invalid.`);
    }

    if (emailDetails.bcc && !is_valid_email(emailDetails.bcc)) {
        errors.push(`"bcc" email is invalid.`);
    }

    if (!emailDetails.subject) errors.push(`"subject" param is required.`);
    if (!emailDetails.text) errors.push(`"text" param is required.`);

    emailDetails.subject = String(emailDetails.subject);
    emailDetails.text = String(emailDetails.text);

    const RESULT = {
        success: false,
        errors,
        message: ''
    };

    if (errors.length) {
        return RESULT;
    }
    // sending email

    await wrappedSendMail(emailDetails).catch((err) => {
        errors.push(err.message);
        console.log("error occurred", err.message);
    });

    return RESULT;
};
