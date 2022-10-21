const template = document.querySelector(".taskBox")
template.remove();
function addTask(taskContent,taskUser,taskDeadline,category){
    const t = template.cloneNode(true);
    const colorBar = t.children.item(0);
    const contentBox = t.children.item(1);
    const taskContentN = contentBox.children[0];
    const taskUserN = contentBox.children[1];
    const taskDeadlineN = contentBox.children[2];
    colorBar.classList.remove("overdue")
    colorBar.classList.add(category);
    taskContentN.innerHTML = taskContent;
    taskUserN.innerHTML = taskUser;
    taskDeadlineN.innerHTML = taskDeadline;
    document.body.appendChild(t);
}
