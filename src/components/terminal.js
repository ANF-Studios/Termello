"use strict";
const cmds = require("../components/commands.class");
const c = cmds.CMDS;

const {ipcMain} = require("electron").remote;
const electron = require("electron").remote;

// UTILITY

// Allows for theme toggling
ipcMain.on("theme", function(e, arg){
    ToggleTheme(arg);
})

// Entering a span element allows for styling
function span(classname, message_){
    return "<span class=\"" + classname + "\">" + message_ + "</span>"
}
// END UTILITY


const termwindow = $(".window");
const termwindow_ = document.querySelector(".window"); // This is here to get the clear command working

const path =  electron.app.getAppPath();
const prompt_ = ">";
let command = "";

// Get online status (for external links)
let onlinestatus = navigator.onLine ? span("status-success", "Online" + "\n") : span("status-fail", "Offline" + "\n"); // gets whether app is online or not
let status = span("title", "Emulator Status: ") + onlinestatus;

// Get release version
let version = electron.app.getVersion();
let appversion = span("title", "Termello v" + version + "\n");

//TODO Move these to commands class
// List of commands
const commands = [{
    "name": "clear",
    "function": c.clear,
    "description": "Clears the terminal"
}, {
    "name": "help",
    "function": c.help,
    "description": "Displays commands"
}, {
    "name": "echo",
    "function": c.echo,
    "description": "Returns string given"
}, {
    "name": "exit",
    "function": c.exit,
    "description": "Exits the application"
}, {
    "name": "whoami",
    "function": c.whoami,
    "description": "Displays info about user (not yet implemented)"
}, {
    "name": "kill",
    "function": c.kill,
    "description": "Kills running command (not yet implemented)"
}, {
    "name": "whatis",
    "function": c.whatis,
    "description": "Displays help about a single command"
}];
// End commands

let commandHistory = [];
let historyIndex = 0;

// Functions for making the terminal do its job
function processcommand(){
    let isValid = false;

    let args = command.split(" ");
    let cmd = args[0];
    args.shift();

    // Iterate through the available commands to find a match.
    // Then call that command and pass in any arguments.
    for (let i = 0; i < commands.length; i++) {
        // Process the command
        if (cmd === commands[i].name) {
            commands[i].function(args);
            isValid = true;
            break;
        }
    }

    if (!isValid) {
        termwindow.append(span("status-fail", "Command not found: " + command + "\n"));
    }

    // Add to command history and clean up
	commandHistory.push(command);
	historyIndex = commandHistory.length;
	command = "";
}

function appendcommand(str){
    termwindow.append(str);
    command += str;
}

function clearcommand(){
    if (command.length > 0){
        erase(command.length);
    }
}

function erase(n){
    command = command.slice(0, -n);
    termwindow.html(termwindow.html().slice(0, -n));
}
// End console functionality


// Allows backspacing
document.addEventListener("keydown", function(e){
    e = e || window.Event;
    let key = typeof e.which === "number" ? e.which : e.key;
    if (key == 8) {
        console.log(command)
        e.preventDefault();
        if (command !== "" && command !== "\n") {
            erase(1);
        }
        termwindow_.scrollBy({
                top: termwindow_.scrollHeight,
                behavior: "smooth"
            })
    }
    // Allows moving through command history
	if (key === 38 || key === 40) {
        // Move up or down the history
        // Up key
        if (key === 38) {
            historyIndex--;
            if (historyIndex < 0) {
                historyIndex++;
            }
        } 
        // Down key
        else if (key === 40) {
            historyIndex++;
            if (historyIndex > commandHistory.length - 1) {
                historyIndex--;
            }
        }

        // Get command
        var cmd = commandHistory[historyIndex];
        if (cmd !== undefined) {
            console.log(cmd);
            clearcommand();
            appendcommand(cmd);
        }
        termwindow_.scrollBy({
            top: termwindow_.scrollHeight,
            behavior: "smooth"
        })
    }
})

// Allows typing
document.addEventListener("keypress", function(e){
    e = e || window.Event;
    let key = typeof e.which === "number" ? e.which : e.key;
    switch (key){
        case 13:
            termwindow.append("\n");
            if (command.trim().length !== 0){
                processcommand();
            }
            displayprompt();
            termwindow_.scrollBy({
                top: termwindow_.scrollHeight,
                behavior: "smooth"
            })
            break;
        default:
            e.preventDefault();
            appendcommand(String.fromCharCode(key));
            termwindow_.scrollBy({
                top: termwindow_.scrollHeight,
                behavior: "smooth"
            })
    }
})
// End typing

// Displays "$ ~ in the console (default for now until file paths work)"
function displayprompt(){
    termwindow.append(span("path", path));
    termwindow.append(span("prompt", prompt_));
    termwindow_.scrollBy({
        top: termwindow_.scrollHeight,
        behavior: "smooth"
    })
}

// Some startup stuffs
function startterminal(){
    termwindow.append(span("title", appversion + "- Electron 11.1.0\n"));
    termwindow.append(status);
    termwindow.append(span("message", "For commands type: help (note: not all commands will be functional)\n"))
    displayprompt();
}

startterminal();