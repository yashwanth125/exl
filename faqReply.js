  
const {WaterfallDialog, ComponentDialog, } = require('botbuilder-dialogs');
const {ConfirmPrompt, ChoicePrompt, TextPrompt, ActivityPrompt, DialogSet, NumberPrompt, DialogTurnStatus } = require('botbuilder-dialogs');
const {CardFactory, ActivityHandler, MessageFactory} = require('botbuilder');

const v7 = require('./images/7.json')
const v5 = require('./images/5.json')
const v8 = require('./images/8.json')

var ACData = require("adaptivecards-templating");
var nodemailer = require('nodemailer');
const mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yarase234@gmail.com',
        pass: 'vit@2021'
    }
});
var template = new ACData.Template(v8);
const axios = require('axios');
const { ActivityTypes} = require('botbuilder');

const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CARD_PROMPT = 'CARD_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

var endDialog ='';
var intent_lan;


class FaqReply extends ComponentDialog 
{
    constructor(userState)
    {
        super('faqReply');
        this.addDialog(new ActivityPrompt(CARD_PROMPT, this.inputValidator));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
        
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
            this.ipdStep.bind(this)
            // Show summary of values entered by user and ask confirmation to make reservation
            ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }
   async run(turnContext, accessor,ln)
   {
       intent_lan=ln;
       const dialogSet = new DialogSet(accessor);
       dialogSet.add(this);
       const dialogContext = await dialogSet.createContext(turnContext);
       const results = await dialogContext.continueDialog();
       if (results.status === DialogTurnStatus.empty){
           await dialogContext.beginDialog(this.id);
        }
    }
    
async firstStep(step) 
{
    step.values.lang=intent_lan;
    endDialog = false;
    await step.context.sendActivity({attachments: [CardFactory.adaptiveCard(v7)]});
    return await step.prompt(CARD_PROMPT);
}
async ipdStep(step)
{
    var pidResult;
    endDialog = false;
    await step.context.sendActivities([
        { type: ActivityTypes.Typing },
        { type: 'delay', value: 2000 }]); 
    console.log(step.result.value)
    var query = step.result.value.date;
    query = query.split("-").reverse().join("-");
    console.log(query)
    query = query.toString()
    var query2 = step.result.value.number;
    query2 = query2.toString();
    let mailDetails = {
        from: 'yarase234@gmail.com',
        to: 'yashwanth.sonub@gmail.com',
        subject: 'EY-bot',
        text: query2
      };
      mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs');
        } else {
            console.log('Email sent successfully');
        }
    });
    //await step.context.sendActivity(query2)
    //await step.context.sendActivity(query)
    //let config = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=' + query2 + '&date=' + query;
    let config='https://covidbotby.azurewebsites.net/test2'
    console.log(config)
    

 
    var suggestion_request = await axios.get(config,{params: { answer: query2, answer2: query }})
    var k = suggestion_request.data;
    
  
    //await step.context.sendActivity(k['sessions'][0]['name'])
    //await step.context.sendActivity(k)
    //console.log(k['sessions'])
    if( k.error)
    {
        if(step.values.lang=='ta')
        {
            await step.context.sendActivity(`😶மன்னிக்கவும் அவை ${query2} இல் தடுப்பூசி மையங்கள் இல்லை`)
        }
        else if(step.values.lang=='te')
        {
            await step.context.sendActivity(`😶 క్షమించండి, ${query2} వద్ద టీకా కేంద్రాలు లేవు`)
        }
        else if(step.values.lang=='en')
        {
            await step.context.sendActivity(`😶 Sorry Their are no Vaccination Centers at ${query2}`)
        }
        else if(step.values.lang=='kn')
        {
            await step.context.sendActivity(`😶 ಕ್ಷಮಿಸಿ ಅವುಗಳು ${query2} ನಲ್ಲಿ ವ್ಯಾಕ್ಸಿನೇಷನ್ ಕೇಂದ್ರಗಳಿಲ್ಲ`)
        }
         
    endDialog = true;
    return await step.endDialog();
       // await step.context.sendActivity(`😶 Sorry Their are no Vaccination Centers at ${query2}`)
    }
    else if(k['sessions'].length ==0)
    {
        if(step.values.lang=='ta')
        {
            await step.context.sendActivity(`😶மன்னிக்கவும் அவை ${query2} இல் தடுப்பூசி மையங்கள் இல்லை`)
        }
        else if(step.values.lang=='te')
        {
            await step.context.sendActivity(`😶 క్షమించండి, ${query2} వద్ద టీకా కేంద్రాలు లేవు`)
        }
        else if(step.values.lang=='en')
        {
            await step.context.sendActivity(`😶 Sorry Their are no Vaccination Centers at ${query2}`)
        }
        else if(step.values.lang=='kn')
        {
            await step.context.sendActivity(`😶 ಕ್ಷಮಿಸಿ ಅವುಗಳು ${query2} ನಲ್ಲಿ ವ್ಯಾಕ್ಸಿನೇಷನ್ ಕೇಂದ್ರಗಳಿಲ್ಲ`)
        }
         
    endDialog = true;
    return await step.endDialog();
       // await step.context.sendActivity(`😶 Sorry Their are no Vaccination Centers at ${query2}`)
    }
    else
    {
        console.log(k['sessions'][0]['name'])
    for(var i in k['sessions'])
    {
        console.log(k['sessions'][i]['name'])
        console.log(k['sessions'][i]['available_capacity'])
        v5.properties.push(k['sessions'][i])
       
    }
    if(step.values.lang=='en')
    {
        v5.city='Below are Vaccination Centers at '+query2;
    }
    else if(step.values.lang=='kn')
    {
        v5.city=query2+' ರಲ್ಲಿ ಲಸಿಕೆ ಕೇಂದ್ರಗಳನ್ನು ಕೆಳಗೆ ನೀಡಲಾಗಿದೆ';
    }
    else if(step.values.lang=='ta')
    {
        v5.city=query2+' இல் தடுப்பூசி மையங்கள் கீழே உள்ளன';
    }
    else if(step.values.lang=='te')
    {
        v5.city='క్రింద '+query2+' వద్ద టీకా కేంద్రాలు ఉన్నాయి';
    }
    
    var cardPayload2 = template.expand({
        $root: v5
     });
    //console.log(v5)
    await step.context.sendActivity({attachments: [CardFactory.adaptiveCard(cardPayload2)]});
    v5.city=''
    v5.properties=[]
    }
    //console.log(k)
    //await step.context.sendActivity(query)
    
    
    endDialog = true;
    return await step.endDialog();

    }

    



    

async inputValidator(promptContext)
{
    const userInputObject = promptContext.recognized.value.value;
    return true;
}
async isDialogComplete(){
    return endDialog;
}
async sendSuggestedActions(turnContext) {
    var reply = MessageFactory.suggestedActions(['FAQ','Ip Information'],'What would you like to know?');
    await turnContext.sendActivity(reply);
}

    
}

module.exports.FaqReply = FaqReply;
