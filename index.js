require('dotenv-extended').load(); 
 
var builder = require('botbuilder'); 
var restify = require('restify'); 
var store = require('./store');
var spellService = require('./spell-service');
var format = require("string-template");
var compile = require("string-template/compile");



var policyTemplate = compile(
`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
### I have found the policy details for policy number - {0}  
** Details as follows:** \n\n

> Policy Name:    *{1}*\n
> Policy Duration: *{2}*\n
> Valid Upto: *{3}*\n
> Start Date: *{4}*\n
> End Date: *{5}*\n
> Premium Amount: *{6}*\n
> Currency: *{7}*\n
> Commission Amount: *{8}*
`);
 
 var accountTemplate = compile(
`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
### I have found the account details for account number - {0}  
** Details as follows: **

> Account Holder Name: *{1}*\n
> Registered Policies: *{2}*\n
> Create Date: *{3}*`);


// Setup Restify Server 
var server = restify.createServer(); 
server.listen(process.env.port || process.env.PORT || 3978, function () { 
console.log('%s listening to %s', server.name, server.url); 
}); 


// Create chat bot 
var connector = new builder.ChatConnector({ 
    appId: 'da3e0d65-87ce-4da4-b1cc-52e7cc8afa37', 
    appPassword: 'zBjPNi5W45gjuVAFKpcJ7jH'
}); 

var bot = new builder.UniversalBot(connector); 
server.post('/api/messages', connector.listen()); 

const LuisModelUrl = process.env.LUIS_MODEL_URL;

// Main dialog with LUIS 
var recognizer = new builder.LuisRecognizer(LuisModelUrl); 

bot.dialog('/', 
    //function(session){session.send('Hello I am bot')}
    new builder.IntentDialog({ recognizers: [recognizer] }) 
    .matches('Welcome', (session, args) => {
            session.send(`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
            Welcome to Policy Bot! What can i help you with?`); 
         }
     )
     .matches('bye', (session, args) => {
            session.send(`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
            Bye!! Take care..`); 
         }
     )
     .matches('Help', builder.DialogAction.send(`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
     Hi! Try asking me things like \'tell me about my policy\', \'tell me about my policy number xxxx\' or \'show me my account details\'`)) 
     .matches('PolicyQuery', [
        function (session, args, next) {
            session.send(`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
            I are analyzing your message: \'%s\'`, session.message.text);

            // try extracting entities
            var policyname = builder.EntityRecognizer.findEntity(args.entities, 'policyname');
            
            if (policyname) {
                // city entity detected, continue to next step
                session.dialogData.searchType = 'policy';
                next({ response: policyname.entity });
            } else {
                // no entities detected, ask user for a destination
                builder.Prompts.text(session, `![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
                Please enter your policy number`);
            }
        },
        function (session, results) {
            var policynumber = results.response;

            var message = 'Looking for policy number:' + policynumber;
            

            session.send(message);

            // Async search
            store
                .searchPolicy(policynumber)
                .then((policy) => {

                    if(policy){
                        var message = policyTemplate(policynumber, policy.policyname, policy.policyduration, policy.validupto, policy.startdate, policy.enddate, policy.premium, policy.currency, policy.commission);
                    }else{
                        message = `![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
                        Sorry!! Could not found policy data for policy number - ` + policynumber;
                    }
                    session.send(message);

                    // End
                    session.endDialog();
                });
        }
    ])
    .matches('accountquery', [
        function (session, args, next) {
            session.send(`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
            We are analyzing your message: \'%s\'`, session.message.text);

            // try extracting entities
            var accountnumber = builder.EntityRecognizer.findEntity(args.entities, 'accountno');
            
            if (accountnumber) {
                // city entity detected, continue to next step
                session.dialogData.searchType = 'account';
                next({ response: accountnumber.entity });
            } else {
                // no entities detected, ask user for a destination
                builder.Prompts.text(session, `![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
                Please enter your account number`);
            }
        },
        function (session, results) {
            var accountnumber = results.response;

            var message = 'Looking for account number:' + accountnumber;
            

            session.send(message);

            // Async search
            store
                .searchAccounts(accountnumber)
                .then((account) => {

                    if(account){
                        var message = accountTemplate(accountnumber, account.accountholdername, JSON.stringify(account.registeredpolicies, null, 4), account.createdate);
                    }else{
                        message = `![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
                        Sorry!! Could not found account data for account number - ` + accountnumber;
                    }
                    session.send(message);

                    // End
                    session.endDialog();
                });
        }
    ])
    .onDefault((session) => {
         session.send(`![GitHub Logo](https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTImzntu_iE5Q1GeA2mTZEjjs-tnHuqo2kpUvBiloo8jiR5WUzT4Q) 
         Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.`, session.message.text); 
     })
); 

if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(text => {
                    session.message.text = text;
                    next();
                })
                .catch((error) => {
                    console.error(error);
                    next();
                });
        }
    });
}

