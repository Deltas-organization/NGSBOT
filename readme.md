To get setup running locally you will need to setup a .env file with 

```
TOKEN=""
NGSToken=""
MongoURL=""
BotCommand="<"
```

The bot Command is how you test local builds without testing deployed builds, Current the deploy variable is >

For new seaons you need to go into the ```NGSDivisons.ts``` And Add/Remove divisions

For each change to the division list you will need to go to ```TeamSorter.ts``` and ```ChannelHelper.ts``` and adjust those with the new divisions

Go into the Mongo Database ```NGS.SeasonInformation``` Collection and insert a new record for the season number and the round number, Every sunday this will increment and is mostly used to notify the Mods about unscheduled games for the next week.

Go into ```LiveDataStore.ts``` and update the season to be the correct value.
