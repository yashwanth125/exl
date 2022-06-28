
const { ActivityHandler, MessageFactory } = require('botbuilder');
const { ActivityTypes} = require('botbuilder');
const { CardFactory } = require('botbuilder');
const e0 = require('./images/1.json')
const v7 = require('./images/7.json')
const { PidDetail} = require('./pidDetail')
const { VehicleInsurance} = require('./vehicleInsurance')
const { Vaccine} = require('./vaccine')
var nodemailer = require('nodemailer');
const axios = require('axios');
const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yarase234@gmail.com',
        pass: 'vit@2021'
    }
});
// var DetectLanguage = require('detectlanguage');
// var detectlanguage = new DetectLanguage('81fbb0cbd00bea9dad0de2c9b9e8526e');
  
require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');
var similarity = require( 'compute-cosine-similarity' );

class EchoBot extends ActivityHandler {
    constructor(conversationState, userState) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.pidDetail = new PidDetail(this.conversationState, this.userState);
        this.vehicleInsurance = new VehicleInsurance(this.conversationState, this.userState);
        this.vaccine = new Vaccine(this.conversationState, this.userState);
        this.previousIntent = this.conversationState.createProperty("previousIntent");
        this.conversationData = this.conversationState.createProperty('conservationData');

        this.onMessage(async (context, next) => {
            await this.onTurn(context);
            await next();
        });

        this.onDialog(async (context, next) => {
          // Save any state changes. The load happened during the execution of the Dialog.
          await this.conversationState.saveChanges(context, false);
          await this.userState.saveChanges(context, false);
          await next();
      });   

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            // await context.sendActivity({attachments: [CardFactory.adaptiveCard(e0)]});
            await context.sendActivity(welcomeText);
            await next();
        });
    }
    async sendSuggestedActions(turnContext) {
      var reply = MessageFactory.suggestedActions(['Health Insurance','Car Insurance']);
      await turnContext.sendActivity(reply);
  }
  
    async determineReply(intent, turnContext){
        //get the intent name
        var intent_value = intent.intent;
        var reply;
        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(turnContext,{});
        const conversationData = await this.conversationData.get(turnContext,{});  
        console.log('conversationData')
        console.log(conversationData)
        if(previousIntent.intentName && conversationData.endDialog === false )
        {
          currentIntent = previousIntent.intentName;
        }
        else if (previousIntent.intentName && conversationData.endDialog === true)
        {
          currentIntent = intent_value;
        }
        else
        {
          currentIntent = intent_value;
          await this.previousIntent.set(turnContext,{intentName: intent_value});
        }
        console.log('current intent')
        console.log(currentIntent) 
        switch (currentIntent) {
          case 'Vaccination Centers':
            await this.conversationData.set(turnContext,{endDialog: false});
            await this.vaccine.run(turnContext,this.dialogState,intent.ln);
            conversationData.endDialog = await this.vaccine.isDialogComplete();
            console.log("conversation  "+conversationData.endDialog)
            if(conversationData.endDialog)
            {
              await this.previousIntent.set(turnContext,{intentName: null});
              await this.sendSuggestedActions(turnContext);
              console.log('completed')
            }
            break;
          case 'Hi':
            reply = "Hello! I'm a Virtual bot and I can help you get the Best Insurance for you!";
              await turnContext.sendActivity(MessageFactory.text(reply,reply));
              conversationData.endDialog = true;
              await this.previousIntent.set(turnContext,{intentName: null});
              await this.sendSuggestedActions(turnContext);
              break;
          case 'Bye':
            reply = "Thanks, have a good day";
                
                await turnContext.sendActivities([
                  { type: ActivityTypes.Typing },
                  { type: 'delay', value: 2000 }]); 
                await turnContext.sendActivity(reply);
                conversationData.endDialog = true;
                await this.previousIntent.set(turnContext,{intentName: null});
                await this.sendSuggestedActions(turnContext);
                break;
          case 'Health Insurance':
                console.log('Health Insurance'+intent.ln)
                await this.conversationData.set(turnContext,{endDialog: false});
                await this.pidDetail.run(turnContext,this.dialogState,intent.ln);
                conversationData.endDialog = await this.pidDetail.isDialogComplete();
                console.log("conversation  "+conversationData.endDialog)
                if(conversationData.endDialog)
                {
                  await this.previousIntent.set(turnContext,{intentName: null});
                  await this.sendSuggestedActions(turnContext);
                  console.log('completed')
                }
                break;

          case 'car insurance':
                console.log('car Insurance'+intent.ln)
                await this.conversationData.set(turnContext,{endDialog: false});
                await this.vehicleInsurance.run(turnContext,this.dialogState,intent.ln);
                conversationData.endDialog = await this.vehicleInsurance.isDialogComplete();
                console.log("conversation  "+conversationData.endDialog)
                if(conversationData.endDialog)
                {
                  await this.previousIntent.set(turnContext,{intentName: null});
                  await this.sendSuggestedActions(turnContext);
                  console.log('completed')
                }
                break;
          case 'unkown':
            console.log('inside unknown')
            reply="😶 Sorry I can't understand your Input. Please Rephrase it again";
              // await turnContext.sendActivities([
              //   { type: ActivityTypes.Typing },
              //   { type: 'delay', value: 2000 }]); 
            await turnContext.sendActivity(MessageFactory.text(reply));
            conversationData.endDialog = true;
            await this.previousIntent.set(turnContext,{intentName: null});
            await this.sendSuggestedActions(turnContext);
            break;
         }
         return reply;
    
      }
    

    determineIntent(utterance){
        console.log("received within the  fn.");
        console.log(utterance); 
        var detectedIntent;
        var options = { method: 'POST',
            //url: 'https://ellora-botws-poc.apps1-fm-int.icloud.intel.com/v1/nlp',
            url:this.NLP_Service,
            rejectUnauthorized:true,
            strictSSL:false,
            headers: 
            { 
              'content-type': 'application/json' },
            body: 
            { application: 'eeb80de94f97333620398bbfbfbb129b',
              msg:utterance,
              environment: 'development' },
            json: true 
         };
        var determinedIntent; //=  new Promise((resolve, reject) => {
        return new Promise((resolve, reject) => {  request(options, function (error, response, body) {
            if (error) {
                reject(error);
            } else {
                resolve(body.intent);
            }        
        });  
        });
  
      }      
     
  
    async onTurn(turnContext) 
    {
        var intentofUtterance;
        var intent,reply,score;

        if (turnContext.activity.type === ActivityTypes.Message) 
        {
          //let res = await cal.determine(turnContext.activity.text);
         // console.log(res)
         // console.log(turnContext.activity.value.name)
         var detected_language='en';
         
         if(turnContext.activity.text)
         {
           turnContext.activity.text=turnContext.activity.text.toLowerCase();
          //  await detectlanguage.detect(turnContext.activity.text).then(function(result) {
          //   detected_language=result[0].language;
          //});
         }
         var d;
        if(turnContext.activity.text)
        {
          d=turnContext.activity.text;
        }
        else if (turnContext.activity.value.name)
        {
          d=turnContext.activity.value.name;
        }
        else
        {
          d='unkown'
        }
        console.log('turncontext',turnContext.activity.text);
        //console.log(turnContext.activity)
        //var suggestion_request = await axios.get('https://onnx-docker.azurewebsites.net/intent',{params: {data: d}});
        console.log(d)
  
          switch (d) 
          {
            case 'help':
              intent = { score: 1.0, intent: 'help' };
              break;
            case 'feedback':
              intent = { score: 1.0, intent: 'Feedback' };
              break;
            case 'hi':
              intent = { score: 1.0, intent: 'Hi', ln: detected_language };
              break;
            case 'bye':
              intent = { score: 1.0, intent: 'Bye' };
              break;
            case 'health insurance':
              intent = { score: 1.0, intent: 'Health Insurance',ln: detected_language };
              break;
            case 'car insurance':
              intent = { score: 1.0, intent: 'car insurance',ln: detected_language };
              break;
            case 'vaccine':
              intent = {score:1.0, intent: 'Vaccination Centers',ln: detected_language}
              break;
            default:
            intent = {score: 1.0, intent: 'unkown', ln: detected_language}
            
          }    
          console.log("Determined Intent");
          console.log(intent);
          console.log("reply");
          //await this.determineReply(intent.intent,turnContext);
          //console.log(intent);
          // let mailDetails = {
          //   from: 'yarase234@gmail.com',
          //   to: 'yashwanth.sonub@gmail.com',
          //   subject: 'EY-bot',
          //   text: (turnContext.activity.text || turnContext.activity.value.name)
          // };
        //   mailTransporter.sendMail(mailDetails, function(err, data) {
        //     if(err) {
        //         console.log('Error Occurs');
        //     } else {
        //         console.log('Email sent successfully');
        //     }
        // });
        
          if(intent)
          {
            var repl='git'
            console.log(repl)
            await turnContext.sendActivity(MessageFactory.text(repl));
            await turnContext.sendActivity(repl);
            console.log('inside')
            reply = await this.determineReply(intent,turnContext);
            console.log(reply);
            //this.logger.LogData(turnContext.activity.from.properties.idsid,turnContext.activity.from.properties.domain, process.env.applicationID, turnContext.activity.channelId, 'RASA', turnContext.activity.conversation.id, intentofUtterance, score, 'INFO', turnContext.activity.text, reply, 'true');
            //await turnContext.sendActivity(reply);
          }  
          else
          {
            await turnContext.sendActivity("😶 Sorry I can't understand your Input. Please Rephrase it again");
          }
        } else if (turnContext.activity.type === ActivityTypes.ConversationUpdate &&
            turnContext.activity.from.id === turnContext.activity.membersAdded[0].id) {
            await turnContext.sendActivity('Hi ' + turnContext.activity.from.name + '\nWelcome to the  Virtual Assistance Centre support! Ask me a question and I will try to answer it.');
            }    
      }   
}

module.exports.EchoBot = EchoBot;
