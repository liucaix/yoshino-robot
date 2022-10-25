import {Page} from "puppeteer";
import {Friend, Group, GroupMessageEvent} from "oicq";
import {PrivateMessageEvent} from "oicq";
import {ImageElem} from "oicq/lib/message/elements";
import {readMapFile, writeMapFile} from "../util/jsonUtil";
import {checkMessageIsValid, createTaskByRobot, getUserId, sendHelpMessage, updateTaskStateChange} from "./core";
import { intervalConfig } from "../config/interval";
const puppeteer = require("puppeteer");
const moment = require("./moment-cn-zh");
const schedule = require('node-schedule');
const bot = require('../robot')
const myReceivers: Map<number, userTask[]> = new Map();
interface userTask {
    name: string,
    user: string,
    state: taskState,
    time: Date,
}
type taskState = "dangerous" | "warning" | "safe" | "overdue"

export function initBot(receivers: number[]) {
    //初始化,读取json值
    const strMyReceivers = readMapFile<userTask[]>();
    //此时的键为一个string,所以我们要将其设置成number
    for (let [k, v] of strMyReceivers) {
        myReceivers.set(Number(k), v);
    }
    //初始化,为空的值设置一个空数组
    receivers.forEach((v) => {
        if (!myReceivers.has(v)) {
            myReceivers.set(v, [])
        }
    });
    //开启好友监听
    bot.on("message.private.friend", (event: PrivateMessageEvent) => {
        createApp(event)
    })
    //开启群组监听
    bot.on("message.group", (event: GroupMessageEvent) => {
        createApp(event)
    })
}

function createApp(event: GroupMessageEvent | PrivateMessageEvent) {
    let user: Group | Friend;
    let name: string;
    let id: number;
    if ("group_id" in event) {
        user = event.group
        name = (event.member.info?.card === undefined) ? "user" : event.member.info?.card;
        id = event.group_id;
    } else {
        user = event.friend;
        name = event.nickname;
        id = event.friend.user_id
    }
    if (myReceivers.has(id)) {
        const TASK = myReceivers.get(id)
        if (TASK !== undefined) {
            if (checkMessageIsValid(event.raw_message)) {
                user.sendMsg("输入成功.正在更新任务列表.");
                console.log(TASK);
                const task = createTaskByRobot(event.raw_message.slice(1), name);
                TASK.push(task);
                updateAllTask(user);
                sendMessage(user);
            } else if (event.raw_message === "帮助") {
                sendHelpMessage(user)
            } else if (event.raw_message === "更新") {
                updateAllTask(user);
                sendMessage(user);
            }
        }
    }
}

async function sendMessage(user: Group | Friend) {
    async function inputAndScreenshotTask(tasks: userTask[]) {
        const browser = await puppeteer.launch();
        const page: Page = await browser.newPage();
        await page.goto(`file://${__dirname}/../page/myTask.html`)
        for (const value of tasks) {
            const taskDeadline = moment(value.time).fromNow();
            console.log(`addTask("${value.name}","${value.user}","${taskDeadline}","${value.state}")`)
            await page.evaluate(`addTask("${value.name}","${value.user}","${taskDeadline}","${value.state}")`)
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await page.screenshot({path: `${__dirname}/../example.png`, fullPage: true});
        await browser.close();
    }
    updateAllTask(user)
    console.log(myReceivers.get(getUserId(user)));
    await inputAndScreenshotTask(myReceivers.get(getUserId(user))!);
    const img: ImageElem = {
        type: "image",
        file: `${__dirname}/../example.png`,
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await user.sendMsg(img);
}

//核心:创建定时任务
function createTask(value: userTask, user: Group | Friend) {
    const time = moment(value.time);
    switch (value.state) {
        case "overdue":
            break;
        case "dangerous":
            break;
        case "warning":
            schedule.scheduleJob(time.subtract(intervalConfig.dangerousInterval, "minutes").toDate(), () => {
                sendMessage(user);
            });
            schedule.scheduleJob(time.subtract(intervalConfig.betweenDangerousAndWarning, "minutes").toDate(), () => {
                sendMessage(user);
            });
            break;
        case "safe":
            schedule.scheduleJob(time.subtract(intervalConfig.waringInterval, "minutes").toDate(), () => {
                sendMessage(user);
            });
            break;
    }
}
// updateAllTask(TASK)
function updateAllTask(user: Group | Friend) {
    const tasks = myReceivers.get(getUserId(user))!
    for (let i = 0; i < tasks.length; i++) {
        //创建任务
        if (updateTaskStateChange(tasks[i])) {
            console.log(tasks[i].state, tasks[i].time)
            createTask(tasks[i], user);
            console.log(myReceivers);
            writeMapFile(myReceivers);
        }
        //将过期的数据删除
        if (tasks[i].state === "overdue" && moment().diff(moment(tasks[i].time), "minutes") > 60 * 24) {
            tasks.splice(i, 1);
            console.log(myReceivers);

            writeMapFile(myReceivers);
        }
    }
}
