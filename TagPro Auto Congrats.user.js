// ==UserScript==
// @name         TagPro Auto Congrats
// @version      3.0
// @description  A script to automatically congratulate balls when they level up with customizabl messages.  Original script by ProfessorTag, modified by Pavel_Bure. (https://www.reddit.com/r/TagPro/comments/348nbh/userscript_autocongratulate_players_when_they/)
// @include      http://*.koalabeast.com:*
// @include      http://*.jukejuice.com:*
// @include      http://*.newcompte.fr:*
// @grant        none
// ==/UserScript==


/*********************************************************************/
/*
    INSTRUCTIONS
    ------------
    Alter the variable and messages in this section to your desired state.  Most are self-descriptive.
    
    messages
    
    ONLY 70 CHARACTERS CAN BE SENT AT ONCE!
    anymore than 70 and the script will fire, the message will be logged to the javascript console, but it will not actually be sent in game
    Playernames can be 12 characters max, levels can be 4 characters max (three numbers plus the ° symbol)
    Account for these when creating your messages
    
    There are Four types of messages:
    
        baseMessage is a message that will be sent prior to every congratulatory message sent.  If you don't want to use this, set to '' or false
        generalCustomMessages are sent when there is no existing playerSpecificMessages or levelSpecificMessages - chosen randomly from the array of responses
        playerSpecificMessages can be entered on a per player basis and are sent when the matching player levels up
        levelSpecificMessages are sent when a player reaches the corresponding level
        
    by default playerSpecificMessages override levelSpecificMessages.  Change the "levelOverridesPlayer" variable to true to change this behavior
    
*/

//User variables

var testMode = true;               // When set to true script will trigger when a player makes the congratulations announcement.  When set to false only system messages will trigger the script
var myName = 'Pavel';              // This can be whatever you like - typically set to your playername or a nickname
var levelOverridesPlayer = false;  // If set to true, levelSpecificMessages take precedence over playerSpecific messages

/******** Messages ********/
/* 
    Messages can be 70 characters long.  
    Anything longer and it will not be sent.  
    Players' names can be 12 characters max, levels can be 4 characters max.  
    Budget for these when creating your messages.
*/
    
// "%PLAYERNAME%" will be replaced by the player's name
// "%LEVEL%" will be replaced by the level they acheived
// %MYNAME% will be replaced by the myName variable set above

// Base message will be sent first anytime the script is triggered.  set to '' or false if you don't want to use this
var baseMessage = 'Grats %PLAYERNAME% on %LEVEL%! ';


// Add general custom messages here observing proper javascript syntax
var generalCustomMessages = [
    'YAY %PLAYERNAME%! You are the best!',
	'%PLAYERNAME%... You are my favoritest ball',
	'...Now maybe you will play better',
	'You are my hero  %PLAYERNAME%.',
	'Hopefully we all get on your level soon.',
	'%PLAYERNAME% is %MYNAME%\'s bestest ball',
	'I can\'t even count that high...',
    'Please accept my heartfelt congrats. This is definitely not a macro'
    ];
    
var playerSpecificMessages = [];
playerSpecificMessages['BRISKET'] = 'Brisket, you are looking tastier by the day';
playerSpecificMessages['Sansa Stark'] = 'Sooo Sansa... how\'s that thing with Ramsey going?';
playerSpecificMessages['Hodor'] = 'HODOR! The one true king of Westeros';

var levelSpecificMessages = [];
levelSpecificMessages[1] = '1°... I guess we all gotta start somewhere';
levelSpecificMessages[3] = 'Three oh it\'s the magic number. Yeah it is.  It\'s the magic number';
levelSpecificMessages[10] = '#10 is Pavel Bure\'s number';
levelSpecificMessages[42] = '42° blaze it %PLAYERNAME%';
levelSpecificMessages[42] = '69, heh.';
levelSpecificMessages[96] = '#96 was Pavel Bure\'s alternate number';
levelSpecificMessages[96] = '99 - the great one';
levelSpecificMessages[100] = '100°! Holy shit that\'s more than 99!';
/*********************************************************************/


tagpro.ready(function() {


    var messageQueue = [];
    
    tagpro.socket.on('chat', function(e) {
        if (e.from === null || testMode === true) {
            pname = e.message.match(/^.+(?= has reached)/);
            level = e.message.match(/\d+[°D]$/);
            if(pname && level){
                if(baseMessage !== '' && baseMessage !== false) { 
                    messageQueue.push(cleanMessage(baseMessage, pname, level)); 
                    console.log('messageQueue.length=' + messageQueue.length + ' ADDED: ' + messageQueue[messageQueue.length - 1]);
                }
                messageQueue.push(cleanMessage(selectMessage(name, level), pname, level));
                console.log('messageQueue.length=' + messageQueue.length + ' ADDED: ' + messageQueue[messageQueue.length - 1]);
            }
        }
    });
    
    tagpro.socket.on('end', function() {    
        setTimeout(function() {   
            console.log('End of Game messageQueue.length=' + messageQueue.length);
            var i = 0;
            messageQueue.forEach(function(message) {
                setTimeout(function(){ tagpro.socket.emit('chat', { message: message, toAll: true });  }, i * 1000);
                i++;
            });
        }, 1000);  
    });
    
    function selectMessage(name, level) {
        level = parseInt(level);
        if(name in playerSpecificMessages) { 
            message = playerSpecificMessages[name]; 
        } else if (level in levelSpecificMessages || (levelOverridesPlayer === true && name in playerSpecificMessages)) {
            message = levelSpecificMessages[level];
        } else {
            message = generalCustomMessages[randomIntFromInterval(1, generalCustomMessages.length - 1)];
        }    
        return(message); 
    }
    
    // takes a message, player name, and level and replaced items defined below
    function cleanMessage(theMessage, pName, pLevel) {
        theMessage = theMessage.replace(/%PLAYERNAME%/g, pName);
        theMessage = theMessage.replace(/%LEVEL%/g, pLevel);
        theMessage = theMessage.replace(/%MYNAME%/g, myName);
        return(theMessage);
    }

    // Takes a min number and max number and returns random number inbetween (inclusive)
    function randomIntFromInterval(min,max){ return(Math.floor(Math.random()*(max-min+1)+min)); }
});