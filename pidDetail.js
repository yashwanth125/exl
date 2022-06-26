const {WaterfallDialog, ComponentDialog, } = require('botbuilder-dialogs');
const {ConfirmPrompt, ChoicePrompt, TextPrompt, ActivityPrompt, DialogSet, NumberPrompt, DialogTurnStatus } = require('botbuilder-dialogs');
const {CardFactory, ActivityHandler, MessageFactory} = require('botbuilder');
const axios = require('axios');
var https = require('https')

const e1 = require('./images/2.json')
const unknown = require('./images/3.json')
const health_ = require('./images/Health_checklist.json')
const form_ = require('./images/form.json')
const v5 = require('./images/5.json')
const mobile = require('./images/mobile.json');
const premium = require('./images/premium.json');
var intent_ln
var ACData = require("adaptivecards-templating");


var template = new ACData.Template(premium);

const { ActivityTypes} = require('botbuilder');
const { setgroups } = require('process');
const httpsAgent = new https.Agent({
    rejectUnauthorized: false // (NOTE: this will disable client verification)
  })
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
const CARD_PROMPT = 'CARD_PROMPT';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NUMBER_PROMPT = 'NUMBER_PROMPT';

var endDialog ='';
var mongo={};



class PidDetail extends ComponentDialog 
{
    constructor(userState)
    {
        super('pidDetail');
        this.addDialog(new ActivityPrompt(CARD_PROMPT, this.inputValidator));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT,this.noOfParticipantsValidator));
        
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.firstStep.bind(this),  // Ask confirmation if user wants to make reservation?
            this.ipdStep.bind(this),
            this.last_detail.bind(this),
            this.api.bind(this),
            this.final.bind(this),
            this.end.bind(this)
            // Show summary of values entered by user and ask confirmation to make reservation
            ]));
        this.initialDialogId = WATERFALL_DIALOG;
    }
   async run(turnContext, accessor,ln)
   {
       const dialogSet = new DialogSet(accessor);
       dialogSet.add(this);
       intent_ln=ln;
       const dialogContext = await dialogSet.createContext(turnContext);
       const results = await dialogContext.continueDialog();
       if (results.status === DialogTurnStatus.empty){
           await dialogContext.beginDialog(this.id);
        }
    }
    
async firstStep(step) 
{
    step.values.lang=intent_ln;
    endDialog = false;
    return await step.prompt(CHOICE_PROMPT, {
        prompt: 'Do you want to know the Check list for Health Insurance ?',
        choices:['Yes', 'No, I know it']
    });
}
async ipdStep(step)
{
    var q = step.result.value;
    if(q=='No, I know it')
    {
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Do you want to know the Check list for Health Insurance ?',
            choices:['Yes', 'No']
        });
    }
    else
    {
        await step.context.sendActivity({attachments: [CardFactory.adaptiveCard(health_)]});
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Do you want to know our Health Insurance Policies ?',
            choices:['Yes', 'No']
        });
    }
}

async last_detail(step)
{
    var q = step.result.value;
    if(q=='No')
    {
        endDialog = true;
        await step.context.sendActivity('Okay, Thank you have a nice Day');
        return await step.endDialog();
    }
    else
    {
        await step.context.sendActivity({attachments: [CardFactory.adaptiveCard(form_)]});
        return await step.prompt(CARD_PROMPT);
    }
}

async api(step)
{
    console.log(step.result.value);
    let config = 'https://3ooz0lh2ll.execute-api.us-east-1.amazonaws.com/development/exl_lambda'
    var get_results = await axios.get(config);
    console.log(get_results.data)
    for(var item in get_results.data)
    {
        v5.properties.push(get_results.data[item])
       
    }
    var cardPayload2 = template.expand({
        $root: v5
     });
     
    console.log(v5)
    await step.context.sendActivity({attachments: [CardFactory.adaptiveCard(cardPayload2)]});
    v5.properties=[]
    return await step.prompt(CHOICE_PROMPT, {
        prompt: 'Do you want to know the premiums?',
        choices:['Yes', 'No']
    });
}

async final(step)
{
    var q = step.result.value;
    if(q=='No')
    {
        await step.context.sendActivity('Thank you have a Nice Day');
        endDialog = true;
        return await step.endDialog();
    }
    else
    {
        await step.context.sendActivity({attachments: [CardFactory.adaptiveCard(mobile)]});
        return await step.prompt(CARD_PROMPT); 
    }
}

async end(step)
{
    await step.context.sendActivity('Okay, Our Client will reach out to you');
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
module.exports = {mongo}; 
module.exports.PidDetail = PidDetail;
