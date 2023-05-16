let goHint = document.getElementById('goHint')
if (goHint != null) {
    goHint.onclick = () => {
        window.location.href = '../hint-page/index.html'
    }
}

let goOrganize = document.getElementById('goOrg')
if (goOrganize != null) {
    goOrganize.onclick = () => {
        let inputs = document.getElementsByClassName('input')
        if (!(inputs.length == 0)) {
            let message = []
            for (let i of inputs) {
                message.push(+i.value)
                localStorage.setItem('inputs', message)
            }
            if (localStorage.getItem('inputs') == '0,0,0,0,0,0,0,0') alert('Заполните поля для ввода чисел')
            else window.location.href = '../organiser-page/index.html'
        }
        else window.location.href = '../organiser-page/index.html'
    }
}

const colours = [
    'rgb(255, 255, 0)',
    'rgb(255, 165, 0)',
    'rgb(255, 0, 255)',
    'rgb(138, 6, 138)',
    'rgb(96, 14, 155)',
    'rgb(0, 0, 255)',
    'rgb(45, 7, 105)',
    'rgb(0, 0, 0)'
]

let closet_shelves = document.getElementsByClassName('closet-shelf')
let closet_shelves_poses = []
let safe_shelves = document.getElementsByClassName('safe-shelf')
let safe_shelves_poses = []
let spawns = document.getElementsByClassName('spawn')
let counters = document.getElementsByClassName('counter')
let start_position = document.getElementById('startPosition')
let by_groups_quant = localStorage.getItem('inputs').split(',')
let arr = [[[], [], [], [], [], []], [[], [], [], []]]
let elements = []

function countersFilling(spawn) {
    counters[+spawn.getAttribute('name')].innerHTML = spawn.childNodes.length
}

for (let i = 0; i < spawns.length; i++) {
    spawns[i].style.backgroundColor = colours[i]
    for (let j = 0; j < by_groups_quant[i]; j++) {
        let element = document.createElement('div')
        element.classList.add('element')
        element.style.cssText = `background-color: ${colours[i]}; position: absolute`
        spawns[i].append(element)
        elements.push(element)
    }
    countersFilling(spawns[i])
}

for (let i = 0; i < closet_shelves.length; i++) {
    closet_shelves_poses.push(closet_shelves[i].getBoundingClientRect().y)
    closet_shelves_poses.push(closet_shelves[i].getBoundingClientRect().y + closet_shelves[i].offsetHeight)
}

for (let i = 0; i < safe_shelves.length; i++) {
    safe_shelves_poses.push(safe_shelves[i].getBoundingClientRect().y)
    safe_shelves_poses.push(safe_shelves[i].getBoundingClientRect().y + safe_shelves[i].offsetHeight)
}

elements.forEach(element => {
    function drop(x, y, start) {
        let id = colours.indexOf(element.style.backgroundColor)
        function add(i, id, dest) {
            if (dest == 0) {
                closet_shelves[i / 2].append(element)
                element.style.top = 0
                element.style.left = 0
                element.style.position = 'relative'
            } else {
                safe_shelves[i / 2].append(element)
                element.style.top = 0
                element.style.left = 0
                element.style.position = 'relative'
            }
            arr[dest][i / 2].push(id)
            console.log(arr)
        }

        function back() {
            start.append(element)
            element.style.top = 0
            element.style.left = 0
            element.style.position = 'relative'
            if (start.classList[0] == 'closet-shelf') {
                arr[0][start.getAttribute('name')].push(id)
            } else if (start.classList[0] == 'safe-shelf') {
                arr[1][start.getAttribute('name')].push(id)
            }
            console.log(arr)
        }
        
        function check(id, i, j) {
            if (id <= 2) {
                return arr[i][j].includes(id)
            } else {
                return arr[i][j].some(a => a != 0 && a != 1 && a != 2)
            }
        }

        if (x > closet_shelves[0].getBoundingClientRect().x && x < closet_shelves[0].getBoundingClientRect().x + closet_shelves[0].offsetWidth) {
            let flag = 0
            for (let i = 0; i < closet_shelves_poses.length; i = i + 2) {
                if (y > closet_shelves_poses[i] && y < closet_shelves_poses[i + 1]) {
                    if (arr[0][i / 2].length == 0 || check(id, 0, i / 2)) {
                        add(i, id, 0)
                        flag = 1
                    } else {
                        back()
                        flag = 1
                    }
                }
            }
            if (flag == 0) back()
        } else if (x > safe_shelves[0].getBoundingClientRect().x && x < safe_shelves[0].getBoundingClientRect().x + safe_shelves[0].offsetWidth) {
            let flag = 0
            for (let i = 0; i < safe_shelves_poses.length; i = i + 2) {
                if (y > safe_shelves_poses[i] && y < safe_shelves_poses[i + 1]) {
                    if (arr[1][i / 2].length == 0 || check(id, 1, i / 2)) {
                        add(i, id, 1)
                        flag = 1
                    } else {
                        back()
                        flag = 1
                    }
                }
            }
            if (flag == 0) back()
        } else if (x > start_position.getBoundingClientRect().x && x < start_position.getBoundingClientRect().x + start_position.offsetWidth) {
            if (y > start_position.getBoundingClientRect().y && y < start_position.getBoundingClientRect().y + start_position.offsetHeight) {
                let pos = spawns[id].getBoundingClientRect()
                spawns[id].append(element)
                element.style.position = 'absolute'
                element.style.top = `${pos.y}px`
                element.style.left = `${pos.x}px`
                countersFilling(spawns[id])
            }
        }
        else back()
    }

    element.onmousedown = function (e) {
        start = element.parentNode
        element.style.position = 'absolute'
        moveAt(e)
        document.body.append(element)
        if (start.classList[0] == 'spawn') {
            countersFilling(start)
        } else if (start.classList[0] == 'closet-shelf') {
            arr[0][start.getAttribute('name')].pop()
        } else if (start.classList[0] == 'safe-shelf') {
            arr[1][start.getAttribute('name')].pop()
        }

        element.style.zIndex = 1
        function moveAt(e) {
            element.style.left = e.pageX - element.offsetWidth / 2 + 'px'
            element.style.top = e.pageY - element.offsetHeight / 2 + 'px'
        }

        document.onmousemove = function (e) {
            moveAt(e)
        }

        element.onmouseup = function (e) {
            document.onmousemove = null
            element.onmouseup = null
            drop(e.pageX, e.pageY, start)
            if (start.classList[0] == 'spawn') {
                countersFilling(start)
            }
        }
    }

    element.ondragstart = function () {
        return false;
    }
})