//Whenever create task checkbox gets checked for case on an account a followup task should be automatically created on primary contact of Account
trigger CreateFollowupTaskOnPrimaryContact on Case (after insert) {
    list<Task> tasklist = new List<Task>();
    set<Id> accId = new set<Id>();
    for(Case cs:Trigger.new){
        if(Trigger.newMap.get(cs.Id).Create_Task__c != Trigger.oldMap.get(cs.Id).Create_Task__c && cs.Create_Task__c==true){
            accId.add(cs.AccountId);
        }
    }
    Map<Id,Account> accMap = new Map<id,Account>([select id,primarycontactid__c from Account where id=:accId]);
    for(Case cs:Trigger.new){
        if(Trigger.newMap.get(cs.Id).Create_Task__c != Trigger.oldMap.get(cs.Id).Create_Task__c && cs.Create_Task__c==true){
            Account ac= accMap.get(cs.AccountId);
            Task ts = new Task();
            ts.subject='followup on case '+cs.caseNumber;
            ts.whatId=ac.primarycontactid__c;
            ts.priority='Medium';
            ts.ActivityDate = system.today().addDays(1);
            tasklist.add(ts);
        }
    }
    if(!tasklist.isEmpty()){
        insert tasklist;
    }
    
}