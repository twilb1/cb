
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if ('SpeechRecognition' in window) {
    // speech recognition API supported
} else {
    console.log("Speech Recognition is not Supported in your Browser. Try using Chrome.");
};

var xhr = new XMLHttpRequest();
var data;

var v_enable = new Boolean;
let bot = new RiveScript();

const message_container = document.querySelector('.messages');
const form = document.querySelector('form');
const input_box = document.querySelector('input');
var userreq_log = "";
var botresp_log = "";

const brains = [
    'brain_r.rive'
];

const recognition = new SpeechRecognition();  // Declare a speech recognition object 
recognition.lang = 'en-UK';
var synth = window.speechSynthesis;           // Declare new speech synthesis object

// $(document).ready(function() { }           // Not used; yet at least! :-)

let checkbox = document.querySelector("input[name=checkbox]");  // in HTML file ensure ref to JS file is at EOF
checkbox.addEventListener( 'change', function() {
if(this.checked) {
   v_enable = true;
   window.begin_voice();
} else {
    v_enable = false;
    window.end_voice();
}
// console.log(v_enable);
});

/* let v_button = document.querySelector("button[name=btn]"); 
v_button.addEventListener('click', function(){
    {
        if(this.value==1){
            this.value=0;
            v_enable = false;
            window.begin_voice();}      
        else if(this.value==0){
            this.value=1;
            v_enable = true;
            window.end_voice();}
      }
});*/


function begin_voice(){                 // Only called when v_enable is True
    console.log(v_enable);
    recognition.interimResults = true;  // Capture interim results for better voice recognition
    recognition.continuous = true;      // If this is not true; recognition stops after one user utterance

//    var finalTranscripts = '';          
    recognition.onresult = function(event){
        let finalTranscripts = '';
        let interimTranscripts = '';
        for(var i = event.resultIndex; i < event.results.length; i++){
            var transcript = event.results[i][0].transcript;
            if(event.results[i].isFinal){
                finalTranscripts += transcript;
                selfReply(transcript);              // Populate the user dialog box with the recognized text
            }else{
                interimTranscripts += transcript;
            }
        }
    };

    // Event listener for the end event of voice recognition
    recognition.addEventListener('end', recognition.end)
    recognition.start();
}

function end_voice(){
    recognition.stop();
}

bot.loadFile(brains).then(botReady).catch(botNotReady);

form.addEventListener('submit', (e) => {
        e.preventDefault();
        selfReply(input_box.value);             // The user utterance
        input_box.value = '';                   // Reset the text in the user utterance box
    });

function botReply(message){
    botresp_log = message;      // Bot reply message to log in the db
    message_container.innerHTML += `<div class="bot">${message}</div>`;
    location.href = '#edge';
    if(v_enable == true){
        var voices = window.speechSynthesis.getVoices();
        var utterThis = new SpeechSynthesisUtterance(message);
        utterThis.voice = voices[1];                             // Here's where we can change the voice 
        // Stop recognition while bot is speaking
        var t;
        utterThis.onstart = function (event) {
            recognition.stop();
//            t = event.timeStamp;
//            console.log(t);
            document.querySelector("input[name=checkbox]").disabled = true;
        };
        utterThis.onend = function (event) {
            t = event.timeStamp - t;
//            console.log(event.timeStamp);
//            console.log((t / 1000) + " seconds");
            recognition.start();
 //           console.log(recognition.start);
            document.querySelector("input[name=checkbox]").disabled = false;
        };
        synth.speak(utterThis);                                 // Create an utterance object and speak it
        // This is where we need to send the POST request to the server with current user request and cbot reply
    }
    console.log("User: " + userreq_log);
    console.log("Cbot: " + botresp_log);
    postDialog();
    input_box.focus();      // Set the focus to the input box to avoid user having to click in it each time
}

function selfReply(message){
    userreq_log = message;  // This is the user text to add to the log entry in the db
//    console.log("Cbot response: " + botresp_log);
//    console.log("User dialog: " + userreq_log);
    message_container.innerHTML += `<div class="self">${message}</div>`;
    location.href = '#edge';
    bot.reply("local-user", message).then(function(reply) {     // The rivescript response
        botReply(reply); });
}

function botReady(){
    bot.sortReplies();
    botReply('Hello');
}

function botNotReady(err){
    console.log("An error has occurred.", err);
}

// postDialog();
function postDialog(){
//    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/dialog";
//    var data = "email=hey_mail.com&password=101010";
//    var data = "[{'email':'hey_mail.com','password':'101010'}]"
    data = "user=" + userreq_log + "&" + "cbot=" + botresp_log;
//    console.log(data);
    
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // do something with response
            console.log(xhr.status);
//            console.log(xhr.responseText);
        }
   };
   xhr.send(data);


//    const xhr = new XMLHttpRequest();
//    xhr.onload = function(){               // Takes care of the server response first
//        console.log(this.responseText);
//    };
//    xhr.open("POST","http://127.0.0.1:3000/dialog");
//    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//    xhr.send("user=userreq&cbot=botresp");
//    xhr.onreadystatechange = (e) =>{
//        console.log(xhr.responseText);
//    };
}