import {Client} from "oicq";
import { config } from "./config/config";
import { createClient } from "oicq";
const client:Client = createClient(config.account)
const password = config.password;
client.on("system.login.slider", function (e) {
    console.log("输入ticket:")
    process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
}).login(password).then(()=>{})

module.exports = client;