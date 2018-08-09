class Command {
    constructor(name, execFunction) {
        this.name = name;
        this.execFunction = execFunction;
    }
}

class File {
    constructor(name, type, parent, content) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        this.content = content;
    }
}

const consolePrefix = 'user@cptr > ';
const consoleLog = new Array();
const commands = new Array();

const headFile = new File('home', 'dir', null, new Array());

let currentFile = headFile;
let currentConsoleInput = '';

function setup() {
    createCanvas(1280, 720);
    textFont('monospace');
    textSize(18);

    commands.push(new Command('help', function(inputs) {
        if (inputs.length > 0) {
            return ['No help available for ' + inputs.join(' ')];
        } else {
            return ['No help available'];
        }
    }));

    commands.push(new Command('ls', function(inputs) {
        if (inputs.length > 0) {
            return ['Cannot list ' + inputs.join(' ')];
        } else {
            let output = new Array();
            let path = '/';
            let file = currentFile;
            while (file) {
                path = '/' + file.name + path;
                file = file.parent;
            }
            output.push('Content of ' + path);

            for (file of currentFile.content) {
                output.push('\t' + file.name);
            }
            return output;
        }
    }));

    commands.push(new Command('cd', function(inputs) {
        if (inputs.length != 1) {
            return ['Invalid arguments ' + inputs.join(' ')];
        } else {
            if (inputs[0] === '..') {
                if (currentFile.parent) {
                    currentFile = currentFile.parent;
                    return ['Okay'];
                }
            } else {
                for (file of currentFile.content) {
                    if (file.name === inputs[0]) {
                        if (file.type === 'dir') {
                            currentFile = file;
                            return ['Okay'];
                        } else {
                            return [inputs[0] + ' is not a directory'];
                        }
                    }
                }
            }
            return ['Not found'];
        }
    }));

    commands.push(new Command('view', function(inputs) {
        if (inputs.length != 1) {
            return ['Invalid arguments ' + inputs.join(' ')];
        } else {
            for (file of currentFile.content) {
                if (file.name === inputs[0]) {
                    if (file.type === 'txt') {
                        let output = new Array();
                        output.push('Content of ' + file.name);
                        for (line of file.content) {
                            output.push(line);
                        }
                        return output;
                    } else {
                        return [inputs[0] + ' cannot be viewed'];
                    }
                }
            }
            return ['Not found'];
        }
    }))

    headFile.content.push(new File('misc', 'dir', headFile, new Array()));
    headFile.content.push(new File('notes', 'txt', headFile, ['I saw him again', 'In the night', 'I saw him clearly']));
}

function draw() {
    background(0);
    fill(0, 255, 0);

    let y = 20;
    for (line of consoleLog) {
        text(line, 10, y, width - 20);
        y += ceil(textWidth(line) / (width - 20)) * 25;
    }

    fill(200);
    text(consolePrefix, 10, y, width - 20);

    let input = currentConsoleInput;
    if (floor(frameCount / 30) % 2 === 0) {
        input += '_';
    }

    fill(0, 255, 0);
    text(input, 10 + textWidth(consolePrefix), y);
}

function keyTyped() {
    if (keyCode !== ENTER) {
        currentConsoleInput += key;
    }
}

function keyPressed() {
    if (keyCode === BACKSPACE) {
        currentConsoleInput = currentConsoleInput.substring(0, currentConsoleInput.length - 1);
    } else if (keyCode === ENTER) {
        consoleLog.push(consolePrefix + currentConsoleInput);

        let input = currentConsoleInput.trim().split(' ');
        currentConsoleInput = '';

        for (command of commands) {
            if (command.name === input[0]) {
                let output = command.execFunction(input.slice(1, input.length));
                if (output) {
                    for (line of output) {
                        consoleLog.push(line);
                    }
                }
                return;
            }
        }

        consoleLog.push('Invalid command');
    }
}