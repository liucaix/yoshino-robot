import {intervalConfig} from "../config/interval";
import {Friend, Group} from "oicq";
import {ImageElem} from "oicq/lib/message/elements";
const moment = require("./moment-cn-zh");
const year: string = "2022";
interface userTask {
    name: string,
    user: string,
    state: taskState,
    time: Date,
}
type taskState = "dangerous" | "warning" | "safe" | "overdue"
export async function sendHelpMessage(user: Group | Friend) {
    const img: ImageElem = {
        type: "image",
        file: `${__dirname}/../help.png`,
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await user.sendMsg(img);
}

export function getUserId(user: Group | Friend): number {
    if ("getMemberMap" in user) {
        return user.group_id;
    } else {
        return user.user_id;
    }
}
//默认为2022年
//02080809
//标准格式示例:20130208T0809

export function createTaskByRobot(message: string, qqUser: string) {
    const name = message.split(" ")[0];
    let time: string = message.split(" ")[1];
    if (time.length === 4) {
        time = year + time + 'T' + '2359';
    } else if (time.length === 8) {
        time = year + time.slice(0, 4) + 'T' + time.slice(4, 8);
    }
    const newTask: userTask = {
        name: name,
        user: qqUser,
        state: "overdue",
        time: moment(time)
    }
    return newTask;
}

//进行打卡内容校验,示例: #打卡 02080809
export function checkMessageIsValid(s: string): boolean {
    return !(s[0] !== "#" || s.split(" ").length !== 2);

}
//更新任务的状态,若有更新,则返回true,否则返回false.
export function updateTaskStateChange(task: userTask): boolean {
    const minutes = moment(task.time).diff(moment(), "minutes");
    if (task.state === certainState(minutes)) {
        return false;
    } else {
        task.state = certainState(minutes);
        return true;
    }
}
export function certainState(minutes: number): taskState {
    if (minutes <= 0) {
        return "overdue"
    }
    if (minutes < intervalConfig.dangerousInterval + 1) {
        return "dangerous";
    }
    if (minutes < intervalConfig.waringInterval + 1) {
        return "warning";
    }
    return "safe";
}
